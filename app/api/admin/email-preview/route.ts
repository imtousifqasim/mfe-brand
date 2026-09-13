import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/services/email.service';
import { Order } from '@/types/database';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const template = searchParams.get('template') || 'order-confirmation';
  const format = searchParams.get('format') || 'raw';

  const mockOrder: Order = {
    id: 'ord_mock_preview_01',
    order_number: 'MFE-2609-8421',
    customer_name: 'Begum Ayesha Mansoor',
    customer_email: 'ayesha.mansoor@example.com',
    customer_phone: '+92 300 8492011',
    status: 'confirmed',
    payment_status: 'paid',
    payment_method: 'cod',
    subtotal: 58500,
    shipping_amount: 0,
    discount_amount: 5000,
    grand_total: 53500,
    tracking_id: 'TCS-9284710294',
    tracking_url: 'https://mfebrand.com/track-order?order=MFE-2609-8421',
    courier_id: 'tcs',
    shipping_address: {
      address_type: 'shipping',
      first_name: 'Ayesha',
      last_name: 'Mansoor',
      email: 'ayesha.mansoor@example.com',
      phone: '+92 300 8492011',
      address_line1: 'Bungalow 42, Main Gulberg Avenue',
      city: 'Lahore',
      province: 'Punjab',
      postal_code: '54000',
      country: 'Pakistan',
    },
    items: [
      {
        id: 'item_1',
        order_id: 'ord_mock_preview_01',
        product_id: 'prod_1',
        product_name: 'Zardozi Handcrafted Velvet Pishwas Ensemble',
        sku: 'MFE-HC-VELVET-01',
        unit_price: 38500,
        quantity: 1,
        subtotal: 38500,
      },
      {
        id: 'item_2',
        order_id: 'ord_mock_preview_01',
        product_id: 'prod_2',
        product_name: 'Raw Silk Tilla-Work Shawl Dupatta',
        sku: 'MFE-HC-SHAWL-04',
        unit_price: 20000,
        quantity: 1,
        subtotal: 20000,
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockCustomer = {
    full_name: 'Begum Ayesha Mansoor',
    email: 'ayesha.mansoor@example.com',
    phone: '+92 300 8492011',
    username: 'ayesha.couture',
  };

  let html = '';

  switch (template) {
    case 'account-welcome':
      html = EmailService.generateAccountCreatedHtml(mockCustomer, 'PatronPass#2026');
      break;

    case 'order-shipped':
      html = EmailService.generateTrackingUpdateHtml(mockOrder);
      break;

    case 'newsletter':
      html = EmailService.generateNewsletterHtml(
        'The Festive Velvet Capsule • Private Atelier Preview',
        `We cordially invite you to experience our newest couture release: The Festive Velvet Capsule.\n\nHandcrafted with raw silk lining, antique zardozi embellishments, and custom tailoring, each ensemble is crafted for discerning clientele across Pakistan and internationally.\n\nAs a registered member of our Private Salon, your priority atelier reservations are now open before public allocation.`
      );
      break;

    case 'order-confirmation':
    default:
      html = EmailService.generateOrderConfirmationHtml(mockOrder);
      break;
  }

  if (format === 'raw') {
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }

  return NextResponse.json({
    success: true,
    template,
    html,
  });
}
