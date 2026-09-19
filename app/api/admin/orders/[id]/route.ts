import { NextRequest, NextResponse } from 'next/server';
import { OrderRepository } from '@/repositories/order.repository';
import { getAllAdminClients } from '@/lib/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await OrderRepository.getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    // Also fetch notes if any
    let orderNotes: any[] = [];
    try {
      const shards = getAllAdminClients();
      for (const { client } of shards) {
        const { data } = await client
          .from('order_notes')
          .select('*')
          .eq('order_id', order.id)
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          orderNotes = data;
          break;
        }
      }
    } catch {}

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        internal_notes: orderNotes,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, status, courierCode, trackingId, note, payment_status } = body;

    let updated = false;

    // 1. Update status
    if (status) {
      updated = await OrderRepository.updateOrderStatus(id, status, note);
    }

    // 2. Update courier & consignment tracking
    if (courierCode && trackingId) {
      updated = await OrderRepository.updateShipment(id, courierCode, trackingId);
    }

    // 3. Add internal note
    if (note && action === 'add_note') {
      try {
        const order = await OrderRepository.getOrderById(id);
        if (order) {
          const shards = getAllAdminClients();
          for (const { client } of shards) {
            await client.from('order_notes').insert({
              order_id: order.id,
              note: note.trim(),
              created_by: 'Admin Concierge',
            });
          }
          updated = true;
        }
      } catch (e) {
        console.error('Error adding note:', e);
      }
    }

    // 4. Update payment status if provided
    if (payment_status) {
      try {
        const shards = getAllAdminClients();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        for (const { client } of shards) {
          let q = client.from('orders').update({
            payment_status,
            updated_at: new Date().toISOString(),
          });
          if (isUuid) {
            q = q.or(`id.eq.${id},order_number.eq.${id}`);
          } else {
            q = q.eq('order_number', id);
          }
          await q;
        }
        updated = true;
      } catch (e) {
        console.error('Error updating payment status:', e);
      }
    }

    const refreshedOrder = await OrderRepository.getOrderById(id);

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully in database!',
      order: refreshedOrder,
    });
  } catch (error: any) {
    console.error('Error updating admin order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !id.trim()) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required.' },
        { status: 400 }
      );
    }

    const success = await OrderRepository.deleteOrder(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete order from database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order permanently deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting admin order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete order.' },
      { status: 500 }
    );
  }
}

