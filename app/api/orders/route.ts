import { NextResponse } from 'next/server';
import { CheckoutService } from '@/services/checkout.service';
import { OrderRepository } from '@/repositories/order.repository';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Normalize notes and orderNotes
    const checkoutPayload = {
      ...body,
      notes: body.notes || body.orderNotes,
    };

    const result = await CheckoutService.processCheckout(checkoutPayload);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to place order.' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Order created successfully!',
      order: result.order,
      customer: result.customer || null,
    });

    if (result.customer) {
      const { createCustomerSessionToken, CUSTOMER_COOKIE_NAME } = await import('@/lib/auth/customer');
      const token = await createCustomerSessionToken({
        id: result.customer.id,
        email: result.customer.email,
        full_name: result.customer.full_name,
        phone: result.customer.phone,
        tier: result.customer.tier || 'Patron Member',
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
    }

    return response;
  } catch (error: any) {
    console.error('Orders API Error (POST):', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error processing order.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId') || undefined;
    const email = searchParams.get('email') || undefined;
    const status = (searchParams.get('status') as any) || undefined;

    const orders = await OrderRepository.getOrders({ customerId, email, status });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error('Orders API Error (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders.' },
      { status: 500 }
    );
  }
}
