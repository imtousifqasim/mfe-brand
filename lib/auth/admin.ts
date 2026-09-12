import bcrypt from 'bcryptjs';
export { 
  ADMIN_COOKIE_NAME, 
  createAdminSessionToken, 
  verifyAdminSessionToken, 
  type AdminSessionPayload 
} from './token';

// In-memory sliding window rate limiter for admin login attempts
interface RateLimitRecord {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkLoginRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  lockoutRemainingSec?: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if currently locked out
  if (record.lockedUntil > now) {
    const lockoutRemainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutRemainingSec,
    };
  }

  // If window has passed since last attempt, reset
  if (now - record.lastAttempt > WINDOW_MS) {
    rateLimitStore.delete(ip);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
  return {
    allowed: remaining > 0,
    remainingAttempts: remaining,
  };
}

export function recordFailedLogin(ip: string): {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutRemainingSec?: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(ip) || {
    attempts: 0,
    lastAttempt: now,
    lockedUntil: 0,
  };

  // If previous window expired, reset attempts
  if (now - record.lastAttempt > WINDOW_MS && record.lockedUntil <= now) {
    record.attempts = 0;
  }

  record.attempts += 1;
  record.lastAttempt = now;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    rateLimitStore.set(ip, record);
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockoutRemainingSec: Math.ceil(LOCKOUT_MS / 1000),
    };
  }

  rateLimitStore.set(ip, record);
  return {
    isLocked: false,
    remainingAttempts: MAX_ATTEMPTS - record.attempts,
  };
}

export function resetLoginRateLimit(ip: string): void {
  rateLimitStore.delete(ip);
}

function getExpectedHash(): string {
  if (process.env.ADMIN_PASSWORD_HASH_B64) {
    try {
      const b64 = process.env.ADMIN_PASSWORD_HASH_B64.replace(/^['"]|['"]$/g, '').trim();
      return Buffer.from(b64, 'base64').toString('utf8');
    } catch {
      // ignore
    }
  }
  return (process.env.ADMIN_PASSWORD_HASH || '').replace(/^['"]|['"]$/g, '').trim();
}

// Credentials validation
export async function verifyAdminCredentials(
  usernameInput: string,
  passwordInput: string
): Promise<boolean> {
  const expectedUsername = (process.env.ADMIN_USERNAME || 'mfe_admin').replace(/^['"]|['"]$/g, '').trim();
  const expectedHash = getExpectedHash();

  if (!expectedHash) {
    console.error('ADMIN_PASSWORD_HASH / ADMIN_PASSWORD_HASH_B64 is not set in environment variables');
    return false;
  }

  // Check username match
  if (usernameInput.trim() !== expectedUsername) {
    return false;
  }

  // Compare bcrypt hash
  try {
    return await bcrypt.compare(passwordInput, expectedHash);
  } catch (err) {
    console.error('Bcrypt comparison error:', err);
    return false;
  }
}
