import { NextResponse } from 'next/server';
import { OrderRepository } from '@/repositories/order.repository';

function normalizePhone(p?: string | null): string {
  if (!p) return '';
  const digits = p.replace(/\D/g, '');
  // Extract trailing 10 digits (e.g. 3001234567) to match regardless of +92 or leading 0
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function generateDirectCourierTrackingUrl(courierNameOrCode: string = '', trackingId?: string | null, fallbackUrl?: string | null): string {
  if (!trackingId || !trackingId.trim()) {
    return fallbackUrl || '';
  }

  const cleanId = trackingId.trim();
  const c = courierNameOrCode.toLowerCase();

  if (c.includes('tcs')) {
    return `https://www.tcsexpress.com/tracking?track=${encodeURIComponent(cleanId)}`;
  }
  if (c.includes('leopard')) {
    return `https://leopardscourier.com/leopard-tracking/?track_numbers=${encodeURIComponent(cleanId)}`;
  }
  if (c.includes('call') || c.includes('cc')) {
    return `https://callcourier.com.pk/tracking/?tc=${encodeURIComponent(cleanId)}`;
  }
  if (c.includes('postex')) {
    return `https://postex.pk/tracking?order=${encodeURIComponent(cleanId)}`;
  }
  if (c.includes('trax') || c.includes('sonic')) {
    return `https://sonic.pk/tracking?tracking_number=${encodeURIComponent(cleanId)}`;
  }
  if (c.includes('m&p') || c.includes('mnp') || c.includes('m and p') || c.includes('mulphilog')) {
    return `https://mulphilog.com/tracking?consignmentNo=${encodeURIComponent(cleanId)}`;
  }

  if (fallbackUrl && fallbackUrl.startsWith('http')) {
    return fallbackUrl;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(`${courierNameOrCode || 'Courier'} tracking ${cleanId}`)}`;
}

export async function POST(req: Request) {
  try {
    const { orderNumber, contact } = await req.json();

    if (!orderNumber || !contact) {
      return NextResponse.json(
        { success: false, error: 'Please enter both your order number and billing email or phone.' },
        { status: 400 }
      );
    }

    const cleanOrderNum = String(orderNumber).trim();
    const order = await OrderRepository.getOrderByNumber(cleanOrderNum);

    if (!order) {
      return NextResponse.json(
        { success: false, error: `No order found with reference "${cleanOrderNum}". Please check your receipt.` },
        { status: 404 }
      );
    }

    const cleanContact = String(contact).trim().toLowerCase();
    const orderEmail = (order.customer_email || '').toLowerCase().trim();
    const matchesEmail = orderEmail === cleanContact;

    const normalizedInputPhone = normalizePhone(cleanContact);
    const normalizedOrderPhone = normalizePhone(order.customer_phone);
    const matchesPhone = Boolean(
      normalizedInputPhone && 
      normalizedOrderPhone && 
      (normalizedInputPhone === normalizedOrderPhone || normalizedOrderPhone.endsWith(normalizedInputPhone) || normalizedInputPhone.endsWith(normalizedOrderPhone))
    );

    if (!matchesEmail && !matchesPhone) {
      return NextResponse.json(
        { success: false, error: 'The provided email address or phone number does not match this consignment record.' },
        { status: 403 }
      );
    }

    const courierName = order.courier?.name || (order.courier_id ? String(order.courier_id).toUpperCase() : 'TCS Express');
    const directTrackingUrl = generateDirectCourierTrackingUrl(
      courierName,
      order.tracking_id,
      order.tracking_url
    );

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        orderNumber: order.order_number,
        status: order.status,
        created_at: order.created_at,
        createdAt: order.created_at,
        customer_name: order.customer_name,
        customerName: order.customer_name,
        grand_total: order.grand_total,
        grandTotal: order.grand_total,
        payment_method: order.payment_method,
        paymentMethod: order.payment_method,
        payment_status: order.payment_status,
        paymentStatus: order.payment_status,
        courier: order.courier || { name: courierName },
        courier_name: courierName,
        courierName: courierName,
        tracking_id: order.tracking_id,
        trackingId: order.tracking_id,
        tracking_url: directTrackingUrl,
        trackingUrl: directTrackingUrl,
        shipping_address: order.shipping_address,
        shippingAddress: order.shipping_address,
        items_count: order.items?.length || 0,
        itemsCount: order.items?.length || 0,
        status_history: order.status_history || [],
        statusHistory: order.status_history || [],
      },
    });
  } catch (error: any) {
    console.error('Tracking lookup exception:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while querying consignment tracking.' },
      { status: 500 }
    );
  }
}
