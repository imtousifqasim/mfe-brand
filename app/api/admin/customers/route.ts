import { NextResponse } from 'next/server';
import { queryAcrossAllShards } from '@/lib/supabase/admin';

export async function GET() {
  try {
    // 1. Fetch registered customers from both shards
    const registeredCustomers = await queryAcrossAllShards<any>(async (supabase) => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data;
    }, (items) => {
      const map = new Map<string, any>();
      items.forEach(c => map.set(c.email?.toLowerCase(), c));
      return Array.from(map.values());
    });

    // 2. Fetch all orders with items across all shards
    const allOrders = await queryAcrossAllShards<any>(async (supabase) => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          shippingAddress:order_addresses(*)
        `)
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data;
    }, (items) => {
      const map = new Map<string, any>();
      items.forEach(o => map.set(o.order_number, o));
      return Array.from(map.values());
    });

    // 3. Map orders to registered customers
    const customerMap = new Map<string, any>();

    (registeredCustomers || []).forEach(c => {
      customerMap.set(c.email.toLowerCase(), {
        id: c.id,
        name: c.full_name || 'Valued Patron',
        email: c.email,
        phone: c.phone || '—',
        tier: c.tier || 'Patron Member',
        registeredAt: c.created_at || new Date().toISOString(),
        status: 'active',
        orders: [],
      });
    });

    // 4. Associate orders and capture guest checkouts
    (allOrders || []).forEach(ord => {
      const emailKey = (ord.customer_email || '').toLowerCase().trim();
      if (!emailKey) return;

      if (!customerMap.has(emailKey)) {
        customerMap.set(emailKey, {
          id: ord.customer_id || `guest-${ord.id}`,
          name: ord.customer_name || 'Guest Patron',
          email: ord.customer_email,
          phone: ord.customer_phone || '—',
          tier: 'Guest Checkout',
          registeredAt: ord.created_at,
          status: 'active',
          orders: [],
        });
      }

      const cust = customerMap.get(emailKey);
      cust.orders.push({
        id: ord.id,
        orderNumber: ord.order_number,
        grandTotal: ord.grand_total,
        status: ord.status,
        paymentMethod: ord.payment_method,
        paymentStatus: ord.payment_status,
        createdAt: ord.created_at,
        notes: ord.notes,
        shippingCity: ord.shippingAddress?.[0]?.city || 'Pakistan',
        shippingAddress: ord.shippingAddress?.[0]?.address_line1 || '',
        items: (ord.items || []).map((it: any) => ({
          id: it.id,
          productName: it.product_name || 'Atelier Garment',
          sku: it.sku,
          unitPrice: it.unit_price,
          quantity: it.quantity,
          subtotal: it.subtotal,
          imageUrl: it.image_url,
        })),
      });
    });

    // 5. Calculate lifetime values and sort by most active
    const customerList = Array.from(customerMap.values()).map(c => {
      const totalSpent = c.orders.reduce((sum: number, o: any) => sum + (Number(o.grandTotal) || 0), 0);
      return {
        ...c,
        totalOrders: c.orders.length,
        totalSpent,
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json({
      success: true,
      customers: customerList,
    });
  } catch (error: any) {
    console.error('Error fetching customers directory:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
