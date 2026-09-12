'use client';

import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCustomer } from '@/components/providers/CustomerProvider';

export default function CustomerProfilePage() {
  const { customer, updateProfile } = useCustomer();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setFullName(customer.full_name || '');
      setPhone(customer.phone || '');
    }
  }, [customer]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim(),
    });

    setSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } else {
      setError(res.error || 'Failed to update profile in database.');
    }
  };

  if (!customer) return null;

  return (
    <div className="bg-white border border-[#eae7e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl font-sans text-[#141414]">
      <div className="pb-4 border-b border-[#eae7e2]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b87414]/10 text-[#b87414] text-[10px] font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Atelier Identity</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#141414]">
          Account Profile & Security
        </h1>
        <p className="text-xs text-[#6b6b6b] mt-1">
          Manage your verified atelier contact details and delivery identity.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Profile changes successfully updated in atelier database!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold text-[#525252] uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full text-xs p-3.5 rounded-xl bg-[#faf8f5] border border-[#eae7e2] text-[#141414] placeholder-[#8c827a] focus:outline-none focus:border-[#b87414]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#525252] uppercase tracking-wider mb-1.5">
            Verified Email Address
          </label>
          <input
            type="email"
            disabled
            value={customer.email}
            className="w-full text-xs p-3.5 rounded-xl bg-[#f5f1eb] border border-[#eae7e2] text-[#8c827a] cursor-not-allowed"
          />
          <span className="text-[10px] text-[#8c827a] mt-1 block">
            Email is permanently bound to your Maison patron record.
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#525252] uppercase tracking-wider mb-1.5">
            Contact Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+92 300 1234567"
            className="w-full text-xs p-3.5 rounded-xl bg-[#faf8f5] border border-[#eae7e2] text-[#141414] placeholder-[#8c827a] focus:outline-none focus:border-[#b87414]"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-[#141414] text-white hover:bg-[#262626] transition shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{saving ? 'Saving...' : 'Save Profile Details'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
