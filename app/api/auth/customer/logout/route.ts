import { NextResponse } from 'next/server';
import { CUSTOMER_COOKIE_NAME } from '@/lib/auth/customer';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Patron session signed out' });
  response.cookies.set({
    name: CUSTOMER_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
