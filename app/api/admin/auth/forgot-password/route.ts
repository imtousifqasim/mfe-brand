import { NextRequest, NextResponse } from 'next/server';
import { generateAdminPasswordResetToken } from '@/lib/auth/admin';

export async function POST(req: NextRequest) {
  try {
    const { usernameOrEmail } = await req.json();

    if (!usernameOrEmail) {
      return NextResponse.json(
        { error: 'Username or registered administrator email is required' },
        { status: 400 }
      );
    }

    const result = await generateAdminPasswordResetToken(usernameOrEmail);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Recovery request failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset verification code generated.',
      // Provided for direct administrative on-screen recovery:
      resetCode: result.resetCode,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
