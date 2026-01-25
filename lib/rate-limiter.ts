// Simple in-memory rate limiter for activation endpoints
// For production, use Redis-based rate limiting

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMinutes: number = 15) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMinutes * 60 * 1000;
    
    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async limit(key: string): Promise<{ success: boolean; remaining: number; resetAt?: number }> {
    const now = Date.now();
    const entry = this.store.get(key);

    // If no entry or expired, create new
    if (!entry || now >= entry.resetAt) {
      this.store.set(key, {
        count: 1,
        resetAt: now + this.windowMs
      });
      return { 
        success: true, 
        remaining: this.maxAttempts - 1,
        resetAt: now + this.windowMs
      };
    }

    // Check if limit exceeded
    if (entry.count >= this.maxAttempts) {
      return { 
        success: false, 
        remaining: 0,
        resetAt: entry.resetAt
      };
    }

    // Increment count
    entry.count++;
    this.store.set(key, entry);

    return { 
      success: true, 
      remaining: this.maxAttempts - entry.count,
      resetAt: entry.resetAt
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetAt) {
        this.store.delete(key);
      }
    }
  }

  // Reset a specific key (useful for testing)
  reset(key: string) {
    this.store.delete(key);
  }

  // Get current count for a key
  getCount(key: string): number {
    const entry = this.store.get(key);
    if (!entry || Date.now() >= entry.resetAt) {
      return 0;
    }
    return entry.count;
  }
}

// Create singleton instances
export const activationRateLimiter = new RateLimiter(5, 15); // 5 attempts per 15 minutes
export const verificationRateLimiter = new RateLimiter(10, 15); // 10 verifications per 15 minutes
export const passwordResetRequestRateLimiter = new RateLimiter(5, 15); // 5 requests per 15 minutes
export const passwordResetConfirmRateLimiter = new RateLimiter(10, 15); // 10 confirmations per 15 minutes

// Rate limit by IP + token for more granular control
export function getRateLimitKey(
  type: 'activation' | 'verification' | 'passwordResetRequest' | 'passwordResetConfirm',
  identifier: string
): string {
  return `${type}:${identifier}`;
}
