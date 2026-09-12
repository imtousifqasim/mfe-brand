'use client';

import React, { useState } from 'react';
import { Address } from '@/types/database';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
      customer_id: 'user-1',
      first_name: 'Tousif',
      last_name: 'Qasim',
      phone: '+92 300 9876543',
      email: 'tousif@example.com',
      address_line1: 'House 42, Street 8, Phase 5 DHA',
      city: 'Lahore',
      province: 'Punjab',
      postal_code: '54000',
      country: 'Pakistan',
      address_type: 'both',
      is_default_shipping: true,
      is_default_billing: true,
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('Lahore');
  const [newProvince, setNewProvince] = useState('Punjab');
  const [newPostal, setNewPostal] = useState('54000');

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      customer_id: 'user-1',
      first_name: newFirst,
      last_name: newLast,
      phone: newPhone,
      email: newEmail,
      address_line1: newLine1,
      city: newCity,
      province: newProvince,
      postal_code: newPostal,
      country: 'Pakistan',
      address_type: 'both',
      is_default_shipping: addresses.length === 0,
      is_default_billing: addresses.length === 0,
    };
    setAddresses([...addresses, newAddr]);
    setShowAddForm(false);
    setNewFirst('');
    setNewLast('');
    setNewLine1('');
  };

  const deleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  return (
    <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            Saved Addresses ({addresses.length})
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your default shipping and billing addresses for fast 1-click checkout.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-full transition shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Address</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddAddress} className="p-6 rounded-2xl bg-neutral-900/60 border border-white/[0.08] space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Add Shipping / Billing Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="First Name *"
              value={newFirst}
              onChange={(e) => setNewFirst(e.target.value)}
              className="text-xs p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              required
              placeholder="Last Name *"
              value={newLast}
              onChange={(e) => setNewLast(e.target.value)}
              className="text-xs p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="tel"
              required
              placeholder="Phone (0300...)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="text-xs p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="email"
              required
              placeholder="Email *"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="text-xs p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <input
            type="text"
            required
            placeholder="Address Line 1 (Street, House #) *"
            value={newLine1}
            onChange={(e) => setNewLine1(e.target.value)}
            className="w-full text-xs p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="City"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              className="text-xs p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              required
              placeholder="Province"
              value={newProvince}
              onChange={(e) => setNewProvince(e.target.value)}
              className="text-xs p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              required
              placeholder="Postal Code"
              value={newPostal}
              onChange={(e) => setNewPostal(e.target.value)}
              className="text-xs p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs px-5 py-2.5 rounded-full border border-neutral-700 text-neutral-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-full shadow-md"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="p-6 rounded-2xl bg-neutral-900/40 border border-white/[0.08] relative space-y-3 hover:border-amber-500/40 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs text-white">
                  {addr.first_name} {addr.last_name}
                </span>
              </div>
              <button
                onClick={() => deleteAddress(addr.id)}
                className="text-neutral-500 hover:text-rose-400 transition"
                title="Delete address"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs text-neutral-300 space-y-1">
              <p>{addr.address_line1}</p>
              <p>{addr.city}, {addr.province} {addr.postal_code}</p>
              <p className="text-neutral-500">Phone: {addr.phone}</p>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
              {addr.is_default_shipping && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Default Shipping
                </span>
              )}
              {addr.is_default_billing && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
                  Default Billing
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
