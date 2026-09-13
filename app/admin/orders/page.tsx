import React from 'react';
import Link from 'next/link';
import { OrderRepository } from '@/repositories/order.repository';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatus } from '@/types/database';
import { 
  ShoppingBag, Eye, Truck, CheckCircle2, Clock, 
  XCircle, ExternalLink, Search, RefreshCw, Package 
} from 'lucide-react';

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
  if (s === 'delivered') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (s === 'shipped' || s === 'out_for_delivery') return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
  if (s === 'confirmed' || s === 'packed') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  if (s === 'processing') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  if (s === 'cancelled') return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
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
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-amber-500" />
            <span>Orders & Fulfillment Center ({orders.length})</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-shard order dispatching, Pakistani courier consignment updates, and customer dossiers.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Live Feeds</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
        {STATUS_FILTERS.map((f, idx) => {
          const isActive = (!status && !f.key) || status === f.key;
          return (
            <Link
              key={idx}
              href={f.key ? `/admin/orders?status=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ''}` : `/admin/orders${q ? `?q=${encodeURIComponent(q)}` : ''}`}
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
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No orders matching this filter or search query.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      <Link href={`/admin/orders/${ord.id}`} className="hover:underline">
                        {ord.order_number}
                      </Link>
                      <div className="text-[10px] text-slate-500 font-sans font-normal mt-0.5">
                        {formatDate(ord.created_at)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-bold text-white">{ord.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{ord.customer_email} • {ord.customer_phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="font-medium text-slate-200">{ord.shipping_address?.city || 'Pakistan'}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {ord.items?.length || 1} item{ord.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`border px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusBadge(ord.status)}`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {ord.tracking_id ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-slate-200">
                            <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="font-mono font-bold text-white">
                              {ord.courier?.name || (ord.courier_id ? String(ord.courier_id).toUpperCase() : 'TCS')}: {ord.tracking_id}
                            </span>
                          </div>
                          {ord.tracking_url && (
                            <a
                              href={ord.tracking_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 w-fit mt-0.5"
                            >
                              <span>Track Live</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-mono">
                      {formatPrice(ord.grand_total)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage Order</span>
                      </Link>
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
