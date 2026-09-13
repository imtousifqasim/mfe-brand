import { 
  createAdminClient, 
  queryAcrossAllShards, 
  findAcrossAllShards, 
  getAllAdminClients, 
  getActiveWriteAdmin, 
  getActiveWriteShardId 
} from '@/lib/supabase/admin';
import { Order, OrderItem, OrderAddress, OrderStatus } from '@/types/database';
import { SEED_COURIERS } from '@/lib/data/seed-data';

export function generateDirectCourierTrackingUrl(courierCodeOrName: string = '', trackingId?: string | null): string {
  if (!trackingId || !trackingId.trim()) return '';
  const rawId = trackingId.trim();
  const c = courierCodeOrName.toLowerCase();

  // TCS Express uses https://www.tcsexpress.com/track/:number with numeric consignment digits
  if (c.includes('tcs')) {
    const digits = rawId.replace(/^tcs-?/i, '').replace(/[^0-9]/g, '');
    const cleanId = digits || rawId.replace(/^tcs-?/i, '');
    return `https://www.tcsexpress.com/track/${encodeURIComponent(cleanId)}`;
  }

  // Leopards Courier
  if (c.includes('leopard') || c.includes('lcs')) {
    const cleanId = rawId.replace(/^lp-?/i, '').trim();
    return `https://leopardscourier.com/tracking?track_no=${encodeURIComponent(cleanId)}`;
  }

  // Call Courier
  if (c.includes('call') || c.includes('cc')) {
    const cleanId = rawId.replace(/^cc-?/i, '').trim();
    return `https://callcourier.com.pk/tracking/?tc=${encodeURIComponent(cleanId)}`;
  }

  // PostEx
  if (c.includes('postex')) {
    const cleanId = rawId.replace(/^px-?/i, '').trim();
    return `https://postex.pk/tracking?tracking_number=${encodeURIComponent(cleanId)}`;
  }

  // Trax
  if (c.includes('trax') || c.includes('sonic')) {
    const cleanId = rawId.replace(/^trx-?/i, '').trim();
    return `https://trax.pk/tracking?cn=${encodeURIComponent(cleanId)}`;
  }

  // M&P
  if (c.includes('m&p') || c.includes('mnp') || c.includes('m and p') || c.includes('mulphilog')) {
    const cleanId = rawId.replace(/^mnp-?/i, '').trim();
    return `https://mulphilog.com/tracking?track=${encodeURIComponent(cleanId)}`;
  }

  // PakPost
  if (c.includes('pakpost') || c.includes('post')) {
    return `https://ep.gov.pk/track.asp?art_id=${encodeURIComponent(rawId)}`;
  }

  const cleanFallback = rawId.replace(/^[a-z]+-?/i, '');
  return `https://www.tcsexpress.com/track/${encodeURIComponent(cleanFallback)}`;
}

export class OrderRepository {
  private static mockOrders: Order[] = [];

  static generateOrderNumber(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const randomSeq = String(Math.floor(1000 + Math.random() * 9000));
    return `MFE-${yyyy}${mm}${dd}-${randomSeq}`;
  }

  static async createOrder(orderData: {
    customerId?: string | null;
    customerEmail: string;
    customerPhone: string;
    customerName: string;
    subtotal: number;
    discountAmount: number;
    shippingAmount: number;
    grandTotal: number;
    couponCode?: string | null;
    paymentMethod: any;
    items: Array<{
      productId: string;
      productName: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
      imageUrl?: string | null;
    }>;
    shippingAddress: OrderAddress;
    billingAddress?: OrderAddress;
    notes?: string;
  }): Promise<Order> {
    const orderNumber = this.generateOrderNumber();
    const isCustomerIdUuid = orderData.customerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderData.customerId);
    const validCustomerId = isCustomerIdUuid ? orderData.customerId : null;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      customer_id: validCustomerId,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      customer_name: orderData.customerName,
      subtotal: orderData.subtotal,
      discount_amount: orderData.discountAmount,
      shipping_amount: orderData.shippingAmount,
      grand_total: orderData.grandTotal,
      coupon_code: orderData.couponCode || null,
      status: 'pending',
      payment_method: orderData.paymentMethod,
      payment_status: 'unpaid',
      notes: orderData.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: orderData.items.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        order_id: `ord-${Date.now()}`,
        product_id: item.productId,
        product_name: item.productName,
        sku: item.sku,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        image_url: item.imageUrl || null,
      })),
      shipping_address: orderData.shippingAddress,
      billing_address: orderData.billingAddress || orderData.shippingAddress,
      status_history: [
        {
          id: `hist-${Date.now()}`,
          new_status: 'pending',
          notes: 'Order placed successfully.',
          created_at: new Date().toISOString(),
        }
      ]
    };

    try {
      const writeClient = getActiveWriteAdmin();
      const { data: dbOrder, error } = await writeClient
        .from('orders')
        .insert({
          order_number: newOrder.order_number,
          customer_id: validCustomerId,
          customer_email: newOrder.customer_email,
          customer_phone: newOrder.customer_phone,
          customer_name: newOrder.customer_name,
          subtotal: newOrder.subtotal,
          discount_amount: newOrder.discount_amount,
          shipping_amount: newOrder.shipping_amount,
          grand_total: newOrder.grand_total,
          coupon_code: newOrder.coupon_code,
          status: newOrder.status,
          payment_method: newOrder.payment_method,
          payment_status: newOrder.payment_status,
          notes: newOrder.notes,
        })
        .select()
        .single();

      if (!error && dbOrder) {
        // Insert items
        const itemInserts = newOrder.items!.map(it => ({
          order_id: dbOrder.id,
          product_id: it.product_id,
          product_name: it.product_name,
          sku: it.sku,
          unit_price: it.unit_price,
          quantity: it.quantity,
          subtotal: it.subtotal,
          image_url: it.image_url,
        }));
        await writeClient.from('order_items').insert(itemInserts);

        // Insert addresses
        await writeClient.from('order_addresses').insert([
          { ...orderData.shippingAddress, order_id: dbOrder.id, address_type: 'shipping' },
          { ...(orderData.billingAddress || orderData.shippingAddress), order_id: dbOrder.id, address_type: 'billing' },
        ]);

        // Insert status history
        await writeClient.from('order_status_history').insert({
          order_id: dbOrder.id,
          new_status: 'pending',
          notes: 'Order placed successfully.',
        });

        // Also replicate base order row to other shards for high availability read access
        const shards = getAllAdminClients();
        for (const { client, id: shardIdNum } of shards) {
          if (shardIdNum !== getActiveWriteShardId()) {
            await client.from('orders').upsert({
              id: dbOrder.id,
              order_number: dbOrder.order_number,
              customer_id: validCustomerId,
              customer_email: dbOrder.customer_email,
              customer_phone: dbOrder.customer_phone,
              customer_name: dbOrder.customer_name,
              subtotal: dbOrder.subtotal,
              discount_amount: dbOrder.discount_amount,
              shipping_amount: dbOrder.shipping_amount,
              grand_total: dbOrder.grand_total,
              coupon_code: dbOrder.coupon_code,
              status: dbOrder.status,
              payment_method: dbOrder.payment_method,
              payment_status: dbOrder.payment_status,
              notes: dbOrder.notes,
              created_at: dbOrder.created_at,
              updated_at: dbOrder.updated_at,
            }, { onConflict: 'id' });
          }
        }

        return {
          ...newOrder,
          id: dbOrder.id,
          created_at: dbOrder.created_at,
          updated_at: dbOrder.updated_at,
        } as Order;
      } else if (error) {
        console.error('Failed to insert order into active shard:', error);
      }
    } catch (err) {
      console.error('Exception during order creation:', err);
    }

    this.mockOrders.unshift(newOrder);
    return newOrder;
  }

  static async getOrders(filters: { customerId?: string; email?: string; status?: OrderStatus } = {}): Promise<Order[]> {
    try {
      const shardOrders = await queryAcrossAllShards<Order>(async (supabase) => {
        let query = supabase
          .from('orders')
          .select(`
            *,
            items:order_items(*),
            addresses:order_addresses(*)
          `)
          .order('created_at', { ascending: false });

        if (filters.customerId && filters.email) {
          const cleanEmail = filters.email.toLowerCase().trim();
          query = query.or(`customer_id.eq.${filters.customerId},customer_email.ilike.${cleanEmail}`);
        } else if (filters.customerId) {
          query = query.eq('customer_id', filters.customerId);
        } else if (filters.email) {
          query = query.eq('customer_email', filters.email.toLowerCase().trim());
        }
        if (filters.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error || !data) return [];

        return data.map(ord => {
          const courier = SEED_COURIERS.find(c => c.id === ord.courier_id || c.code === ord.courier_id) || (ord.courier_id ? { id: ord.courier_id, name: ord.courier_id.toUpperCase(), code: ord.courier_id, is_active: true } : null);
          const shippingAddress = ord.addresses?.find((a: any) => a.address_type === 'shipping') || null;
          const billingAddress = ord.addresses?.find((a: any) => a.address_type === 'billing') || shippingAddress;

          return {
            ...ord,
            courier,
            shipping_address: shippingAddress,
            billing_address: billingAddress,
          };
        }) as Order[];
      }, (items) => {
        const map = new Map<string, Order>();
        items.forEach(o => map.set(o.order_number, o));
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      if (shardOrders && shardOrders.length > 0) return shardOrders;
    } catch (e) {
      console.error('Error fetching orders across shards:', e);
    }

    let list = [...this.mockOrders];
    if (filters.customerId) list = list.filter(o => o.customer_id === filters.customerId);
    if (filters.email) list = list.filter(o => o.customer_email?.toLowerCase() === filters.email?.toLowerCase());
    if (filters.status) list = list.filter(o => o.status === filters.status);
    return list;
  }

  static async getOrderById(idOrNumber: string): Promise<Order | null> {
    try {
      const clean = idOrNumber.trim();
      const { data: foundOrder } = await findAcrossAllShards<Order>(async (supabase) => {
        let q = supabase
          .from('orders')
          .select(`
            *,
            items:order_items(*),
            addresses:order_addresses(*),
            status_history:order_status_history(*)
          `);

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
        if (isUuid) {
          q = q.or(`id.eq.${clean},order_number.ilike.${clean}`);
        } else {
          q = q.ilike('order_number', clean);
        }

        const { data, error } = await q.maybeSingle();

        if (!error && data) {
          const courier = SEED_COURIERS.find(c => c.id === data.courier_id || c.code === data.courier_id) || (data.courier_id ? { id: data.courier_id, name: data.courier_id.toUpperCase(), code: data.courier_id, is_active: true } : null);
          const shippingAddress = data.addresses?.find((a: any) => a.address_type === 'shipping') || null;
          const billingAddress = data.addresses?.find((a: any) => a.address_type === 'billing') || shippingAddress;

          return {
            ...data,
            courier,
            shipping_address: shippingAddress,
            billing_address: billingAddress,
          } as Order;
        }
        return null;
      });

      if (foundOrder) return foundOrder;
    } catch (e) {
      console.error('Error in getOrderById:', e);
    }

    return this.mockOrders.find(o => o.id === idOrNumber || o.order_number.toLowerCase() === idOrNumber.toLowerCase()) || null;
  }

  static async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return this.getOrderById(orderNumber);
  }

  static async updateOrderStatus(orderId: string, newStatus: OrderStatus, notes?: string): Promise<boolean> {
    try {
      const shards = getAllAdminClients();
      let updatedAny = false;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

      for (const { client } of shards) {
        let q = client.from('orders').update({
          status: newStatus,
          updated_at: new Date().toISOString()
        });

        if (isUuid) {
          q = q.or(`id.eq.${orderId},order_number.eq.${orderId}`);
        } else {
          q = q.eq('order_number', orderId);
        }

        const { data, error } = await q.select('id').maybeSingle();

        if (!error && data) {
          updatedAny = true;
          await client.from('order_status_history').insert({
            order_id: data.id,
            new_status: newStatus,
            notes: notes || `Status updated to ${newStatus}`,
          });
        }
      }

      if (updatedAny) return true;
    } catch (e) {
      console.error('Error updating order status across shards:', e);
    }

    const order = this.mockOrders.find(o => o.id === orderId || o.order_number === orderId);
    if (order) {
      order.status = newStatus;
      order.status_history = order.status_history || [];
      order.status_history.push({
        id: `h-${Date.now()}`,
        new_status: newStatus,
        notes: notes || `Status updated to ${newStatus}`,
        created_at: new Date().toISOString(),
      });
      return true;
    }
    return false;
  }

  static async updateShipment(orderId: string, courierCode: string, trackingId: string): Promise<boolean> {
    const courier = SEED_COURIERS.find(c => c.code === courierCode) || SEED_COURIERS[0];
    const trackingUrl = generateDirectCourierTrackingUrl(courier.name, trackingId);

    try {
      const shards = getAllAdminClients();
      let updatedAny = false;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

      for (const { client } of shards) {
        let q = client.from('orders').update({
          courier_id: courierCode,
          tracking_id: trackingId.trim(),
          tracking_url: trackingUrl,
          status: 'shipped',
          updated_at: new Date().toISOString(),
        });

        if (isUuid) {
          q = q.or(`id.eq.${orderId},order_number.eq.${orderId}`);
        } else {
          q = q.eq('order_number', orderId);
        }

        const { data, error } = await q.select('id').maybeSingle();

        if (!error && data) {
          updatedAny = true;
          await client.from('order_status_history').insert({
            order_id: data.id,
            new_status: 'shipped',
            notes: `Dispatched with ${courier.name}. Tracking ID: ${trackingId}`,
          });
        }
      }

      if (updatedAny) return true;
    } catch (e) {
      console.error('Error in updateShipment across shards:', e);
    }

    const order = this.mockOrders.find(o => o.id === orderId || o.order_number === orderId);
    if (order) {
      order.courier_id = courierCode;
      order.courier = courier;
      order.tracking_id = trackingId;
      order.tracking_url = trackingUrl;
      order.status = 'shipped';
      order.status_history = order.status_history || [];
      order.status_history.push({
        id: `h-${Date.now()}`,
        new_status: 'shipped',
        notes: `Dispatched with ${courier.name}. Tracking ID: ${trackingId}`,
        created_at: new Date().toISOString(),
      });
      return true;
    }
    return false;
  }
}
