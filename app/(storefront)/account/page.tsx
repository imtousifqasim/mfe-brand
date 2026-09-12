'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/utils';
import { ShoppingBag, Clock, CheckCircle2, Heart, ArrowRight, Eye, ChevronRight, Loader2 } from 'lucide-react';
import { useCustomer } from '@/components/providers/CustomerProvider';
import { useWishlist } from '@/hooks/useWishlist';
import { Order } from '@/types/database';

export default function CustomerDashboardPage() {
  const { customer } = useCustomer();
  const { itemCount: wishlistCount } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!customer) return;

    fetch('/api/auth/customer/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, [customer]);

  if (!customer) return null;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped').length;
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;

  return (
    <div className="space-y-8 font-sans text-[#141414]">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-[#eae7e2] shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-[#8c827a] mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#b87414]" />
          </div>
          <span className="font-serif text-3xl font-bold text-[#141414]">{totalOrders}</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#eae7e2] shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-[#8c827a] mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">In Transit</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <span className="font-serif text-3xl font-bold text-[#141414]">{pendingOrders}</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#eae7e2] shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-[#8c827a] mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-serif text-3xl font-bold text-[#141414]">{completedOrders}</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#eae7e2] shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-[#8c827a] mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Wishlist</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <span className="font-serif text-3xl font-bold text-[#141414]">{wishlistCount}</span>
        </div>
      </div>

      {/* Recent Consignments Table Card */}
      <div className="bg-white border border-[#eae7e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#eae7e2]">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#141414]">
              Recent Consignments
            </h2>
            <p className="text-xs text-[#6b6b6b] mt-1">
              Track and view dispatch records for your bespoke ensembles.
            </p>
          </div>
          {orders.length > 0 && (
            <Link
              href="/account/orders"
              className="text-xs font-bold uppercase tracking-wider text-[#b87414] hover:text-[#975c09] flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loadingOrders ? (
          <div className="py-12 text-center text-[#6b6b6b] flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#b87414]" />
            <span className="text-xs">Fetching your consignments from atelier database...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#faf8f5] border border-[#eae7e2] flex items-center justify-center mx-auto text-[#b87414]">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-[#141414]">No Consignments Placed Yet</h3>
              <p className="text-xs text-[#6b6b6b] max-w-sm mx-auto">
                You haven't placed any luxury orders with MFE Brand yet. Explore our latest unstitched luxury and festive pret.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs bg-[#141414] hover:bg-[#262626] text-white font-bold px-6 py-3 rounded-full transition shadow"
            >
              <span>Explore Haute Catalog</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#b87414]" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#eae7e2] text-[#8c827a] uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3">Order Number</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Total</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e2]/60">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#faf8f5] transition">
                    <td className="py-4 font-mono font-bold text-[#b87414]">
                      {ord.order_number}
                    </td>
                    <td className="py-4 text-[#6b6b6b]">
                      {formatDate(ord.created_at)}
                    </td>
                    <td className="py-4">
                      <span className="bg-[#b87414]/10 text-[#b87414] border border-[#b87414]/20 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider">
                        {ord.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 font-serif font-bold text-[#141414] text-sm">
                      {formatPrice(ord.grand_total)}
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/track-order?orderNumber=${ord.order_number}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf8f5] hover:bg-[#eae7e2] border border-[#eae7e2] text-[#141414] font-medium text-xs transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#b87414]" />
                        <span>Track</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
