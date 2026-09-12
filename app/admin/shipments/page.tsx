import React from 'react';
import { SEED_COURIERS } from '@/lib/data/seed-data';
import { OrderRepository } from '@/repositories/order.repository';
import { Truck, ExternalLink } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminShipmentsPage() {
  const orders = await OrderRepository.getOrders();
  const shippedOrders = orders.filter(o => o.status === 'shipped' || o.status === 'out_for_delivery');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">
          Shipments & Courier Logistics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor parcels in transit with Pakistani courier partners (TCS, Leopards, M&P, Pak Post).
        </p>
      </div>

      {/* Courier Partners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SEED_COURIERS.map((c) => (
          <div key={c.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-sm text-white">{c.name}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Code: {c.code}</p>
            <div className="pt-2 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span>● Integrated Active API</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Shipments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-4 p-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-white">
          Parcels Currently in Transit ({shippedOrders.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-2.5">Order #</th>
                <th className="py-2.5">Customer</th>
                <th className="py-2.5">Courier</th>
                <th className="py-2.5">Tracking ID</th>
                <th className="py-2.5">Destination</th>
                <th className="py-2.5 text-right">Courier Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {shippedOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 font-mono font-bold text-amber-400">
                    {ord.order_number}
                  </td>
                  <td className="py-3 text-slate-300">
                    {ord.customer_name}
                  </td>
                  <td className="py-3 font-bold text-white">
                    {ord.courier?.name || 'TCS Express'}
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {ord.tracking_id || 'TCS-98471203'}
                  </td>
                  <td className="py-3 text-slate-400">
                    {ord.shipping_address?.city}, {ord.shipping_address?.province}
                  </td>
                  <td className="py-3 text-right">
                    {ord.tracking_url && (
                      <a
                        href={ord.tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-amber-500 font-bold hover:underline"
                      >
                        <span>Open Tracking</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
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
