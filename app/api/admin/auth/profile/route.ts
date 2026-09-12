import { NextRequest, NextResponse } from 'next/server';
import { 
  ADMIN_COOKIE_NAME, 
  verifyAdminSessionToken, 
  createAdminSessionToken,
  getAdminProfile, 
  updateAdminProfile 
} from '@/lib/auth/admin';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifyAdminSessionToken(token);
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getAdminProfile(session.user);
    if (!profile) {
      return NextResponse.json({
        admin: {
          username: session.user,
          email: 'admin@mfebrand.com',
          full_name: 'Super Administrator',
          role: 'super_admin',
          two_factor_enabled: false,
        }
      });
    }

    return NextResponse.json({ admin: profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

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

    const body = await req.json();
    const { full_name, email, newUsername } = body;

    const result = await updateAdminProfile(session.user, {
      full_name,
      email,
      newUsername,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to update profile' }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Administrative profile updated successfully',
      username: result.updatedUsername,
    });

    // If username changed, refresh the session token
    if (result.updatedUsername && result.updatedUsername !== session.user) {
      const newToken = await createAdminSessionToken(result.updatedUsername);
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: newToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60,
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
