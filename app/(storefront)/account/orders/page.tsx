'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/utils';
import { ShoppingBag, Eye, ArrowRight, Loader2, Package } from 'lucide-react';
import { useCustomer } from '@/components/providers/CustomerProvider';
import { Order } from '@/types/database';

export default function CustomerOrdersPage() {
  const { customer } = useCustomer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      });
  }, [customer]);

  if (!customer) return null;

  return (
    <div className="bg-white border border-[#eae7e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 font-sans text-[#141414]">
      <div className="flex items-center justify-between pb-4 border-b border-[#eae7e2]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b87414]/10 text-[#b87414] text-[10px] font-bold uppercase tracking-wider mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>Order Archive</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#141414]">
            My Consignments ({orders.length})
          </h1>
          <p className="text-xs text-[#6b6b6b] mt-1">
            Review detailed item snapshots and live courier dispatch updates.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#6b6b6b] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#b87414]" />
          <span className="text-xs">Loading your orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-[#6b6b6b] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#faf8f5] border border-[#eae7e2] flex items-center justify-center mx-auto text-[#b87414]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-[#141414]">You haven't placed any orders yet</h3>
            <p className="text-xs text-[#6b6b6b] max-w-sm mx-auto">
              Browse our handcrafted ensembles and experience bespoke Pakistani luxury.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs bg-[#141414] hover:bg-[#262626] text-white font-bold px-6 py-3 rounded-full transition shadow"
          >
            <span>Browse Haute Collections</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#b87414]" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-6 rounded-2xl bg-[#faf8f5] border border-[#eae7e2] hover:border-[#b87414]/40 transition-all space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#eae7e2]">
                <div>
                  <span className="font-mono text-sm font-bold text-[#b87414]">
                    {ord.order_number}
                  </span>
                  <span className="text-xs text-[#6b6b6b] ml-3">
                    Placed on {formatDate(ord.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-[#b87414]/10 text-[#b87414] border border-[#b87414]/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {ord.status.replace('_', ' ')}
                  </span>
                  <span className="font-serif text-base font-bold text-[#141414]">
                    {formatPrice(ord.grand_total)}
                  </span>
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-2 text-xs">
                {ord.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-[#525252]">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span className="font-mono font-semibold">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#6b6b6b]">
                  Payment: <span className="uppercase font-bold text-[#141414]">{ord.payment_method}</span> ({ord.payment_status})
                </span>
                <Link
                  href={`/track-order?orderNumber=${ord.order_number}`}
                  className="inline-flex items-center gap-1.5 text-xs text-[#b87414] hover:text-[#975c09] font-bold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Track Consignment</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
