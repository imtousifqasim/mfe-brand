import { NextResponse } from 'next/server';
import { CheckoutService } from '@/services/checkout.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await CheckoutService.processCheckout(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error processing checkout.' }, { status: 500 });
  }
}
