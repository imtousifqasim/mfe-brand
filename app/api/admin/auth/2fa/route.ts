import { NextRequest, NextResponse } from 'next/server';
import { 
  ADMIN_COOKIE_NAME, 
  verifyAdminSessionToken, 
  setAdminTwoFactor, 
  verifyAdminCredentials 
} from '@/lib/auth/admin';
import { 
  generateBase32Secret, 
  getTOTPUri, 
  getQRCodeUrl, 
  verifyTOTPCode 
} from '@/lib/auth/totp';

// Generate new TOTP secret & QR code
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifyAdminSessionToken(token);
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = generateBase32Secret(20);
    const totpUri = getTOTPUri(session.user, secret, 'MFE Brand Control');
    const qrCodeUrl = getQRCodeUrl(totpUri);

    return NextResponse.json({
      success: true,
      secret,
      totpUri,
      qrCodeUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// Verify code and enable 2FA in database
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifyAdminSessionToken(token);
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { secret, code } = await req.json();

    if (!secret || !code) {
      return NextResponse.json({ error: 'Secret and verification code are required' }, { status: 400 });
    }

    const isValid = verifyTOTPCode(secret, code);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid 6-digit verification code. Please check your Authenticator app and try again.' }, { status: 400 });
    }

    // Save to database
    const result = await setAdminTwoFactor(session.user, secret, true);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to activate 2FA in database' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Google Authenticator 2FA successfully activated for administrative access!'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// Disable 2FA after password confirmation
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifyAdminSessionToken(token);
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: 'Administrative password is required to disable 2FA' }, { status: 400 });
    }

    const isMatch = await verifyAdminCredentials(session.user, password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect administrative password' }, { status: 401 });
    }

    const result = await setAdminTwoFactor(session.user, null, false);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to disable 2FA' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Two-Factor Authentication has been disabled.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
