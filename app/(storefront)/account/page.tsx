import React from 'react';
import Link from 'next/link';
import { OrderRepository } from '@/repositories/order.repository';
import { formatPrice, formatDate } from '@/lib/utils';
import { ShoppingBag, Clock, CheckCircle2, Heart, ArrowRight, Eye, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomerDashboardPage() {
  const orders = await OrderRepository.getOrders();

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;

  return (
    <div className="space-y-8 font-sans">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-[#111114] border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-serif text-3xl font-bold text-white">{totalOrders}</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#111114] border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">In Transit</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <span className="font-serif text-3xl font-bold text-white">{pendingOrders}</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#111114] border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-serif text-3xl font-bold text-white">{completedOrders}</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#111114] border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Wishlist</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <span className="font-serif text-3xl font-bold text-white">4</span>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <h2 className="font-serif text-xl font-bold text-white">
              Recent Consignments
            </h2>
            <p className="text-xs text-neutral-400 mt-1">Track and view dispatch records for your bespoke ensembles.</p>
          </div>
          <Link
            href="/account/orders"
            className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-neutral-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3">Order Number</th>
                <th className="py-3">Date</th>
                <th className="py-3">Status</th>
                <th className="py-3">Total</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {orders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="hover:bg-neutral-900/60 transition">
                  <td className="py-4 font-mono font-bold text-amber-400">
                    {ord.order_number}
                  </td>
                  <td className="py-4 text-neutral-400">
                    {formatDate(ord.created_at)}
                  </td>
                  <td className="py-4">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 font-serif font-bold text-white text-sm">
                    {formatPrice(ord.grand_total)}
                  </td>
                  <td className="py-4 text-right">
                    <Link
                      href={`/track-order?order=${ord.order_number}&email=${encodeURIComponent(ord.customer_email)}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-neutral-300 hover:text-amber-400 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Track</span>
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
