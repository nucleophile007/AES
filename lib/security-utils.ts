// Password strength validation utility

export interface PasswordValidation {
  valid: boolean;
  error?: string;
  strength?: 'weak' | 'medium' | 'strong';
  score?: number;
}

export function validatePasswordStrength(password: string): PasswordValidation {
  // Minimum length
  if (password.length < 12) {
    return { 
      valid: false, 
      error: 'Password must be at least 12 characters long',
      strength: 'weak',
      score: 1
    };
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    return { 
      valid: false, 
      error: 'Password must contain at least one lowercase letter',
      strength: 'weak',
      score: 2
    };
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    return { 
      valid: false, 
      error: 'Password must contain at least one uppercase letter',
      strength: 'weak',
      score: 2
    };
  }

  // Check for numbers
  if (!/[0-9]/.test(password)) {
    return { 
      valid: false, 
      error: 'Password must contain at least one number',
      strength: 'medium',
      score: 3
    };
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { 
      valid: false, 
      error: 'Password must contain at least one special character (!@#$%^&*)',
      strength: 'medium',
      score: 3
    };
  }

  // Calculate strength
  let score = 4;
  let strength: 'weak' | 'medium' | 'strong' = 'strong';

  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;
  if (/[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1; // Rare special chars

  if (score >= 6) strength = 'strong';
  else if (score >= 4) strength = 'strong';
  else strength = 'medium';

  return { 
    valid: true, 
    strength,
    score
  };
}

// Common weak passwords to reject
const COMMON_PASSWORDS = [
  'password', 'password123', '123456789', 'qwerty123', 
  'admin123', 'letmein', 'welcome123', 'password1',
  'abc123456', 'monkey123', 'dragon123'
];

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.includes(password.toLowerCase());
}

// Timing-safe string comparison
export async function timingSafeDelay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get client IP address
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0].trim() || realIP || 'unknown';
}

// Check if HTTPS
export function isSecureConnection(request: Request): boolean {
  const protocol = request.headers.get('x-forwarded-proto');
  return protocol === 'https' || request.url.startsWith('https://');
}
