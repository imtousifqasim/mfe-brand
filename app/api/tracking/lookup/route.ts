import { NextResponse } from 'next/server';
import { OrderRepository } from '@/repositories/order.repository';

export async function POST(req: Request) {
  try {
    const { orderNumber, contact } = await req.json();

    if (!orderNumber || !contact) {
      return NextResponse.json({ success: false, error: 'Please enter order number and email/phone.' }, { status: 400 });
    }

    const order = await OrderRepository.getOrderByNumber(orderNumber);

    if (!order) {
      return NextResponse.json({ success: false, error: 'No order found with this order number.' }, { status: 404 });
    }

    const cleanContact = contact.trim().toLowerCase();
    const matchesEmail = order.customer_email.toLowerCase() === cleanContact;
    const matchesPhone = order.customer_phone.replace(/\D/g, '') === cleanContact.replace(/\D/g, '');

    if (!matchesEmail && !matchesPhone) {
      return NextResponse.json({ success: false, error: 'Email or phone number does not match this order.' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.order_number,
        status: order.status,
        createdAt: order.created_at,
        grandTotal: order.grand_total,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        courier: order.courier?.name || 'Assigned Courier',
        trackingId: order.tracking_id,
        trackingUrl: order.tracking_url,
        itemsCount: order.items?.length || 0,
        statusHistory: order.status_history || [],
        shippingCity: order.shipping_address?.city || 'Pakistan',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Error querying tracking information.' }, { status: 500 });
  }
}
