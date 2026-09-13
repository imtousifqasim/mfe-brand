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

    return NextResponse.json({
      success: true,
      message: 'Order created successfully!',
      order: result.order,
    });
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
