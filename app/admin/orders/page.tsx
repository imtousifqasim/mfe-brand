import React from 'react';
import Link from 'next/link';
import { OrderRepository } from '@/repositories/order.repository';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatus } from '@/types/database';
import { ShoppingBag, Eye, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface AdminOrdersPageProps {
  searchParams: Promise<{
    status?: OrderStatus;
  }>;
}

export const dynamic = 'force-dynamic';

const STATUS_FILTERS: { key?: OrderStatus; label: string }[] = [
  { label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { status } = await searchParams;

  const orders = await OrderRepository.getOrders({ status });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Orders & Fulfillment Center ({orders.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review customer orders, update dispatch statuses, and assign Pakistani courier tracking.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
        {STATUS_FILTERS.map((f, idx) => {
          const isActive = (!status && !f.key) || status === f.key;
          return (
            <Link
              key={idx}
              href={f.key ? `/admin/orders?status=${f.key}` : '/admin/orders'}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] bg-slate-900/80">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Courier & Tracking</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">
                    {ord.order_number}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <div className="font-bold text-white">{ord.customer_name}</div>
                    <div className="text-[10px] text-slate-400">{ord.customer_email} • {ord.customer_phone}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {ord.shipping_address?.city || 'Pakistan'}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {ord.items?.length || 1} items
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {ord.tracking_id ? (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Truck className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-mono">{ord.courier?.name || 'TCS'}: {ord.tracking_id}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {formatPrice(ord.grand_total)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/orders/${ord.id}`}
                      className="inline-flex items-center gap-1 text-xs bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage Order</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
