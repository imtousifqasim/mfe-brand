import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerSessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/auth/customer';
import { OrderRepository } from '@/repositories/order.repository';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ addresses: [] });
    }

    const session = await verifyCustomerSessionToken(token);
    if (!session) {
      return NextResponse.json({ addresses: [] });
    }

    // Fetch customer's orders to derive distinct shipping destinations used
    const cleanEmail = session.email?.toLowerCase().trim();
    const orders = await OrderRepository.getOrders({
      email: cleanEmail,
      customerId: session.id,
    });

    const addressesMap = new Map<string, any>();

    orders.forEach((ord) => {
      const addr = ord.shipping_address;
      if (addr && addr.address_line1 && addr.city) {
        const key = `${(addr.address_line1 || '').toLowerCase().trim()}_${(addr.city || '').toLowerCase().trim()}`;
        if (!addressesMap.has(key)) {
          addressesMap.set(key, {
            id: `ord-addr-${ord.id}`,
            customer_id: session.id,
            first_name: addr.first_name || ord.customer_name?.split(' ')[0] || 'Valued',
            last_name: addr.last_name || ord.customer_name?.split(' ').slice(1).join(' ') || 'Patron',
            phone: addr.phone || ord.customer_phone || '',
            email: addr.email || ord.customer_email || session.email,
            address_line1: addr.address_line1,
            address_line2: addr.address_line2 || null,
            city: addr.city,
            province: addr.province || 'Punjab',
            postal_code: addr.postal_code || '54000',
            country: addr.country || 'Pakistan',
            address_type: 'shipping',
            is_default_shipping: addressesMap.size === 0,
            is_default_billing: addressesMap.size === 0,
            created_at: ord.created_at,
          });
        }
      }
    });

    const addresses = Array.from(addressesMap.values());
    return NextResponse.json({ addresses });
  } catch (err) {
    console.error('Error fetching customer addresses:', err);
    return NextResponse.json({ addresses: [] });
  }
}
