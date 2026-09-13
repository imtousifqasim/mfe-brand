'use client';

import React, { useState, useEffect } from 'react';
import { Address } from '@/types/database';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useCustomer } from '@/components/providers/CustomerProvider';

export default function CustomerAddressesPage() {
  const { customer } = useCustomer();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('Lahore');
  const [newProvince, setNewProvince] = useState('Punjab');
  const [newPostal, setNewPostal] = useState('54000');

  // Load from local storage scoped by customer id and combine with server order addresses
  useEffect(() => {
    if (!customer) return;
    const storageKey = `mfe_addresses_${customer.id}`;
    let localList: Address[] = [];
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        localList = JSON.parse(saved);
      } catch {
        localList = [];
      }
    }

    // Also fetch addresses derived from their live orders
    fetch('/api/auth/customer/addresses')
      .then((res) => res.json())
      .then((data) => {
        const serverAddrs: Address[] = data.addresses || [];
        const combined = [...localList];
        for (const s of serverAddrs) {
          if (!combined.some(c => c.address_line1?.toLowerCase().trim() === s.address_line1?.toLowerCase().trim())) {
            combined.push(s);
          }
        }
        setAddresses(combined);
      })
      .catch(() => {
        setAddresses(localList);
      });

    // Default first and last name from customer full name
    const parts = (customer.full_name || '').split(' ');
    setNewFirst(parts[0] || '');
    setNewLast(parts.slice(1).join(' ') || '');
    setNewEmail(customer.email || '');
    setNewPhone(customer.phone || '');
  }, [customer]);

  const saveAddressesToStorage = (updated: Address[]) => {
    if (!customer) return;
    localStorage.setItem(`mfe_addresses_${customer.id}`, JSON.stringify(updated));
    setAddresses(updated);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      customer_id: customer.id,
      first_name: newFirst.trim(),
      last_name: newLast.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      address_line1: newLine1.trim(),
      city: newCity,
      province: newProvince,
      postal_code: newPostal,
      country: 'Pakistan',
      address_type: 'both',
      is_default_shipping: addresses.length === 0,
      is_default_billing: addresses.length === 0,
      created_at: new Date().toISOString(),
    };

    const updated = [...addresses, newAddr];
    saveAddressesToStorage(updated);
    setShowAddForm(false);
    setNewLine1('');
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    saveAddressesToStorage(updated);
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      is_default_shipping: a.id === id,
      is_default_billing: a.id === id,
    }));
    saveAddressesToStorage(updated);
  };

  if (!customer) return null;

  return (
    <div className="bg-white border border-[#eae7e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 font-sans text-[#141414]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae7e2]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b87414]/10 text-[#b87414] text-[10px] font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Delivery Destinations</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#141414]">
            Saved Delivery Addresses ({addresses.length})
          </h1>
          <p className="text-xs text-[#6b6b6b] mt-1">
            Dispatch destinations for your bespoke orders with complimentary express handling.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 text-xs bg-[#141414] hover:bg-[#262626] text-white font-bold px-5 py-2.5 rounded-full transition shadow uppercase tracking-wider cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#b87414]" />
          <span>Add New Address</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddAddress} className="p-6 rounded-2xl bg-[#faf8f5] border border-[#b87414]/30 space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#141414]">Add Delivery Destination</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-wider mb-1">First Name *</label>
              <input
                type="text"
                required
                value={newFirst}
                onChange={(e) => setNewFirst(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-[#b87414]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-wider mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={newLast}
                onChange={(e) => setNewLast(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-[#b87414]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-wider mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full text-xs p-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-[#b87414]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-wider mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-[#b87414]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-wider mb-1">Street Address Line *</label>
              <input
                type="text"
                required
                value={newLine1}
                onChange={(e) => setNewLine1(e.target.value)}
                placeholder="House / Apartment #, Street, Phase / Sector"
                className="w-full text-xs p-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-[#b87414]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-wider mb-1">City *</label>
              <input
                type="text"
                required
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-[#b87414]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-wider mb-1">Province *</label>
              <select
                value={newProvince}
                onChange={(e) => setNewProvince(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-[#b87414]"
              >
                <option value="Punjab">Punjab</option>
                <option value="Sindh">Sindh</option>
                <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                <option value="Balochistan">Balochistan</option>
                <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-5 py-2.5 rounded-full text-xs text-[#6b6b6b] hover:text-[#141414] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#141414] text-white hover:bg-[#262626] transition shadow"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showAddForm ? (
        <div className="text-center py-12 text-[#6b6b6b]">
          <MapPin className="w-10 h-10 mx-auto mb-2 text-[#b87414]/40" />
          <p className="text-xs">No saved delivery destinations yet.</p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="mt-3 text-xs text-[#b87414] font-bold hover:underline"
          >
            + Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 rounded-2xl border transition-all ${
                addr.is_default_shipping
                  ? 'bg-amber-500/5 border-[#b87414]/40 shadow-sm'
                  : 'bg-[#faf8f5] border-[#eae7e2]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-base text-[#141414]">
                    {addr.first_name} {addr.last_name}
                  </span>
                  {addr.is_default_shipping && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-[#b87414]/15 text-[#b87414] border border-[#b87414]/30 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-neutral-400 hover:text-rose-600 transition"
                  title="Remove address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-[#6b6b6b] space-y-1">
                <p className="text-[#141414] font-medium">{addr.address_line1}</p>
                <p>{addr.city}, {addr.province} {addr.postal_code}</p>
                <p className="pt-2 text-[11px] text-[#8c827a]">Phone: {addr.phone}</p>
              </div>

              {!addr.is_default_shipping && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr.id)}
                  className="mt-4 text-[11px] font-semibold text-[#b87414] hover:text-[#975c09] transition block"
                >
                  Set as Default Destination
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
