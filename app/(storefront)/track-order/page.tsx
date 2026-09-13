'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/utils';
import { 
  Truck, Search, PackageCheck, Clock, CheckCircle2, 
  ExternalLink, MapPin, AlertCircle, ArrowRight 
} from 'lucide-react';

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';
  const initialEmail = searchParams.get('email') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [contact, setContact] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const performLookup = async (ord: string, cont: string) => {
    if (!ord || !cont) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/tracking/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: ord, contact: cont }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrderData(data.order);
      } else {
        setErrorMsg(data.error || 'Unable to find order tracking details.');
        setOrderData(null);
      }
    } catch {
      setErrorMsg('Network error while looking up tracking information.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder && initialEmail) {
      performLookup(initialOrder, initialEmail);
    }
  }, [initialOrder, initialEmail]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(orderNumber, contact);
  };

  const getStepIndex = (status: string) => {
    const idx = TIMELINE_STEPS.findIndex(s => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  const currentStepIdx = orderData ? getStepIndex(orderData.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 font-sans">
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2 shadow-xl">
          <Truck className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
          Live Consignment Tracking
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
          Enter your unique MFE order number along with your phone number or email to inspect verified courier checkpoint logs.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
              Order Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MFE-20260911-0001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 font-mono uppercase focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-5 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
              Billing Email or Phone *
            </label>
            <input
              type="text"
              required
              placeholder="name@example.com or 03001234567"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs p-3.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 uppercase tracking-wider"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isLoading ? '...' : 'Track'}</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Tracking Results Visualizer */}
      {orderData && (
        <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400 block">Consignment Reference</span>
              <h2 className="font-mono text-2xl font-bold text-white mt-0.5">{orderData.order_number || orderData.orderNumber}</h2>
              <p className="text-xs text-neutral-400 mt-1">Booked on {formatDate(orderData.created_at || orderData.createdAt)}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 block">Current Status</span>
              <span className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-1">
                {(orderData.status || 'pending').replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="py-4">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {TIMELINE_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPassed 
                        ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(212,175,55,0.6)]' 
                        : 'bg-neutral-800 text-neutral-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-[11px] font-medium leading-tight ${isCurrent ? 'text-amber-400 font-bold' : isPassed ? 'text-neutral-200' : 'text-neutral-500'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details & Delivery Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/[0.08] text-xs">
            <div className="space-y-2 p-5 rounded-2xl bg-neutral-900/40 border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 block">Destination</span>
              <p className="font-bold text-white text-sm">{orderData.customer_name || orderData.customerName || 'Customer'}</p>
              <p className="text-neutral-300">{orderData.shipping_address?.address_line1 || orderData.shippingAddress?.address_line1 || 'Address on file'}</p>
              <p className="text-neutral-400">
                {orderData.shipping_address?.city || orderData.shippingAddress?.city || 'Pakistan'}, {orderData.shipping_address?.province || orderData.shippingAddress?.province || ''}
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-neutral-900/40 border border-white/[0.06] flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 block">Courier & Consignment</span>
                <p className="font-bold text-white text-sm">{orderData.courier?.name || orderData.courier_name || 'TCS Express'}</p>
                <p className="text-amber-400 font-mono text-xs">
                  Tracking ID: {orderData.tracking_id || orderData.trackingId || 'Consignment In Prep'}
                </p>
                <p className="text-neutral-400 text-xs">Total: {formatPrice(orderData.grand_total ?? orderData.grandTotal ?? 0)}</p>
              </div>

              {orderData.tracking_url || orderData.trackingUrl ? (
                <a
                  href={orderData.tracking_url || orderData.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-md shadow-amber-500/10 active:scale-98 mt-2"
                >
                  <span>Track on Official Courier Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div className="text-[11px] text-neutral-500 italic pt-1">
                  Online tracking link becomes active once parcel is picked up by courier.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <React.Suspense fallback={<div className="text-center py-20 text-neutral-500">Loading tracking console...</div>}>
      <TrackOrderContent />
    </React.Suspense>
  );
}
