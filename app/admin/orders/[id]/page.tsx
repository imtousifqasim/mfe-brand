'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatus, PaymentMethodCode } from '@/types/database';
import { SEED_COURIERS } from '@/lib/data/seed-data';
import { 
  ArrowLeft, Truck, CheckCircle2, Clock, 
  MapPin, ShieldAlert, FileText, Send, Loader2,
  ExternalLink, User, Phone, Mail, Package, AlertCircle,
  CreditCard, Calendar, Trash2
} from 'lucide-react';

const PAKISTAN_COURIERS = [
  { code: 'tcs', name: 'TCS Express', portal: 'https://www.tcsexpress.com/track/' },
  { code: 'leopards', name: 'Leopards Courier', portal: 'https://leopardscourier.com/tracking?track_no=' },
  { code: 'callcourier', name: 'Call Courier (CC)', portal: 'https://callcourier.com.pk/tracking/?tc=' },
  { code: 'postex', name: 'PostEx Logistics', portal: 'https://postex.pk/tracking?tracking_number=' },
  { code: 'trax', name: 'Trax Logistics', portal: 'https://trax.pk/tracking?cn=' },
  { code: 'mnp', name: 'M&P Express Logistics', portal: 'https://mulphilog.com/tracking?track=' },
  { code: 'pakpost', name: 'Pakistan Post', portal: 'https://ep.gov.pk/track.asp?art_id=' },
];

const ORDER_STATUSES: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'Pending Verification' },
  { key: 'processing', label: 'Processing at Atelier' },
  { key: 'confirmed', label: 'Confirmed by Patron' },
  { key: 'packed', label: 'Packed & Ready for Dispatch' },
  { key: 'shipped', label: 'Shipped with Courier' },
  { key: 'out_for_delivery', label: 'Out for Doorstep Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<OrderStatus>('pending');
  const [courierCode, setCourierCode] = useState('tcs');
  const [trackingId, setTrackingId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [internalNote, setInternalNote] = useState('');
  const [notesLog, setNotesLog] = useState<any[]>([]);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingCourier, setIsUpdatingCourier] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDeleteOrder = async () => {
    setIsDeletingOrder(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin/orders');
      } else {
        setErrorMsg(data.error || 'Failed to delete order.');
        setIsConfirmingDelete(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting order.');
      setIsConfirmingDelete(false);
    } finally {
      setIsDeletingOrder(false);
    }
  };

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      if (res.ok && data.success && data.order) {
        const ord = data.order;
        setOrder(ord);
        setStatus(ord.status || 'pending');
        setPaymentStatus(ord.payment_status || 'unpaid');
        setTrackingId(ord.tracking_id || '');
        if (ord.courier_id) {
          setCourierCode(ord.courier_id.toLowerCase());
        }
        if (ord.internal_notes) {
          setNotesLog(ord.internal_notes);
        }
      } else {
        setErrorMsg(data.error || 'Order not found.');
      }
    } catch (e) {
      console.error('Failed to load order:', e);
      setErrorMsg('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    setSavedMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedMsg(`Order status updated to "${status.toUpperCase()}"!`);
        if (data.order) setOrder(data.order);
      } else {
        setErrorMsg(data.error || 'Failed to update order status.');
      }
    } catch {
      setErrorMsg('Network error updating status.');
    } finally {
      setIsUpdatingStatus(false);
      setTimeout(() => setSavedMsg(null), 4000);
    }
  };

  const handleUpdateCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      setErrorMsg('Please enter a valid tracking consignment number.');
      return;
    }
    setIsUpdatingCourier(true);
    setSavedMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierCode, trackingId: trackingId.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedMsg(`Shipment assigned: ${courierCode.toUpperCase()} (${trackingId.trim()})!`);
        setStatus('shipped');
        if (data.order) setOrder(data.order);
      } else {
        setErrorMsg(data.error || 'Failed to update shipment.');
      }
    } catch {
      setErrorMsg('Network error updating shipment.');
    } finally {
      setIsUpdatingCourier(false);
      setTimeout(() => setSavedMsg(null), 4000);
    }
  };

  const handleUpdatePaymentStatus = async (newPayStatus: string) => {
    setIsUpdatingPayment(true);
    setSavedMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newPayStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentStatus(newPayStatus);
        setSavedMsg(`Payment status updated to ${newPayStatus.toUpperCase()}!`);
        if (data.order) setOrder(data.order);
      }
    } catch {}
    finally {
      setIsUpdatingPayment(false);
      setTimeout(() => setSavedMsg(null), 3000);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_note', note: internalNote.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotesLog([
          {
            id: `note-${Date.now()}`,
            note: internalNote.trim(),
            created_by: 'Admin Concierge',
            created_at: new Date().toISOString(),
          },
          ...notesLog,
        ]);
        setInternalNote('');
      }
    } catch {}
    finally {
      setIsAddingNote(false);
    }
  };

  const selectedCourierObj = PAKISTAN_COURIERS.find(c => c.code === courierCode) || PAKISTAN_COURIERS[0];
  const cleanTrackingDigits = courierCode === 'tcs' 
    ? (trackingId.replace(/^tcs-?/i, '').replace(/[^0-9]/g, '') || trackingId.replace(/^tcs-?/i, '').trim())
    : trackingId.replace(/^[a-z]+-?/i, '').trim();
  const liveCourierUrl = trackingId.trim() ? `${selectedCourierObj.portal}${encodeURIComponent(cleanTrackingDigits)}` : null;

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
        <p className="text-xs text-slate-400">Retrieving consignment dossier from database...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Order Not Found</h2>
        <p className="text-xs text-slate-400">
          We could not locate an order matching ID &quot;{orderId}&quot;. It may have been deleted or archived.
        </p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Orders List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 text-slate-800">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {order.order_number}
              </h1>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {order.status.replace(/_/g, ' ')}
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                paymentStatus === 'paid' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {paymentStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>Booked on {formatDate(order.created_at)}</span>
              <span>•</span>
              <span className="capitalize">{order.payment_method?.replace(/_/g, ' ')}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/track-order?order=${order.order_number}&email=${encodeURIComponent(order.customer_email || '')}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs"
          >
            <span>Patron Tracking View</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Delete Order</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-slate-900">Permanently Delete Order?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete order <span className="font-mono font-bold text-slate-800">{order.order_number}</span>? This action cannot be reversed and all related order history will be deleted.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isDeletingOrder}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOrder}
                disabled={isDeletingOrder}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isDeletingOrder ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{savedMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Customer, Items & Financials (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customer & Shipping Details */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-amber-600" />
              <span>Customer & Delivery Destination</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Patron Details</span>
                <p className="font-bold text-slate-900 text-sm">{order.customer_name}</p>
                <p className="text-slate-600 flex items-center gap-1.5 pt-0.5">
                  <Mail className="w-3 h-3 text-slate-400" /> {order.customer_email}
                </p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" /> {order.customer_phone}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Shipping Address</span>
                <p className="text-slate-800 font-medium">
                  {order.shipping_address?.address_line1 || 'Main Delivery Address'}
                </p>
                {order.shipping_address?.address_line2 && (
                  <p className="text-slate-500">{order.shipping_address.address_line2}</p>
                )}
                <p className="text-amber-700 font-bold">
                  {order.shipping_address?.city || 'Pakistan'}, {order.shipping_address?.province || ''}
                </p>
                {order.shipping_address?.postal_code && (
                  <p className="text-slate-400 font-mono text-[10px]">Postal Code: {order.shipping_address.postal_code}</p>
                )}
              </div>
            </div>

            {order.notes && (
              <div className="pt-3 border-t border-slate-100 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Customer Delivery Instructions:</span>
                <p className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 italic">
                  &quot;{order.notes}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Purchased Items Snapshot */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Package className="w-4 h-4 text-amber-600" />
              <span>Purchased Ensemble Items ({order.items?.length || 1})</span>
            </h2>

            <div className="space-y-2.5">
              {order.items && order.items.length > 0 ? (
                order.items.map((it: any, idx: number) => (
                  <div key={it.id || idx} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex justify-between items-center text-xs">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{it.product_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-slate-400">SKU: {it.sku}</span>
                        {(it.selected_size || it.size || (it.attributes && it.attributes.size)) && (
                          <span className="bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded-md text-[11px] border border-amber-300 shadow-2xs">
                            Size: {it.selected_size || it.size || it.attributes?.size}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {formatPrice(it.unit_price)} × {it.quantity} piece{it.quantity > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {formatPrice(it.subtotal || (it.unit_price * it.quantity))}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  Default haute couture order allocation.
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatPrice(order.subtotal || order.grand_total)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping & Insurance</span>
                <span className={order.shipping_amount > 0 ? 'font-bold text-slate-900' : 'text-emerald-700 font-bold'}>
                  {order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : 'FREE COURIER'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
                <span>Grand Total</span>
                <span className="text-slate-900 font-mono font-black">{formatPrice(order.grand_total)}</span>
              </div>
            </div>
          </div>

          {/* Internal Atelier Notes */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Internal Concierge Notes & Timeline</span>
            </h2>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Log internal note (e.g. Fabric inspected, tailor confirmed)..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
              />
              <button
                type="submit"
                disabled={isAddingNote || !internalNote.trim()}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Send className="w-3 h-3 text-amber-400" /> Add
              </button>
            </form>

            <div className="space-y-2 pt-2 text-xs">
              {notesLog.length > 0 ? (
                notesLog.map((n, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-bold text-slate-700">{n.created_by || 'Admin Concierge'}</span>
                      <span>{n.created_at ? formatDate(n.created_at) : 'Just now'}</span>
                    </div>
                    <p className="text-slate-800">{n.note || n}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">No concierge notes logged for this order yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Dispatch Logistics (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Action 1: Assign Pakistani Courier & Tracking */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600" />
              <span>Pakistani Courier Dispatch</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Assign consignment number to automatically embed deep-link parcel tracking and mark parcel as shipped.
            </p>

            <form onSubmit={handleUpdateCourier} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Select Courier Partner
                </label>
                <select
                  value={courierCode}
                  onChange={(e) => setCourierCode(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                >
                  {PAKISTAN_COURIERS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Consignment / Tracking Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TCS-77291048 or LEOP-991823"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                />
              </div>

              {liveCourierUrl && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Deep-Link Generated:</span>
                  <a
                    href={liveCourierUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-700 text-[11px] font-mono hover:underline flex items-center gap-1 truncate font-semibold"
                  >
                    <span>{liveCourierUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdatingCourier || !trackingId.trim()}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
              >
                {isUpdatingCourier ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Saving to Shards...</span>
                  </>
                ) : (
                  <span>Update Courier & Set Shipped</span>
                )}
              </button>
            </form>
          </div>

          {/* Action 2: Update Lifecycle Status */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Update Order Lifecycle</span>
            </h2>

            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Order Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isUpdatingStatus}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition border border-slate-200 shadow-2xs cursor-pointer"
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Status...</span>
                  </>
                ) : (
                  <span>Save Status Change</span>
                )}
              </button>
            </form>
          </div>

          {/* Action 3: Payment Verification */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>Payment Status Verification</span>
            </h2>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleUpdatePaymentStatus('paid')}
                disabled={isUpdatingPayment || paymentStatus === 'paid'}
                className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer ${
                  paymentStatus === 'paid'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ✓ Mark Paid
              </button>
              <button
                type="button"
                onClick={() => handleUpdatePaymentStatus('unpaid')}
                disabled={isUpdatingPayment || paymentStatus === 'unpaid'}
                className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer ${
                  paymentStatus === 'unpaid'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Mark Unpaid
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
