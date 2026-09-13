import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifyCustomerSessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/auth/customer';
import { getActiveWriteAdmin, getAllAdminClients } from '@/lib/supabase/admin';
import { generateBase32Secret, getTOTPUri, getQRCodeUrl, verifyTOTPCode } from '@/lib/auth/totp';

// GET: Check customer 2FA status
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifyCustomerSessionToken(token);
    if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const supabase = getActiveWriteAdmin();
    const { data: customer } = await supabase
      .from('customers')
      .select('two_factor_enabled')
      .eq('id', session.id)
      .maybeSingle();

    return NextResponse.json({
      two_factor_enabled: Boolean(customer?.two_factor_enabled),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// POST: Generate TOTP secret & QR code OR change password
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifyCustomerSessionToken(token);
    if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const body = await req.json();
    const action = body.action || 'generate_2fa';

    if (action === 'generate_2fa') {
      const secret = generateBase32Secret(20);
      const totpUri = getTOTPUri(session.email, secret, 'MFE Brand Patron');
      const qrCodeUrl = getQRCodeUrl(totpUri);

      return NextResponse.json({
        success: true,
        secret,
        totpUri,
        qrCodeUrl,
      });
    }

    if (action === 'change_password') {
      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
      }

      const supabase = getActiveWriteAdmin();
      const { data: customer } = await supabase
        .from('customers')
        .select('id, password_hash')
        .eq('id', session.id)
        .maybeSingle();

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      const isMatch = await bcrypt.compare(currentPassword, customer.password_hash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      const shards = getAllAdminClients();
      for (const { client } of shards) {
        await client
          .from('customers')
          .update({
            password_hash: newHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id);
      }

      return NextResponse.json({
        success: true,
        message: 'Your account password has been successfully updated.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// PUT: Activate 2FA after TOTP code verification
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifyCustomerSessionToken(token);
    if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const { secret, code } = await req.json();
    if (!secret || !code) {
      return NextResponse.json({ error: 'Secret and verification code are required' }, { status: 400 });
    }

    const isValid = verifyTOTPCode(secret, code);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid 6-digit verification code. Please check your Authenticator app.' }, { status: 400 });
    }

    const shards = getAllAdminClients();
    for (const { client } of shards) {
      await client
        .from('customers')
        .update({
          two_factor_enabled: true,
          two_factor_secret: secret,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Two-Factor Authentication (Google / Microsoft Authenticator) successfully enabled on your patron account!',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE: Disable 2FA with password confirmation
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifyCustomerSessionToken(token);
    if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: 'Password is required to disable 2FA' }, { status: 400 });
    }

    const supabase = getActiveWriteAdmin();
    const { data: customer } = await supabase
      .from('customers')
      .select('id, password_hash')
      .eq('id', session.id)
      .maybeSingle();

    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 400 });
    }

    const shards = getAllAdminClients();
    for (const { client } of shards) {
      await client
        .from('customers')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Two-Factor Authentication has been removed from your account.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
