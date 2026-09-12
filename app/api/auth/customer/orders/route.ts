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

    const orders = await OrderRepository.getOrders({
      email: session.email,
      customerId: session.id,
    });

    return NextResponse.json({ orders: orders || [] });
  } catch (err) {
    return NextResponse.json({ orders: [] });
  }
}
