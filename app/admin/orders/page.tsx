import React from 'react';
import Link from 'next/link';
import { OrderRepository } from '@/repositories/order.repository';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatus } from '@/types/database';
import { 
  ShoppingBag, Eye, Truck, CheckCircle2, Clock, 
  XCircle, ExternalLink, Search, RefreshCw, Package 
} from 'lucide-react';
import { OrderRowActions } from '@/components/admin/OrderRowActions';

interface AdminOrdersPageProps {
  searchParams: Promise<{
    status?: OrderStatus;
    q?: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STATUS_FILTERS: { key?: OrderStatus; label: string }[] = [
  { label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

function getStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === 'delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (s === 'shipped' || s === 'out_for_delivery') return 'bg-sky-50 text-sky-700 border-sky-200';
  if (s === 'confirmed' || s === 'packed') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (s === 'processing') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (s === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { status, q } = await searchParams;

  let orders = await OrderRepository.getOrders({ status });

  if (q && q.trim()) {
    const search = q.trim().toLowerCase();
    orders = orders.filter(o => 
      o.order_number.toLowerCase().includes(search) ||
      o.customer_name.toLowerCase().includes(search) ||
      o.customer_email.toLowerCase().includes(search) ||
      o.customer_phone.includes(search) ||
      (o.shipping_address?.city && o.shipping_address.city.toLowerCase().includes(search)) ||
      (o.tracking_id && o.tracking_id.toLowerCase().includes(search))
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-amber-600" />
            <span>Orders & Fulfillment Center ({orders.length})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-shard order dispatching, Pakistani courier consignment updates, and customer dossiers.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Live Feeds</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200">
        {STATUS_FILTERS.map((f, idx) => {
          const isActive = (!status && !f.key) || status === f.key;
          return (
            <Link
              key={idx}
              href={f.key ? `/admin/orders?status=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ''}` : `/admin/orders${q ? `?q=${encodeURIComponent(q)}` : ''}`}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition ${
                isActive
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] bg-slate-50/80">
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
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    No orders matching this filter or search query.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <Link href={`/admin/orders/${ord.id}`} className="hover:text-amber-700 transition">
                        {ord.order_number}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                        {formatDate(ord.created_at)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-bold text-slate-900">{ord.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{ord.customer_email} • {ord.customer_phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-medium text-slate-800">{ord.shipping_address?.city || 'Pakistan'}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {ord.items?.length || 1} item{ord.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`border px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(ord.status)}`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {ord.tracking_id ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="font-mono font-bold text-slate-900">
                              {ord.courier?.name || (ord.courier_id ? String(ord.courier_id).toUpperCase() : 'TCS')}: {ord.tracking_id}
                            </span>
                          </div>
                          {ord.tracking_url && (
                            <a
                              href={ord.tracking_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-amber-700 hover:underline flex items-center gap-1 w-fit mt-0.5 font-medium"
                            >
                              <span>Track Live</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      {formatPrice(ord.grand_total)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <OrderRowActions orderId={ord.id} orderNumber={ord.order_number} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
