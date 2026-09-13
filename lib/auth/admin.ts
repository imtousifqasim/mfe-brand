import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { verifyTOTPCode } from './totp';

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

  if (record.lockedUntil > now) {
    const lockoutRemainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutRemainingSec,
    };
  }

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

export interface AdminUserRecord {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  two_factor_enabled: boolean;
  two_factor_secret?: string | null;
  last_login_at?: string | null;
}

// Check admin credentials and 2FA status from Supabase
export async function verifyAdminCredentialsWith2FA(
  usernameInput: string,
  passwordInput: string
): Promise<{
  valid: boolean;
  require2FA?: boolean;
  username?: string;
  adminId?: string;
  two_factor_secret?: string | null;
}> {
  const cleanUsername = usernameInput.trim();

  try {
    const { getActiveWriteAdmin } = await import('@/lib/supabase/admin');
    const supabase = getActiveWriteAdmin();
    const { data: adminRecord, error } = await supabase
      .from('admins')
      .select('id, username, password_hash, is_active, two_factor_enabled, two_factor_secret')
      .eq('username', cleanUsername)
      .eq('is_active', true)
      .maybeSingle();

    if (!error && adminRecord && adminRecord.password_hash) {
      const isMatch = await bcrypt.compare(passwordInput, adminRecord.password_hash);
      if (isMatch) {
        if (adminRecord.two_factor_enabled && adminRecord.two_factor_secret) {
          return {
            valid: true,
            require2FA: true,
            username: adminRecord.username,
            adminId: adminRecord.id,
            two_factor_secret: adminRecord.two_factor_secret,
          };
        }
        
        // Update last login
        supabase
          .from('admins')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', adminRecord.id)
          .then();

        return {
          valid: true,
          require2FA: false,
          username: adminRecord.username,
          adminId: adminRecord.id,
        };
      }
      return { valid: false };
    }
  } catch (dbErr) {
    console.warn('DB query for admin table failed, checking env fallback:', dbErr);
  }

  // Fallback to environment credentials if DB unavailable
  const expectedUsername = (process.env.ADMIN_USERNAME || 'mfe_admin').replace(/^['"]|['"]$/g, '').trim();
  const expectedHash = getExpectedHash();

  if (!expectedHash || cleanUsername !== expectedUsername) {
    return { valid: false };
  }

  try {
    const isMatch = await bcrypt.compare(passwordInput, expectedHash);
    return {
      valid: isMatch,
      require2FA: false,
      username: expectedUsername,
    };
  } catch {
    return { valid: false };
  }
}

// Standard verifyAdminCredentials for backwards compatibility
export async function verifyAdminCredentials(
  usernameInput: string,
  passwordInput: string
): Promise<boolean> {
  const res = await verifyAdminCredentialsWith2FA(usernameInput, passwordInput);
  return res.valid;
}

// Verify TOTP 2FA code for an admin
export async function verifyAdmin2FACode(
  username: string,
  totpCode: string
): Promise<boolean> {
  try {
    const { getActiveWriteAdmin } = await import('@/lib/supabase/admin');
    const supabase = getActiveWriteAdmin();
    const { data: adminRecord } = await supabase
      .from('admins')
      .select('id, two_factor_enabled, two_factor_secret')
      .eq('username', username)
      .eq('is_active', true)
      .maybeSingle();

    if (!adminRecord || !adminRecord.two_factor_enabled || !adminRecord.two_factor_secret) {
      return false;
    }

    const isValid = verifyTOTPCode(adminRecord.two_factor_secret, totpCode);
    if (isValid) {
      supabase
        .from('admins')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', adminRecord.id)
        .then();
    }
    return isValid;
  } catch (err) {
    console.error('2FA verification error:', err);
    return false;
  }
}

// Get admin profile details by username
export async function getAdminProfile(username: string): Promise<AdminUserRecord | null> {
  try {
    const { getAllAdminClients } = await import('@/lib/supabase/admin');
    const shards = getAllAdminClients();
    for (const { client } of shards) {
      const { data, error } = await client
        .from('admins')
        .select('id, username, email, full_name, role, two_factor_enabled, last_login_at')
        .eq('username', username)
        .maybeSingle();

      if (!error && data) return data;
    }
    return null;
  } catch {
    return null;
  }
}

// Update admin profile details (full_name, email, or new username) across all shards
export async function updateAdminProfile(
  currentUsername: string,
  updates: { full_name?: string; email?: string; newUsername?: string }
): Promise<{ success: boolean; error?: string; updatedUsername?: string }> {
  try {
    const { getAllAdminClients } = await import('@/lib/supabase/admin');
    const shards = getAllAdminClients();

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.full_name) updatePayload.full_name = updates.full_name.trim();
    if (updates.email) updatePayload.email = updates.email.trim();
    if (updates.newUsername && updates.newUsername !== currentUsername) {
      // Check if username already exists on any shard
      for (const { client } of shards) {
        const { data: existing } = await client
          .from('admins')
          .select('id')
          .eq('username', updates.newUsername.trim())
          .neq('username', currentUsername)
          .maybeSingle();

        if (existing) {
          return { success: false, error: 'Administrative username is already in use.' };
        }
      }
      updatePayload.username = updates.newUsername.trim();
    }

    let updatedAny = false;
    let lastError: string | undefined;

    for (const { client } of shards) {
      const { error } = await client
        .from('admins')
        .update(updatePayload)
        .eq('username', currentUsername);

      if (!error) {
        updatedAny = true;
      } else {
        lastError = error.message;
      }
    }

    if (!updatedAny && lastError) {
      return { success: false, error: lastError };
    }

    return {
      success: true,
      updatedUsername: updatePayload.username || currentUsername
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Database error' };
  }
}

// Update admin password directly in DB with bcrypt hash across all shards
export async function updateAdminPassword(
  username: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    const { getAllAdminClients } = await import('@/lib/supabase/admin');
    const shards = getAllAdminClients();

    let matchedAdmin: any = null;
    for (const { client } of shards) {
      const { data: adminRecord } = await client
        .from('admins')
        .select('id, password_hash')
        .eq('username', username)
        .maybeSingle();

      if (adminRecord && adminRecord.password_hash) {
        matchedAdmin = adminRecord;
        break;
      }
    }

    if (!matchedAdmin) {
      return { success: false, error: 'Admin record not found.' };
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, matchedAdmin.password_hash);
    if (!isCurrentValid) {
      return { success: false, error: 'Current password does not match.' };
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    let updatedAny = false;
    let lastError: string | undefined;

    for (const { client } of shards) {
      const { error: updateErr } = await client
        .from('admins')
        .update({
          password_hash: newHash,
          updated_at: new Date().toISOString()
        })
        .eq('username', username);

      if (!updateErr) {
        updatedAny = true;
      } else {
        lastError = updateErr.message;
      }
    }

    if (!updatedAny && lastError) {
      return { success: false, error: lastError };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Password update failed' };
  }
}

// Enable or disable Two-Factor Authentication in database across all shards
export async function setAdminTwoFactor(
  username: string,
  secret: string | null,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { getAllAdminClients } = await import('@/lib/supabase/admin');
    const shards = getAllAdminClients();

    for (const { client } of shards) {
      await client
        .from('admins')
        .update({
          two_factor_enabled: enabled,
          two_factor_secret: secret,
          updated_at: new Date().toISOString()
        })
        .eq('username', username);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Database error' };
  }
}

// Generate a 6-digit or UUID password reset token stored in DB with 1-hour expiry
export async function generateAdminPasswordResetToken(
  usernameOrEmail: string
): Promise<{ success: boolean; error?: string; resetCode?: string }> {
  try {
    const cleanInput = usernameOrEmail.trim().toLowerCase();
    const { getActiveWriteAdmin } = await import('@/lib/supabase/admin');
    const supabase = getActiveWriteAdmin();

    // Query admin by username or email
    const { data: adminRecord } = await supabase
      .from('admins')
      .select('id, username, email')
      .or(`username.ilike.${cleanInput},email.ilike.${cleanInput}`)
      .maybeSingle();

    if (!adminRecord) {
      // Don't leak whether user exists for security, but return generic success
      return { success: true };
    }

    // Generate a 6-digit numeric reset OTP
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await supabase
      .from('admins')
      .update({
        reset_token: resetCode,
        reset_token_expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminRecord.id);

    return { success: true, resetCode };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to generate reset token' };
  }
}

// Reset admin password using reset token
export async function resetAdminPasswordWithToken(
  resetCode: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long.' };
    }

    const cleanCode = resetCode.trim();
    const { getActiveWriteAdmin } = await import('@/lib/supabase/admin');
    const supabase = getActiveWriteAdmin();

    const { data: adminRecord, error } = await supabase
      .from('admins')
      .select('id, reset_token, reset_token_expires_at')
      .eq('reset_token', cleanCode)
      .maybeSingle();

    if (error || !adminRecord) {
      return { success: false, error: 'Invalid or expired password reset verification code.' };
    }

    if (new Date(adminRecord.reset_token_expires_at).getTime() < Date.now()) {
      return { success: false, error: 'Password reset code has expired. Please request a new one.' };
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await supabase
      .from('admins')
      .update({
        password_hash: newHash,
        reset_token: null,
        reset_token_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminRecord.id);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reset password' };
  }
}
