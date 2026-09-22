'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/utils';
import { 
  Truck, Search, PackageCheck, Clock, CheckCircle2, 
  ExternalLink, MapPin, AlertCircle, ArrowRight, Copy, Check,
  ShieldCheck, Sparkles, Phone, Mail, ChevronRight
} from 'lucide-react';

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Booking Received', desc: 'Order verified & booked' },
  { key: 'confirmed', label: 'Artisan Allocated', desc: 'Atelier crafting assigned' },
  { key: 'packed', label: 'Quality Inspected', desc: 'Hand-packed in luxury box' },
  { key: 'shipped', label: 'Handed to Courier', desc: 'Dispatched with tracking ID' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Courier on doorstep route' },
  { key: 'delivered', label: 'Safely Delivered', desc: 'Signed & received by patron' },
];

function getCleanConsignmentId(courierCodeOrName: string, trackingId: string): string {
  const code = (courierCodeOrName || '').toLowerCase().trim();
  const rawId = (trackingId || '').trim();

  // TCS consignment numbers must be numeric digits for their React app (<input type="number">)
  if (code.includes('tcs')) {
    const digitsOnly = rawId.replace(/^tcs-?/i, '').replace(/[^0-9]/g, '');
    return digitsOnly || rawId.replace(/^tcs-?/i, '');
  }

  return rawId.replace(/^[a-z]+-?/i, '');
}

function getCourierDeepLink(courierCodeOrName: string, trackingId: string): string {
  const code = (courierCodeOrName || '').toLowerCase().trim();
  const cleanId = getCleanConsignmentId(code, trackingId);

  // TCS Express official React Route is https://www.tcsexpress.com/track/:number
  if (code.includes('tcs')) {
    return `https://www.tcsexpress.com/track/${encodeURIComponent(cleanId)}`;
  }
  if (code.includes('leopard') || code.includes('lcs')) {
    return `https://leopardscourier.com/tracking?track_no=${encodeURIComponent(cleanId)}`;
  }
  if (code.includes('call') || code.includes('callcourier') || code.includes('cc')) {
    return `https://callcourier.com.pk/tracking/?tc=${encodeURIComponent(cleanId)}`;
  }
  if (code.includes('postex')) {
    return `https://postex.pk/tracking?tracking_number=${encodeURIComponent(cleanId)}`;
  }
  if (code.includes('trax') || code.includes('sonic')) {
    return `https://trax.pk/tracking?cn=${encodeURIComponent(cleanId)}`;
  }
  if (code.includes('m&p') || code.includes('mnp') || code.includes('mulphilog')) {
    return `https://mulphilog.com/tracking?track=${encodeURIComponent(cleanId)}`;
  }

  return `https://www.tcsexpress.com/track/${encodeURIComponent(cleanId)}`;
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';
  const initialEmail = searchParams.get('email') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [contact, setContact] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState(false);

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
        setErrorMsg(data.error || 'No consignment details found for this order & contact reference.');
        setOrderData(null);
      }
    } catch {
      setErrorMsg('A temporary network error occurred while querying consignment details.');
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

  const handleCopyTrackingId = (id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const getStepIndex = (status: string) => {
    const idx = TIMELINE_STEPS.findIndex(s => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  const currentStepIdx = orderData ? getStepIndex(orderData.status) : 0;
  const trackingId = orderData?.tracking_id || orderData?.trackingId || '';
  const courierName = orderData?.courier?.name || orderData?.courier_name || (orderData?.courier_id ? String(orderData.courier_id).toUpperCase() : 'TCS Express');
  const cleanTrackingId = getCleanConsignmentId(courierName, trackingId);
  const externalLink = trackingId ? getCourierDeepLink(courierName, trackingId) : '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10 font-sans text-[#141414]">
      
      {/* Header with Luxury Haute Couture Tone */}
      <div className="text-center space-y-3 pb-6 border-b border-[#eae7e2]">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#f5efe6] border border-[#e2d5c3] text-[#b87414] mb-1 shadow-sm">
          <Truck className="w-7 h-7" />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b87414]">
          Real-Time Courier Dispatch Center
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#141414]">
          Track Your Atelier Consignment
        </h1>
        <p className="text-xs sm:text-sm text-[#6b6b6b] max-w-xl mx-auto leading-relaxed">
          Monitor your handcrafted ensembles from the Lahore atelier to your doorstep with certified courier status checkpoints.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-[#faf8f5] border border-[#e8dfd2] rounded-3xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#141414]">
              Order Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MFE-2609-0001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl bg-white border border-[#eae7e2] text-[#141414] placeholder-[#8c827a] font-mono uppercase focus:outline-none focus:border-[#d99026]"
            />
          </div>

          <div className="sm:col-span-5 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#141414]">
              Billing Email or Phone Number *
            </label>
            <input
              type="text"
              required
              placeholder="name@example.com or 0300 1234567"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl bg-white border border-[#eae7e2] text-[#141414] placeholder-[#8c827a] focus:outline-none focus:border-[#d99026]"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#d99026] hover:bg-[#c67d18] text-[#141414] font-bold text-xs p-3.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-md disabled:opacity-50 uppercase tracking-wider cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Checking...' : 'Track'}</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Tracking Results Visualizer */}
      {orderData && (
        <div className="bg-white border border-[#eae7e2] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in duration-300">
          
          {/* Summary Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#eae7e2] gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b87414] block">
                Atelier Booking Reference
              </span>
              <h2 className="font-mono text-2xl sm:text-3xl font-bold text-[#141414] mt-0.5">
                {orderData.order_number || orderData.orderNumber}
              </h2>
              <p className="text-xs text-[#6b6b6b] mt-1">
                Booked on {formatDate(orderData.created_at || orderData.createdAt)}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8c827a] block">
                Milestone Status
              </span>
              <span className="inline-block bg-[#f5efe6] text-[#b87414] border border-[#e2d5c3] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-1">
                {(orderData.status || 'pending').replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="py-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#141414] mb-6">
              Dispatch Progression
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {TIMELINE_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#d99026] text-[#141414] ring-4 ring-[#d99026]/20 shadow-md font-black'
                        : isPassed 
                        ? 'bg-[#141414] text-white shadow-sm' 
                        : 'bg-[#f0ebe3] text-[#8c827a]'
                    }`}>
                      {isPassed && !isCurrent ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div>
                      <span className={`text-xs block ${isCurrent ? 'text-[#b87414] font-bold' : isPassed ? 'text-[#141414] font-semibold' : 'text-[#8c827a]'}`}>
                        {step.label}
                      </span>
                      <span className="text-[10px] text-[#8c827a] hidden sm:block mt-0.5 leading-tight">
                        {step.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Consignment Deep-Link & 1-Click Copy Bar */}
          <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#e8dfd2] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c827a] block">
                  Courier Consignment Number (Tracking ID)
                </span>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#b87414]">
                    {cleanTrackingId || trackingId || 'Allocation in Progress'}
                  </span>

                  {trackingId && cleanTrackingId !== trackingId && (
                    <span className="text-xs text-[#8c827a] font-mono">
                      (Ref: {trackingId})
                    </span>
                  )}

                  {trackingId && (
                    <button
                      type="button"
                      onClick={() => handleCopyTrackingId(cleanTrackingId || trackingId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#eae7e2] hover:border-[#d99026] text-xs font-bold text-[#141414] hover:text-[#b87414] transition shadow-sm cursor-pointer"
                      title="Copy Consignment ID to clipboard"
                    >
                      {copiedId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Tracking ID</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {trackingId && externalLink ? (
                <div className="flex flex-col sm:items-end gap-1">
                  <a
                    href={externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCopyTrackingId(cleanTrackingId || trackingId)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#d99026] hover:bg-[#c67d18] text-[#141414] font-bold text-xs uppercase tracking-wider transition shadow-md active:scale-98"
                  >
                    <span>Track on {courierName} Portal</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <span className="text-[10px] text-[#8c827a]">
                    Direct route: <strong className="font-mono text-[#5a5550]">tcsexpress.com/track/{cleanTrackingId}</strong>
                  </span>
                </div>
              ) : (
                <div className="text-xs text-[#8c827a] italic">
                  Tracking ID will appear once picked up by courier.
                </div>
              )}
            </div>

            {/* Helper notice for users in case third-party courier redirects */}
            {trackingId && (
              <div className="p-3.5 rounded-xl bg-white border border-[#e8dfd2] text-xs text-[#6b6b6b] flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#d99026] shrink-0" />
                <span>
                  <strong>Instant Tracking:</strong> Clicking the portal button automatically copies your consignment number (<strong>{cleanTrackingId || trackingId}</strong>) to your clipboard and loads the verified courier tracking screen directly without redirecting.
                </span>
              </div>
            )}
          </div>

          {/* Delivery Destination & Order Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#eae7e2] text-xs">
            <div className="space-y-2 p-5 rounded-2xl bg-[#faf8f5] border border-[#eae7e2]">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c827a] block">
                Patron & Delivery Destination
              </span>
              <p className="font-bold text-[#141414] text-sm">
                {orderData.customer_name || orderData.customerName || 'Valued Patron'}
              </p>
              <p className="text-[#5a5550]">
                {orderData.shipping_address?.address_line1 || orderData.shippingAddress?.address_line1 || 'Address on file'}
              </p>
              <p className="text-[#8c827a]">
                {orderData.shipping_address?.city || orderData.shippingAddress?.city || 'Pakistan'}, {orderData.shipping_address?.province || orderData.shippingAddress?.province || ''}
              </p>
              <p className="text-[#8c827a] pt-1 font-mono">
                Phone: {orderData.customer_phone || orderData.customerPhone || 'On file'}
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-[#faf8f5] border border-[#eae7e2] flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c827a] block">
                  Courier Partner & Payment
                </span>
                <div className="flex justify-between items-center text-[#141414]">
                  <span className="font-semibold">Courier Partner:</span>
                  <span className="font-bold text-[#b87414]">{courierName}</span>
                </div>
                <div className="flex justify-between items-center text-[#141414]">
                  <span className="font-semibold">Payment Method:</span>
                  <span className="uppercase font-mono">{orderData.payment_method || 'COD'}</span>
                </div>
                <div className="flex justify-between items-center text-[#141414]">
                  <span className="font-semibold">Payment Status:</span>
                  <span className="font-bold uppercase text-emerald-700">{orderData.payment_status || 'Pending'}</span>
                </div>
                <div className="flex justify-between items-center text-[#141414]">
                  <span className="font-semibold">Delivery Fee:</span>
                  <span className="font-mono font-bold text-[#141414]">{formatPrice(orderData.shipping_amount ?? 100)}</span>
                </div>
                <div className="flex justify-between items-center text-[#141414] pt-2 border-t border-[#eae7e2]">
                  <span className="font-bold text-sm">Grand Total:</span>
                  <span className="font-bold font-mono text-base text-[#141414]">
                    {formatPrice(orderData.grand_total ?? orderData.grandTotal ?? 0)}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-[#8c827a] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Standard delivery takes 2 to 3 business days across Pakistan.</span>
              </div>
            </div>
          </div>

          {/* Itemized Garments */}
          {orderData.items && orderData.items.length > 0 && (
            <div className="pt-4 border-t border-[#eae7e2]">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#141414] mb-3">
                Ordered Creations ({orderData.items.length})
              </h3>
              <div className="divide-y divide-[#eae7e2]">
                {orderData.items.map((it: any) => (
                  <div key={it.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-[#141414] block">{it.product_name || it.productName}</span>
                      <span className="text-[11px] text-[#8c827a]">SKU: {it.sku || 'MFE-BESPOKE'} • Qty: {it.quantity}</span>
                    </div>
                    <span className="font-mono font-bold text-[#141414]">
                      {formatPrice(it.subtotal || ((it.unit_price || it.unitPrice) * it.quantity))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Support Concierge Notice */}
      <div className="text-center text-xs text-[#8c827a] pt-4 space-y-1">
        <p>Questions regarding your shipment? Our concierge is available daily from 10 AM to 8 PM PKT.</p>
        <p>WhatsApp Helpline: <a href="https://wa.me/923267727318" target="_blank" rel="noopener noreferrer" className="font-bold text-[#b87414] hover:underline">+92 326 7727318</a> • concierge@mfebrand.com</p>
      </div>

    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <React.Suspense fallback={<div className="text-center py-20 text-[#8c827a] font-sans text-xs">Loading tracking console...</div>}>
      <TrackOrderContent />
    </React.Suspense>
  );
}
