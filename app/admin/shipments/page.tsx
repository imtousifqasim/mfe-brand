import React from 'react';
import Link from 'next/link';
import { SEED_COURIERS } from '@/lib/data/seed-data';
import { OrderRepository } from '@/repositories/order.repository';
import { SettingsRepository } from '@/repositories/settings.repository';
import { Truck, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminShipmentsPage() {
  const [orders, shippingSettings] = await Promise.all([
    OrderRepository.getOrders(),
    SettingsRepository.getShippingSettings(),
  ]);
  const shippedOrders = orders.filter(o => o.status === 'shipped' || o.status === 'out_for_delivery');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Shipments & Courier Logistics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor parcels in transit with Pakistani courier partners (TCS, Leopards, M&P, Pak Post).
          </p>
        </div>

        {/* Current Delivery Charge Quick Widget */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Active Delivery Charge
            </span>
            <span className="font-mono text-base font-black text-slate-900">
              Rs. {shippingSettings.deliveryCharge}
            </span>
          </div>
          <Link
            href="/admin/settings#delivery-charges"
            className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition"
          >
            <span>Edit Fee</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Courier Partners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SEED_COURIERS.map((c) => (
          <div key={c.id} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600" />
              <span className="font-bold text-sm text-slate-900">{c.name}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">Code: {c.code}</p>
            <div className="pt-2 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <span>● Integrated Active API</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Shipments Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs space-y-4 p-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
          Parcels Currently in Transit ({shippedOrders.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 uppercase font-semibold text-[10px]">
                <th className="py-2.5">Order #</th>
                <th className="py-2.5">Customer</th>
                <th className="py-2.5">Courier</th>
                <th className="py-2.5">Tracking ID</th>
                <th className="py-2.5">Destination</th>
                <th className="py-2.5 text-right">Courier Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shippedOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 font-mono font-bold text-slate-900">
                    {ord.order_number}
                  </td>
                  <td className="py-3 text-slate-700 font-medium">
                    {ord.customer_name}
                  </td>
                  <td className="py-3 font-bold text-slate-900">
                    {ord.courier?.name || 'TCS Express'}
                  </td>
                  <td className="py-3 font-mono text-slate-600">
                    {ord.tracking_id || 'TCS-98471203'}
                  </td>
                  <td className="py-3 text-slate-500">
                    {ord.shipping_address?.city}, {ord.shipping_address?.province}
                  </td>
                  <td className="py-3 text-right">
                    {ord.tracking_url && (
                      <a
                        href={ord.tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-bold transition"
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
