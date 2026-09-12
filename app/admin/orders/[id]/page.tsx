'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatus, PaymentMethodCode } from '@/types/database';
import { SEED_COURIERS } from '@/lib/data/seed-data';
import { 
  ArrowLeft, Truck, CheckCircle2, Clock, 
  MapPin, ShieldAlert, FileText, Send 
} from 'lucide-react';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [status, setStatus] = useState<OrderStatus>('shipped');
  const [courierCode, setCourierCode] = useState('tcs');
  const [trackingId, setTrackingId] = useState('TCS-98471203');
  const [internalNote, setInternalNote] = useState('');
  const [notesLog, setNotesLog] = useState<string[]>([
    'Customer confirmed shipping address via telephone call.'
  ]);
  const [savedMsg, setSavedMsg] = useState('');

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(`Order status successfully updated to ${status.toUpperCase()}!`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleUpdateCourier = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(`Shipment tracking updated: ${courierCode.toUpperCase()} - ${trackingId}!`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim()) return;
    setNotesLog([internalNote.trim(), ...notesLog]);
    setInternalNote('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white font-mono">
                Order #MFE-20260911-0001
              </h1>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase">
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on 11 Sep 2026 • Payment: Cash on Delivery (Unpaid)
            </p>
          </div>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Order Snapshots & Items (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Purchased Items Snapshot */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white pb-3 border-b border-slate-800">
              Order Items Snapshot
            </h2>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <h3 className="font-bold text-white">Royal Velvet Embroidered 3-Piece Suit</h3>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">SKU: MFE-VEL-001</div>
                  <div className="text-[10px] text-slate-500">Unit Price: Rs. 19,999 × 1</div>
                </div>
                <div className="text-sm font-black text-white">
                  Rs. 19,999
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-bold text-white">Rs. 19,999</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Coupon Discount (MFE10)</span>
                <span>-Rs. 1,999</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee</span>
                <span className="text-emerald-400 font-bold">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black text-white">
                <span>Grand Total</span>
                <span className="text-lg text-amber-500">Rs. 18,000</span>
              </div>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-black uppercase tracking-wider text-white pb-3 border-b border-slate-800">
              Customer & Delivery Address
            </h2>
            <div className="space-y-1 text-slate-300">
              <div><strong>Name:</strong> Tousif Qasim</div>
              <div><strong>Email:</strong> tousif@example.com</div>
              <div><strong>Phone:</strong> +92 300 9876543</div>
              <div><strong>Address:</strong> House 42, Street 8, Phase 5 DHA, Lahore, Punjab (54000)</div>
              <div><strong>Country:</strong> Pakistan</div>
            </div>
          </div>

          {/* Internal Admin Notes (Hidden from Customer) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Internal Admin Notes</span>
              </h2>
              <p className="text-[11px] text-slate-400">These notes are strictly private and never exposed to customers.</p>
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Add an internal note..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 rounded-xl transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {notesLog.map((note, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  {note}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Status & Courier Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Order Status Control */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white pb-3 border-b border-slate-800">
              Fulfillment Status
            </h2>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Change Order State
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition shadow"
              >
                Update Order Status
              </button>
            </form>
          </div>

          {/* Pakistani Courier & Tracking ID */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" />
              <span>Courier & Tracking ID</span>
            </h2>

            <form onSubmit={handleUpdateCourier} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Assigned Courier Partner
                </label>
                <select
                  value={courierCode}
                  onChange={(e) => setCourierCode(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {SEED_COURIERS.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Consignment / Tracking Number *
                </label>
                <input
                  type="text"
                  required
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. TCS-98471203"
                  className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs py-3 rounded-xl transition"
              >
                Save Consignment Tracking
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
