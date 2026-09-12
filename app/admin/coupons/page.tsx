'use client';

import React, { useState } from 'react';
import { CouponRepository } from '@/repositories/coupon.repository';
import { Coupon } from '@/types/database';
import { formatPrice } from '@/lib/utils';
import { Tag, Plus, CheckCircle2 } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: 'cp-1',
      code: 'MFE10',
      description: '10% Welcome Discount for MFE Brand Shoppers',
      discount_type: 'percentage',
      discount_value: 10,
      minimum_spend: 3000,
      maximum_discount: 1500,
      is_active: true,
    },
    {
      id: 'cp-2',
      code: 'FLAT500',
      description: 'Flat PKR 500 discount on orders above PKR 5,000',
      discount_type: 'fixed_amount',
      discount_value: 500,
      minimum_spend: 5000,
      maximum_discount: 500,
      is_active: true,
    }
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [val, setVal] = useState('10');
  const [minSpend, setMinSpend] = useState('3000');
  const [maxDisc, setMaxDisc] = useState('1500');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newCoupon: Coupon = {
      id: `cp-${Date.now()}`,
      code: code.trim().toUpperCase(),
      description: desc,
      discount_type: type,
      discount_value: Number(val),
      minimum_spend: Number(minSpend),
      maximum_discount: maxDisc ? Number(maxDisc) : null,
      is_active: true,
    };
    setCoupons([newCoupon, ...coupons]);
    setShowAdd(false);
    setCode('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Coupons & Discount Rules ({coupons.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create promotional discount codes. All coupons are strictly validated server-side during checkout.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Coupon</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-500">
            Create New Promotional Coupon
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. MFE20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Discount Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_amount">Fixed Amount (PKR)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Discount Value *</label>
              <input
                type="number"
                required
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Minimum Spend (PKR)</label>
              <input
                type="number"
                value={minSpend}
                onChange={(e) => setMinSpend(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Maximum Discount Cap (PKR)</label>
              <input
                type="number"
                value={maxDisc}
                onChange={(e) => setMaxDisc(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. 20% off on winter lawn unstitched"
              className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="text-xs px-4 py-2 rounded-xl border border-slate-800 text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-500 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl"
            >
              Save Coupon
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {coupons.map((c) => (
          <div key={c.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-black text-amber-400 tracking-wider">
                {c.code}
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                Active
              </span>
            </div>

            <p className="text-xs text-slate-300">{c.description}</p>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1">
              <div>
                <strong>Benefit:</strong> {c.discount_type === 'percentage' ? `${c.discount_value}% Discount` : `Flat ${formatPrice(c.discount_value)} OFF`}
              </div>
              {c.minimum_spend && <div><strong>Min Spend:</strong> {formatPrice(c.minimum_spend)}</div>}
              {c.maximum_discount && <div><strong>Max Discount Cap:</strong> {formatPrice(c.maximum_discount)}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
