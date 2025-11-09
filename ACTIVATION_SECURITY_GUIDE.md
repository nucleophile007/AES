# Security Improvements for Account Activation

## Critical Improvements

### 1. Add Rate Limiting

```typescript
// In /app/api/auth/activate/route.ts
import { ratelimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success, remaining } = await ratelimit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' }, 
      { status: 429 }
    )
  }
  
  // ... rest of code
}
```

Create `/lib/rate-limit.ts`:
```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes
  analytics: true,
})
```

### 2. Improve Token Generation

Ensure tokens are cryptographically secure (in your admin panel):

```typescript
import crypto from 'crypto'

// Generate secure token
const token = crypto.randomBytes(32).toString('hex') // 64 character hex string
```

### 3. Add Password Strength Validation

```typescript
function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character (!@#$%^&*)' }
  }
  
  return { valid: true }
}
```

### 4. Prevent Timing Attacks

Make error responses take the same amount of time:

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  // Constant-time delay to prevent timing attacks
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  
  if (!token) {
    await delay(100) // Add consistent delay
    return NextResponse.json({ error: 'Invalid activation link' }, { status: 400 })
  }

  try {
    const activationRequest = await prisma.activationRequest.findUnique({
      where: { token }
    })

    if (!activationRequest || activationRequest.isUsed || new Date() > activationRequest.expiresAt) {
      await delay(100) // Same delay for all error cases
      return NextResponse.json({ error: 'Invalid or expired activation link' }, { status: 400 })
    }
    
    // ... success case
  } catch (error) {
    await delay(100)
    return NextResponse.json({ error: 'Invalid activation link' }, { status: 400 })
  }
}
```

### 5. Add HTTPS Enforcement

```typescript
export async function POST(request: NextRequest) {
  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    const protocol = request.headers.get('x-forwarded-proto')
    if (protocol !== 'https') {
      return NextResponse.json(
        { error: 'HTTPS required' }, 
        { status: 403 }
      )
    }
  }
  
  // ... rest of code
}
```

### 6. Add Request Origin Validation

```typescript
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    'https://www.acharyaes.com',
    'http://localhost:3000', // dev only
  ]
  
  if (process.env.NODE_ENV === 'production' && !allowedOrigins.includes(origin || '')) {
    return NextResponse.json(
      { error: 'Invalid origin' }, 
      { status: 403 }
    )
  }
  
  // ... rest of code
}
```

### 7. Log Activation Attempts

Add security logging:

```typescript
// Log all activation attempts
await prisma.securityLog.create({
  data: {
    event: 'ACTIVATION_ATTEMPT',
    userId: activationRequest.userId,
    userRole: activationRequest.role,
    success: true,
    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    timestamp: new Date(),
  }
})
```

### 8. Add Account Lockout

```typescript
// Check failed attempts
const failedAttempts = await prisma.failedActivation.count({
  where: {
    token,
    createdAt: {
      gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
    }
  }
})

if (failedAttempts >= 5) {
  return NextResponse.json(
    { error: 'Too many failed attempts. Please request a new activation link.' }, 
    { status: 429 }
  )
}
```

---

## Enhanced Code Example

Here's the improved POST endpoint:

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. HTTPS enforcement
    if (process.env.NODE_ENV === 'production') {
      const protocol = request.headers.get('x-forwarded-proto')
      if (protocol !== 'https') {
        return NextResponse.json({ error: 'HTTPS required' }, { status: 403 })
      }
    }

    // 2. Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { success } = await ratelimit.limit(`activate:${ip}`)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' }, 
        { status: 429 }
      )
    }

    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    // 3. Password strength validation
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 })
    }

    // 4. Check failed attempts
    const failedAttempts = await prisma.failedActivation.count({
      where: {
        token,
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }
      }
    })

    if (failedAttempts >= 5) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new activation link.' }, 
        { status: 429 }
      )
    }

    // Find activation request
    const activationRequest = await prisma.activationRequest.findUnique({
      where: { token }
    })

    if (!activationRequest) {
      // Log failed attempt
      await prisma.failedActivation.create({
        data: { token, ipAddress: ip, reason: 'TOKEN_NOT_FOUND' }
      })
      return NextResponse.json({ error: 'Invalid activation token' }, { status: 404 })
    }

    if (activationRequest.isUsed) {
      return NextResponse.json({ error: 'This activation link has already been used' }, { status: 400 })
    }

    if (new Date() > activationRequest.expiresAt) {
      return NextResponse.json({ error: 'This activation link has expired' }, { status: 400 })
    }

    // Hash password with higher cost factor
    const hashedPassword = await bcrypt.hash(password, 12) // Increased from 10

    // Update user based on role
    if (activationRequest.role === 'TEACHER') {
      await prisma.teacher.update({
        where: { id: activationRequest.userId },
        data: { password: hashedPassword, isActivated: true }
      })
    } else if (activationRequest.role === 'STUDENT') {
      await prisma.student.update({
        where: { id: activationRequest.userId },
        data: { password: hashedPassword, isActivated: true }
      })
    } else if (activationRequest.role === 'ADMIN') {
      await prisma.admin.update({
        where: { id: activationRequest.userId },
        data: { password: hashedPassword }
      })
    }

    // Mark as used
    await prisma.activationRequest.update({
      where: { id: activationRequest.id },
      data: { isUsed: true, usedAt: new Date() }
    })

    // 5. Log successful activation
    await prisma.securityLog.create({
      data: {
        event: 'ACCOUNT_ACTIVATED',
        userId: activationRequest.userId,
        userRole: activationRequest.role,
        success: true,
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error activating account:', error)
    return NextResponse.json({ error: 'Failed to activate account' }, { status: 500 })
  }
}
```

---

## Priority Fixes

### Must Do (Critical):
1. ✅ **Add rate limiting** - Prevents brute force
2. ✅ **Increase bcrypt rounds** - Change from 10 to 12
3. ✅ **Validate password strength** - Require uppercase, lowercase, number, special char

### Should Do (Important):
4. ✅ **Add timing attack protection** - Constant-time responses
5. ✅ **Log activation attempts** - Security monitoring
6. ✅ **HTTPS enforcement** - Prevent man-in-the-middle

### Nice to Have:
7. ✅ **Account lockout** - After multiple failures
8. ✅ **Origin validation** - CORS protection
9. ✅ **Security headers** - Add CSP, HSTS, etc.

---

## Database Schema Additions

Add these tables for enhanced security:

```prisma
model SecurityLog {
  id        Int      @id @default(autoincrement())
  event     String
  userId    Int
  userRole  String
  success   Boolean
  ipAddress String
  userAgent String
  createdAt DateTime @default(now())
}

model FailedActivation {
  id        Int      @id @default(autoincrement())
  token     String
  ipAddress String
  reason    String
  createdAt DateTime @default(now())
}
```

---

## Summary

Your current implementation is **reasonably secure** for most use cases, but adding these improvements will make it **production-grade**:

**Current Security Level**: 6/10 ⭐⭐⭐⭐⭐⭐  
**With Improvements**: 9/10 ⭐⭐⭐⭐⭐⭐⭐⭐⭐

The most critical fixes are:
1. Rate limiting (prevents brute force)
2. Password strength validation (prevents weak passwords)
3. Security logging (for monitoring and compliance)

Would you like me to implement these improvements for you?
