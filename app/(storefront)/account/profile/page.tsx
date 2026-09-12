'use client';

import React, { useState } from 'react';
import { User, CheckCircle2 } from 'lucide-react';

export default function CustomerProfilePage() {
  const [fullName, setFullName] = useState('Tousif Qasim');
  const [email, setEmail] = useState('tousif@example.com');
  const [phone, setPhone] = useState('+92 300 9876543');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 max-w-xl font-sans">
      <div className="pb-4 border-b border-white/[0.08]">
        <h1 className="font-serif text-2xl font-bold text-white">
          Account Profile & Security
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Update personal name, verified email, and contact phone number.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full text-xs p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-xs p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
            Primary Phone Number
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full text-xs p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs py-3.5 px-8 rounded-full transition shadow-lg shadow-amber-500/10 uppercase tracking-wider"
        >
          Save Profile Details
        </button>
      </form>
    </div>
  );
}
