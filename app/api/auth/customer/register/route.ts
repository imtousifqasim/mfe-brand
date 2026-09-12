import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getActiveWriteAdmin } from '@/lib/supabase/admin';
import { createCustomerSessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/auth/customer';

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, password, phone } = await req.json();

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email address, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = full_name.trim();
    const cleanPhone = (phone || '').trim();

    const supabase = getActiveWriteAdmin();

    // Check if email already registered
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'An atelier account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: newCustomer, error: insertErr } = await supabase
      .from('customers')
      .insert({
        full_name: cleanName,
        email: cleanEmail,
        password_hash,
        phone: cleanPhone || null,
        tier: 'Patron Member',
      })
      .select('id, email, full_name, phone, tier')
      .single();

    if (insertErr || !newCustomer) {
      console.error('Customer registration error:', insertErr);
      return NextResponse.json(
        { error: 'Failed to create customer account. Please try again.' },
        { status: 500 }
      );
    }

    const token = await createCustomerSessionToken({
      id: newCustomer.id,
      email: newCustomer.email,
      full_name: newCustomer.full_name,
      phone: newCustomer.phone,
      tier: newCustomer.tier,
    });

    const response = NextResponse.json({
      success: true,
      customer: newCustomer,
    });

    response.cookies.set({
      name: CUSTOMER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error('Registration exception:', err);
    return NextResponse.json({ error: 'Internal server error during registration' }, { status: 500 });
  }
}
