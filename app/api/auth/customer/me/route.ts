import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerSessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/auth/customer';
import { getActiveWriteAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ customer: null });
    }

    const session = await verifyCustomerSessionToken(token);
    if (!session || !session.id) {
      const res = NextResponse.json({ customer: null });
      res.cookies.delete(CUSTOMER_COOKIE_NAME);
      return res;
    }

    // Always fetch fresh customer data from live database
    try {
      const supabase = getActiveWriteAdmin();
      const { data: customer, error } = await supabase
        .from('customers')
        .select('id, email, full_name, phone, tier, created_at')
        .eq('id', session.id)
        .maybeSingle();

      if (error || !customer) {
        // If customer doesn't exist in live database, purge the invalid cookie
        const res = NextResponse.json({ customer: null });
        res.cookies.delete(CUSTOMER_COOKIE_NAME);
        return res;
      }

      return NextResponse.json({ customer });
    } catch (dbErr) {
      console.error('Error fetching customer record:', dbErr);
      return NextResponse.json({
        customer: {
          id: session.id,
          email: session.email,
          full_name: session.full_name,
          phone: session.phone,
          tier: session.tier || 'Patron Member',
        }
      });
    }
  } catch {
    const res = NextResponse.json({ customer: null });
    res.cookies.delete(CUSTOMER_COOKIE_NAME);
    return res;
  }
}
