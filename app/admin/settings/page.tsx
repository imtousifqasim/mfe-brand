'use client';

import React, { useState } from 'react';
import { SEED_PAYMENT_METHODS } from '@/lib/data/seed-data';
import { Settings, Bell, CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('MFE BRAND');
  const [storeEmail, setStoreEmail] = useState('support@mfebrand.com');
  const [storePhone, setStorePhone] = useState('+92 300 1234567');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=400&auto=format&fit=crop');
  const [currency, setCurrency] = useState('PKR');

  // Independent notification email toggles (Section 20)
  const [notifConfirmation, setNotifConfirmation] = useState(true);
  const [notifProcessing, setNotifProcessing] = useState(true);
  const [notifShipped, setNotifShipped] = useState(true);
  const [notifDelivered, setNotifDelivered] = useState(true);
  const [notifCancelled, setNotifCancelled] = useState(true);

  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg('Store configuration and notification preferences saved!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-black text-white">
          Store Settings & Notification Gateways
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure general store attributes, Pakistani payment accounts, and independent email dispatch rules.
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* General Store Attributes */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-amber-500 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Settings className="w-4 h-4" />
            <span>General Store Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Currency Code</label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Official Support Email</label>
              <input
                type="email"
                required
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Helpline Phone Number</label>
              <input
                type="tel"
                required
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Store Logo URL (External URL - Zero Storage)</label>
            <input
              type="url"
              required
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
        </div>

        {/* Independent Email Notification Controls (Section 20) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Independent Email Notification Toggles</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Enable or disable customer email dispatch for specific order lifecycle events.
            </p>
          </div>

          <div className="space-y-3 divide-y divide-slate-800/80">
            <div className="pt-2 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">Order Confirmation Email</span>
                <span className="text-slate-400 text-[11px]">Sent immediately upon successful checkout</span>
              </div>
              <input
                type="checkbox"
                checked={notifConfirmation}
                onChange={(e) => setNotifConfirmation(e.target.checked)}
                className="rounded text-amber-500 w-4 h-4"
              />
            </div>

            <div className="pt-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">Order Processing Email</span>
                <span className="text-slate-400 text-[11px]">Sent when warehouse begins preparing parcel</span>
              </div>
              <input
                type="checkbox"
                checked={notifProcessing}
                onChange={(e) => setNotifProcessing(e.target.checked)}
                className="rounded text-amber-500 w-4 h-4"
              />
            </div>

            <div className="pt-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">Order Shipped Email with Tracking URL</span>
                <span className="text-slate-400 text-[11px]">Sent with courier name, tracking ID, and tracking link</span>
              </div>
              <input
                type="checkbox"
                checked={notifShipped}
                onChange={(e) => setNotifShipped(e.target.checked)}
                className="rounded text-amber-500 w-4 h-4"
              />
            </div>

            <div className="pt-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">Doorstep Delivery Completion Email</span>
                <span className="text-slate-400 text-[11px]">Sent when courier marks parcel delivered</span>
              </div>
              <input
                type="checkbox"
                checked={notifDelivered}
                onChange={(e) => setNotifDelivered(e.target.checked)}
                className="rounded text-amber-500 w-4 h-4"
              />
            </div>

            <div className="pt-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">Order Cancellation Notice</span>
                <span className="text-slate-400 text-[11px]">Sent if order is cancelled</span>
              </div>
              <input
                type="checkbox"
                checked={notifCancelled}
                onChange={(e) => setNotifCancelled(e.target.checked)}
                className="rounded text-amber-500 w-4 h-4"
              />
            </div>
          </div>
        </div>

        {/* Pakistani Payment Gateway Accounts (Section 66) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-amber-500 flex items-center gap-2 border-b border-slate-800 pb-3">
            <CreditCard className="w-4 h-4" />
            <span>Configured Pakistani Payment Gateways</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SEED_PAYMENT_METHODS.map((pm) => (
              <div key={pm.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{pm.name}</span>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">Active</span>
                </div>
                <p className="text-slate-400 text-[11px]">{pm.instructions}</p>
                {pm.account_details && (
                  <pre className="font-mono text-[10px] text-slate-300 whitespace-pre-wrap bg-slate-900 p-2 rounded">{pm.account_details}</pre>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3.5 px-8 rounded-xl transition shadow"
          >
            Save All Preferences
          </button>
        </div>

      </form>
    </div>
  );
}
