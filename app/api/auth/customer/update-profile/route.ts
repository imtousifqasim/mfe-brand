import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerSessionToken, createCustomerSessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/auth/customer';
import { getActiveWriteAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifyCustomerSessionToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    const { full_name, phone } = await req.json();
    if (!full_name) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    const supabase = getActiveWriteAdmin();
    const { data: updated, error } = await supabase
      .from('customers')
      .update({
        full_name: full_name.trim(),
        phone: (phone || '').trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id)
      .select('id, email, full_name, phone, tier')
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Refresh session cookie
    const newToken = await createCustomerSessionToken({
      id: updated.id,
      email: updated.email,
      full_name: updated.full_name,
      phone: updated.phone,
      tier: updated.tier || 'Patron Member',
    });

    const response = NextResponse.json({ success: true, customer: updated });
    response.cookies.set({
      name: CUSTOMER_COOKIE_NAME,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: 'Profile update failed' }, { status: 500 });
  }
}
