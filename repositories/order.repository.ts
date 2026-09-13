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
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      customer_id: orderData.customerId || null,
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
      const supabase = createAdminClient();
      const { data: dbOrder, error } = await supabase
        .from('orders')
        .insert({
          order_number: newOrder.order_number,
          customer_id: newOrder.customer_id,
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
        await supabase.from('order_items').insert(itemInserts);

        // Insert addresses
        await supabase.from('order_addresses').insert([
          { ...orderData.shippingAddress, order_id: dbOrder.id, address_type: 'shipping' as const },
          { ...(orderData.billingAddress || orderData.shippingAddress), order_id: dbOrder.id, address_type: 'billing' as const },
        ]);

        return dbOrder as Order;
      }
    } catch {
      // Fallback
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
            items:order_items(*)
          `)
          .order('created_at', { ascending: false });

        if (filters.customerId) query = query.eq('customer_id', filters.customerId);
        if (filters.email) query = query.eq('customer_email', filters.email.toLowerCase().trim());
        if (filters.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(ord => ({
          ...ord,
          courier: SEED_COURIERS.find(c => c.id === ord.courier_id || c.code === ord.courier_id) || null
        })) as Order[];
      }, (items) => {
        // Deduplicate orders by order_number and sort newest first
        const map = new Map<string, Order>();
        items.forEach(o => map.set(o.order_number, o));
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      if (shardOrders) return shardOrders;
    } catch {
      // Fallback
    }

    let list = [...this.mockOrders];
    if (filters.customerId) list = list.filter(o => o.customer_id === filters.customerId);
    if (filters.email) list = list.filter(o => o.customer_email?.toLowerCase() === filters.email?.toLowerCase());
    if (filters.status) list = list.filter(o => o.status === filters.status);
    return list;
  }

  static async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const cleanNum = orderNumber.trim();
      const { data: foundOrder } = await findAcrossAllShards<Order>(async (supabase) => {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items(*)
          `)
          .ilike('order_number', cleanNum)
          .maybeSingle();

        if (!error && data) {
          const courier = SEED_COURIERS.find(c => c.id === data.courier_id || c.code === data.courier_id) || null;
          return {
            ...data,
            courier,
          } as Order;
        }
        return null;
      });

      if (foundOrder) return foundOrder;
    } catch (e) {
      console.error('Error in getOrderByNumber:', e);
    }

    return this.mockOrders.find(o => o.order_number.toLowerCase() === orderNumber.trim().toLowerCase()) || null;
  }

  static async updateOrderStatus(orderId: string, newStatus: OrderStatus, notes?: string): Promise<boolean> {
    try {
      const shards = getAllAdminClients();
      for (const { client } of shards) {
        const { error } = await client
          .from('orders')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', orderId);

        if (!error) {
          await client.from('order_status_history').insert({
            order_id: orderId,
            new_status: newStatus,
            notes: notes || `Status updated to ${newStatus}`,
          });
          return true;
        }
      }
    } catch {
      // Fallback
    }

    const order = this.mockOrders.find(o => o.id === orderId);
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
    const trackingUrl = courier.tracking_url_template?.replace('{tracking_id}', encodeURIComponent(trackingId)) || '';

    try {
      const shards = getAllAdminClients();
      for (const { client } of shards) {
        const { error } = await client.from('orders').update({
          courier_id: courier.id,
          tracking_id: trackingId,
          tracking_url: trackingUrl,
          status: 'shipped',
          updated_at: new Date().toISOString(),
        }).eq('id', orderId);

        if (!error) {
          await client.from('order_status_history').insert({
            order_id: orderId,
            new_status: 'shipped',
            notes: `Dispatched with ${courier.name}. Tracking ID: ${trackingId}`,
          });
          return true;
        }
      }
    } catch {
      // Fallback
    }

    const order = this.mockOrders.find(o => o.id === orderId);
    if (order) {
      order.courier_id = courier.id;
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
