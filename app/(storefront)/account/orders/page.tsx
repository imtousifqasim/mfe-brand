import React from 'react';
import Link from 'next/link';
import { OrderRepository } from '@/repositories/order.repository';
import { formatPrice, formatDate } from '@/lib/utils';
import { ShoppingBag, Eye, ExternalLink, Truck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomerOrdersPage() {
  const orders = await OrderRepository.getOrders();

  return (
    <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            My Orders ({orders.length})
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Review detailed item snapshots and live courier dispatch updates.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-400" />
          <p className="text-xs">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-6 rounded-2xl bg-neutral-900/50 border border-white/[0.08] hover:border-amber-500/40 transition-all space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                <div>
                  <span className="font-mono text-sm font-bold text-amber-400">
                    {ord.order_number}
                  </span>
                  <span className="text-xs text-neutral-400 ml-3">
                    Placed on {formatDate(ord.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {ord.status.replace('_', ' ')}
                  </span>
                  <span className="font-serif text-base font-bold text-white">
                    {formatPrice(ord.grand_total)}
                  </span>
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-2 text-xs">
                {ord.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-neutral-300">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span className="font-serif font-bold text-white">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Courier info & Actions */}
              <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>
                    Courier: <strong className="text-white">{ord.courier?.name || 'TCS Express'}</strong> 
                    {ord.tracking_id && ` • Tracking ID: ${ord.tracking_id}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/track-order?order=${ord.order_number}&email=${encodeURIComponent(ord.customer_email)}`}
                    className="inline-flex items-center gap-1.5 text-xs bg-neutral-800 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-400 hover:text-slate-950 font-bold px-4 py-2 rounded-xl transition text-white"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Tracking Timeline</span>
                  </Link>

                  {ord.tracking_url && (
                    <a
                      href={ord.tracking_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white p-2"
                      title="Open Courier Website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
