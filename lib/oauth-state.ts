import crypto from 'crypto';

const OAUTH_STATE_SECRET = process.env.JWT_SECRET;
const DEFAULT_STATE_TTL_MS = 10 * 60 * 1000;

function getOAuthStateSecret(): string {
  if (!OAUTH_STATE_SECRET) {
    throw new Error('JWT_SECRET is required to sign OAuth state.');
  }

  return OAUTH_STATE_SECRET;
}

export interface SignedOAuthState {
  email: string;
  userId: number;
  role: 'teacher' | 'student' | 'parent';
  nonce: string;
  exp: number;
}

function createSignature(encodedPayload: string): string {
  return crypto
    .createHmac('sha256', getOAuthStateSecret())
    .update(encodedPayload)
    .digest('base64url');
}

export function createSignedOAuthState(
  payload: Omit<SignedOAuthState, 'nonce' | 'exp'>,
  ttlMs: number = DEFAULT_STATE_TTL_MS
): string {
  const statePayload: SignedOAuthState = {
    ...payload,
    nonce: crypto.randomBytes(16).toString('hex'),
    exp: Date.now() + ttlMs,
  };

  const encodedPayload = Buffer.from(JSON.stringify(statePayload)).toString('base64url');
  const signature = createSignature(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySignedOAuthState(state: string): SignedOAuthState | null {
  try {
    const [encodedPayload, providedSignature] = state.split('.');
    if (!encodedPayload || !providedSignature) {
      return null;
    }

    const expectedSignature = createSignature(encodedPayload);
    const providedBuffer = Buffer.from(providedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      return null;
    }

    const parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString()) as SignedOAuthState;
    if (!parsed?.email || !parsed?.userId || !parsed?.role || !parsed?.exp) {
      return null;
    }

    if (parsed.exp < Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}