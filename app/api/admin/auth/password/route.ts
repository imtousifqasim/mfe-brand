import { NextRequest, NextResponse } from 'next/server';
import { 
  ADMIN_COOKIE_NAME, 
  verifyAdminSessionToken, 
  updateAdminPassword 
} from '@/lib/auth/admin';

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

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    const result = await updateAdminPassword(session.user, currentPassword, newPassword);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to update password' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Administrative password successfully updated in database.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
