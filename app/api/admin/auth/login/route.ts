import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyAdminCredentialsWith2FA, 
  verifyAdmin2FACode,
  createAdminSessionToken, 
  checkLoginRateLimit, 
  recordFailedLogin, 
  resetLoginRateLimit,
  ADMIN_COOKIE_NAME 
} from '@/lib/auth/admin';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // 1. Rate Limiting Check
    const rateCheck = checkLoginRateLimit(ip);
    if (!rateCheck.allowed) {
      const waitMinutes = Math.ceil((rateCheck.lockoutRemainingSec || 60) / 60);
      return NextResponse.json(
        { 
          error: `Too many failed login attempts. Security lockout active. Please try again in ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''}.`,
          isLocked: true,
          lockoutRemainingSec: rateCheck.lockoutRemainingSec
        },
        { status: 429 }
      );
    }

    // 2. Parse request payload
    let body: { username?: string; password?: string; totpCode?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
    }

    const { username, password, totpCode } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();

    // 3. Verify Credentials & check 2FA requirement
    const credResult = await verifyAdminCredentialsWith2FA(cleanUsername, password);

    if (!credResult.valid) {
      const failStatus = recordFailedLogin(ip);
      if (failStatus.isLocked) {
        return NextResponse.json(
          {
            error: 'Maximum failed attempts reached. Account locked for 15 minutes.',
            isLocked: true,
            lockoutRemainingSec: failStatus.lockoutRemainingSec
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `Invalid administrative credentials. (${failStatus.remainingAttempts} attempt${failStatus.remainingAttempts === 1 ? '' : 's'} remaining)`,
          remainingAttempts: failStatus.remainingAttempts
        },
        { status: 401 }
      );
    }

    // 4. Two-Factor Authentication Check
    if (credResult.require2FA) {
      if (!totpCode) {
        return NextResponse.json({
          require2FA: true,
          message: 'Two-Factor Authentication required. Enter the 6-digit code from Google Authenticator.'
        });
      }

      const is2FAValid = await verifyAdmin2FACode(cleanUsername, totpCode);
      if (!is2FAValid) {
        const failStatus = recordFailedLogin(ip);
        return NextResponse.json(
          {
            error: 'Invalid 6-digit Authenticator verification code. Please check your app.',
            require2FA: true,
            remainingAttempts: failStatus.remainingAttempts
          },
          { status: 401 }
        );
      }
    }

    // 5. Success: Reset rate limit tracker
    resetLoginRateLimit(ip);

    // 6. Create signed HMAC session token
    const token = await createAdminSessionToken(credResult.username || cleanUsername);

    // 7. Set HTTP-Only secure session cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({
      success: true,
      message: 'Administrative authentication successful',
      user: credResult.username || cleanUsername
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Admin login handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}
