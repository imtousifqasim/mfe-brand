import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getActiveWriteAdmin } from '@/lib/supabase/admin';
import { createCustomerSessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/auth/customer';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const supabase = getActiveWriteAdmin();

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error || !customer) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Update last login
    supabase
      .from('customers')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', customer.id)
      .then();

    const token = await createCustomerSessionToken({
      id: customer.id,
      email: customer.email,
      full_name: customer.full_name,
      phone: customer.phone,
      tier: customer.tier || 'Patron Member',
    });

    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        full_name: customer.full_name,
        phone: customer.phone,
        tier: customer.tier || 'Patron Member',
      },
    });

    response.cookies.set({
      name: CUSTOMER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err) {
    console.error('Customer login error:', err);
    return NextResponse.json({ error: 'Failed to process login' }, { status: 500 });
  }
}
