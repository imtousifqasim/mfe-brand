'use client';

import React, { useState, useEffect } from 'react';
import { Coupon } from '@/types/database';
import { formatPrice } from '@/lib/utils';
import { Tag, Plus, CheckCircle2, Trash2, RefreshCw, AlertCircle, Sparkles, Check, Copy } from 'lucide-react';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [val, setVal] = useState('10');
  const [minSpend, setMinSpend] = useState('3000');
  const [maxDisc, setMaxDisc] = useState('1500');
  const [creating, setCreating] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; couponId: string; code: string }>({
    isOpen: false,
    couponId: '',
    code: '',
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.coupons)) {
          setCoupons(data.coupons);
        }
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          description: desc,
          discount_type: type,
          discount_value: Number(val),
          minimum_spend: Number(minSpend),
          maximum_discount: maxDisc ? Number(maxDisc) : null,
          is_active: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBannerMsg({ type: 'success', text: `Coupon "${code.toUpperCase()}" created and synced with live store header!` });
        setShowAdd(false);
        setCode('');
        setDesc('');
        fetchCoupons();
      } else {
        setBannerMsg({ type: 'error', text: data.error || 'Failed to create coupon' });
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Error saving coupon to database.' });
    } finally {
      setCreating(false);
      setTimeout(() => setBannerMsg(null), 4000);
    }
  };

  const confirmDelete = async () => {
    const { couponId, code: couponCode } = deleteModal;
    setDeleteModal({ isOpen: false, couponId: '', code: '' });

    try {
      const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(couponId)}&code=${encodeURIComponent(couponCode)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.id !== couponId && c.code !== couponCode));
        setBannerMsg({ type: 'success', text: `Coupon "${couponCode}" permanently deleted from database.` });
      } else {
        setBannerMsg({ type: 'error', text: 'Failed to delete coupon from database.' });
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Error deleting coupon.' });
    } finally {
      setTimeout(() => setBannerMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-amber-600" />
            <span>Coupons & Discount Rules ({coupons.length})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Active coupons are permanently saved in Supabase and automatically rotate in the storefront announcement bar and header.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCoupons}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-2xs cursor-pointer"
            title="Refresh Coupons"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          <button
            onClick={() => setShowAdd(!showAdd)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Global Status Banner */}
      {bannerMsg && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border shadow-xs animate-in fade-in duration-200 ${
          bannerMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' 
            : 'bg-rose-50 border-rose-200 text-rose-800 font-medium'
        }`}>
          {bannerMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{bannerMsg.text}</span>
        </div>
      )}

      {/* Create Coupon Modal Form */}
      {showAdd && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-white border border-slate-200/90 space-y-4 shadow-xs animate-in fade-in-50 duration-200">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Create New Promotional Coupon</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. VIP20 or EID500"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 uppercase font-mono font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Discount Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_amount">Fixed Amount (PKR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {type === 'percentage' ? 'Percentage Off (%)' : 'Amount Off (PKR)'}
              </label>
              <input
                type="number"
                required
                min={1}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Minimum Order Spend (PKR)</label>
              <input
                type="number"
                min={0}
                value={minSpend}
                onChange={(e) => setMinSpend(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Maximum Discount Cap (PKR)</label>
              <input
                type="number"
                min={0}
                placeholder="Optional (e.g. 2000)"
                value={maxDisc}
                onChange={(e) => setMaxDisc(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Patron Description</label>
            <input
              type="text"
              placeholder="e.g. 10% Welcome Discount for MFE Brand Shoppers"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {creating ? 'Saving...' : 'Save & Publish Coupon'}
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-600 mx-auto mb-2" />
            <span>Loading active promotions from database...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Tag className="w-8 h-8 text-slate-400 mx-auto" />
            <p>No discount coupons found in database.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="text-amber-600 underline font-bold cursor-pointer"
            >
              Create your first promotional coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] bg-slate-50/70">
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount Value</th>
                  <th className="py-3.5 px-4">Minimum Spend</th>
                  <th className="py-3.5 px-4">Max Discount Cap</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => (
                  <tr key={c.id || c.code} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-black text-amber-600 text-sm">
                      {c.code}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {c.discount_type === 'percentage'
                        ? `${c.discount_value}% OFF`
                        : formatPrice(c.discount_value)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {c.minimum_spend ? formatPrice(c.minimum_spend) : 'No Minimum'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {c.maximum_discount ? formatPrice(c.maximum_discount) : 'Unlimited'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {c.description || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.is_active 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {c.is_active ? 'Live on Store' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteModal({ isOpen: true, couponId: c.id, code: c.code })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern Confirmation Modal */}
      <AdminConfirmModal
        isOpen={deleteModal.isOpen}
        title="Permanently Delete Coupon"
        message={`Are you sure you want to permanently delete coupon code "${deleteModal.code}"? This will immediately remove it from the database and the storefront announcement bar.`}
        confirmText="Delete Coupon"
        variant="danger"
        onConfirm={confirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, couponId: '', code: '' })}
      />

    </div>
  );
}
