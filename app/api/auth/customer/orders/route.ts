import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerSessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/auth/customer';
import { OrderRepository } from '@/repositories/order.repository';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ orders: [] });
    }

    const session = await verifyCustomerSessionToken(token);
    if (!session) {
      return NextResponse.json({ orders: [] });
    }

    const cleanEmail = session.email?.toLowerCase().trim();
    if (cleanEmail && session.id) {
      // Opportunistically link any orders placed with this email to this customer account
      const { getAllAdminClients } = await import('@/lib/supabase/admin');
      const shards = getAllAdminClients();
      for (const { client } of shards) {
        client
          .from('orders')
          .update({ customer_id: session.id })
          .ilike('customer_email', cleanEmail)
          .then();
      }
    }

    const orders = await OrderRepository.getOrders({
      email: cleanEmail,
      customerId: session.id,
    });

    return NextResponse.json({ orders: orders || [] });
  } catch (err) {
    return NextResponse.json({ orders: [] });
  }
}
