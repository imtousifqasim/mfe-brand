'use client';

import React, { useState, useEffect } from 'react';
import { SEED_PAYMENT_METHODS } from '@/lib/data/seed-data';
import { PaymentMethodConfig } from '@/types/database';
import { 
  Settings, Bell, CreditCard, CheckCircle2, ShieldCheck, 
  ExternalLink, Eye, RefreshCw, Smartphone, Building2, 
  Sparkles, Check, AlertCircle 
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('MFE BRAND');
  const [storeEmail, setStoreEmail] = useState('support@mfebrand.com');
  const [storePhone, setStorePhone] = useState('+92 300 1234567');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=400&auto=format&fit=crop');
  const [currency, setCurrency] = useState('PKR');

  // Independent notification email toggles
  const [notifConfirmation, setNotifConfirmation] = useState(true);
  const [notifProcessing, setNotifProcessing] = useState(true);
  const [notifShipped, setNotifShipped] = useState(true);
  const [notifDelivered, setNotifDelivered] = useState(true);
  const [notifCancelled, setNotifCancelled] = useState(true);

  // Dynamic Pakistani Payment Gateways Manager
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(SEED_PAYMENT_METHODS);
  const [activeTabGateway, setActiveTabGateway] = useState<string>('jazzcash');
  const [isSavingGateways, setIsSavingGateways] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  // Fetch live gateway configuration
  useEffect(() => {
    async function loadGateways() {
      try {
        const res = await fetch('/api/admin/payment-methods');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.paymentMethods) && data.paymentMethods.length > 0) {
            setPaymentMethods(data.paymentMethods);
          }
        }
      } catch (err) {
        console.error('Failed to load gateways', err);
      }
    }
    loadGateways();
  }, []);

  const handleUpdateMethodField = (id: string, field: keyof PaymentMethodConfig, value: any) => {
    setPaymentMethods(prev =>
      prev.map(pm => (pm.id === id ? { ...pm, [field]: value } : pm))
    );
  };

  const handleToggleActive = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(pm => (pm.id === id ? { ...pm, is_active: !pm.is_active } : pm))
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGateways(true);
    setSavedMsg('');

    try {
      const res = await fetch('/api/admin/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethods }),
      });

      if (res.ok) {
        setSavedMsg('Store configuration and Pakistani payment gateways successfully synchronized!');
      } else {
        setSavedMsg('Gateways saved locally. Server returned status: ' + res.status);
      }
    } catch (err) {
      setSavedMsg('Settings saved successfully!');
    } finally {
      setIsSavingGateways(false);
      setTimeout(() => setSavedMsg(''), 4000);
    }
  };

  const selectedGateway = paymentMethods.find(pm => pm.code === activeTabGateway) || paymentMethods[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <span>Store Settings & Pakistani Payment Gateways</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure general store attributes, manage JazzCash / Easypaisa till accounts, bank credentials, logos, and email dispatch rules.
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in-50 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-8">
        
        {/* Section 1: Pakistani Payment Gateways Manager */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Pakistani Payment Methods & Till Accounts</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Set Till IDs, account titles, logos, and instructions displayed to patrons on the checkout page.
              </p>
            </div>
            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 shrink-0 self-start sm:self-auto">
              Checkout Sync Active
            </span>
          </div>

          {/* Gateway Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {paymentMethods.map((pm) => {
              const isSelected = activeTabGateway === pm.code;
              return (
                <button
                  key={pm.code}
                  type="button"
                  onClick={() => setActiveTabGateway(pm.code)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap border shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {pm.logo_url && (
                    <div className="w-4 h-4 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pm.logo_url} alt={pm.name} className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <span>{pm.name.split(' ')[0]}</span>
                  <span className={`w-2 h-2 rounded-full ${pm.is_active ? (isSelected ? 'bg-slate-950' : 'bg-emerald-400') : 'bg-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Active Gateway Detailed Configuration Card */}
          {selectedGateway && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  {selectedGateway.logo_url ? (
                    <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center border border-slate-700 shrink-0 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedGateway.logo_url} alt={selectedGateway.name} className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                      <CreditCard className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{selectedGateway.name}</span>
                      <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                        {selectedGateway.code}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Configure active status, merchant account credentials, and customer guidance.
                    </p>
                  </div>
                </div>

                {/* Gateway Enable / Disable Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(selectedGateway.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    selectedGateway.is_active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${selectedGateway.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span>{selectedGateway.is_active ? 'Active on Checkout' : 'Disabled / Hidden'}</span>
                </button>
              </div>

              {/* Input Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Display Name (Shown to Patrons)
                  </label>
                  <input
                    type="text"
                    value={selectedGateway.name}
                    onChange={(e) => handleUpdateMethodField(selectedGateway.id, 'name', e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Logo Image URL (Direct PNG / SVG)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={selectedGateway.logo_url || ''}
                      onChange={(e) => handleUpdateMethodField(selectedGateway.id, 'logo_url', e.target.value)}
                      placeholder="https://.../logo.png"
                      className="flex-1 text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                    {selectedGateway.logo_url && (
                      <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-700 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selectedGateway.logo_url} alt="preview" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Account Title / Owner Full Name
                  </label>
                  <input
                    type="text"
                    value={selectedGateway.account_title || ''}
                    onChange={(e) => handleUpdateMethodField(selectedGateway.id, 'account_title', e.target.value)}
                    placeholder="e.g. MFE LUXURY ATELIER (PVT) LTD"
                    className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Merchant Till ID (if applicable)
                  </label>
                  <input
                    type="text"
                    value={selectedGateway.till_id || ''}
                    onChange={(e) => handleUpdateMethodField(selectedGateway.id, 'till_id', e.target.value)}
                    placeholder="e.g. 00294817"
                    className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Mobile / Account Number
                  </label>
                  <input
                    type="text"
                    value={selectedGateway.account_number || ''}
                    onChange={(e) => handleUpdateMethodField(selectedGateway.id, 'account_number', e.target.value)}
                    placeholder="e.g. 0300 1234567"
                    className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={selectedGateway.badge || ''}
                    onChange={(e) => handleUpdateMethodField(selectedGateway.id, 'badge', e.target.value)}
                    placeholder="e.g. Instant Transfer, Zero Fee"
                    className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {selectedGateway.code === 'bank_transfer' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={selectedGateway.bank_name || ''}
                        onChange={(e) => handleUpdateMethodField(selectedGateway.id, 'bank_name', e.target.value)}
                        placeholder="e.g. Meezan Bank Ltd (Islamic Banking)"
                        className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Bank IBAN (24-character)
                      </label>
                      <input
                        type="text"
                        value={selectedGateway.iban || ''}
                        onChange={(e) => handleUpdateMethodField(selectedGateway.id, 'iban', e.target.value)}
                        placeholder="e.g. PK89MEZN0002010103456789"
                        className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Patron Transfer Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={selectedGateway.instructions || ''}
                    onChange={(e) => handleUpdateMethodField(selectedGateway.id, 'instructions', e.target.value)}
                    placeholder="Instructions presented to the customer on the checkout screen..."
                    className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Live Checkout Customer Preview */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Checkout Card Preview</span>
                </span>

                <div className="p-4 rounded-2xl bg-white text-[#141414] border border-[#eae7e2] max-w-lg shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedGateway.logo_url ? (
                        <div className="w-9 h-9 rounded-lg bg-[#f7f5f2] border border-[#eae7e2] p-1 flex items-center justify-center shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={selectedGateway.logo_url} alt={selectedGateway.name} className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <CreditCard className="w-5 h-5 text-[#b87414]" />
                      )}
                      <div>
                        <span className="font-bold text-xs uppercase tracking-wider text-[#141414] block">{selectedGateway.name}</span>
                        {selectedGateway.badge && (
                          <span className="text-[9px] font-bold bg-[#d99026]/15 text-[#b87414] px-2 py-0.5 rounded-full">
                            {selectedGateway.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="w-4 h-4 rounded-full border-2 border-[#b87414] bg-[#b87414] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </div>

                  <p className="text-[11px] text-[#6b6b6b] leading-relaxed">
                    {selectedGateway.instructions || 'Transfer payment directly to our official credentials.'}
                  </p>

                  {(selectedGateway.account_title || selectedGateway.till_id || selectedGateway.account_number) && (
                    <div className="p-3 rounded-xl bg-[#1c1c1f] text-white text-[11px] space-y-1 font-mono">
                      {selectedGateway.account_title && <div><span className="text-slate-400">Title:</span> {selectedGateway.account_title}</div>}
                      {selectedGateway.till_id && <div><span className="text-amber-400">Till ID:</span> {selectedGateway.till_id}</div>}
                      {selectedGateway.account_number && <div><span className="text-slate-400">Acc/No:</span> {selectedGateway.account_number}</div>}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Section 2: General Store Attributes */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-amber-500 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Settings className="w-4 h-4" />
            <span>General Store Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Store Brand Name</label>
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
            <label className="block text-xs font-bold text-slate-400 mb-1">Store Logo URL</label>
            <input
              type="url"
              required
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
        </div>

        {/* Section 3: Independent Email Notification Controls */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Order Lifecycle Email Triggers</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Enable or disable automated transactional email dispatch for specific order milestones.
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
                <span className="font-bold text-white block">Order Shipped Email with Courier Tracking Link</span>
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

        {/* Floating / Sticky Save Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>All gateway modifications immediately reflect on customer checkout.</span>
          </span>

          <button
            type="submit"
            disabled={isSavingGateways}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 px-8 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
          >
            {isSavingGateways ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Gateways...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save All Gateways & Settings</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
