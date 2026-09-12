import { NextRequest, NextResponse } from 'next/server';
import { resetAdminPasswordWithToken } from '@/lib/auth/admin';

export async function POST(req: NextRequest) {
  try {
    const { resetCode, newPassword } = await req.json();

    if (!resetCode || !newPassword) {
      return NextResponse.json(
        { error: 'Verification code and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const result = await resetAdminPasswordWithToken(resetCode, newPassword);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Password reset failed' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Administrative password successfully reset! You may now sign in.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
