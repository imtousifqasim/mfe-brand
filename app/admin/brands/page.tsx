'use client';

import React, { useState } from 'react';
import { SEED_BRANDS } from '@/lib/data/seed-data';
import { Brand } from '@/types/database';
import { ExternalImage } from '@/components/media/ExternalImage';
import { Sparkles, Plus, CheckCircle2 } from 'lucide-react';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(SEED_BRANDS);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=300&auto=format&fit=crop');
  const [saved, setSaved] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newBrand: Brand = {
      id: `brand-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: desc,
      logo_url: logoUrl,
      sort_order: brands.length + 1,
      is_active: true,
    };
    setBrands([...brands, newBrand]);
    setShowAdd(false);
    setName('');
    setDesc('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Brands & Labels Directory ({brands.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage store sub-brands, designer houses, and external label assets.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Brand</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Brand saved successfully!</span>
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-600">
            Create Brand Label
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">External Brand Logo URL *</label>
            <input
              type="url"
              required
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="text-xs px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              Save Brand
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {brands.map((b) => (
          <div key={b.id} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition space-y-4 flex flex-col items-center text-center">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 shadow-xs">
              <ExternalImage src={b.logo_url} alt={b.name} fill className="object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">{b.name}</h3>
              <p className="text-[11px] font-mono text-slate-400">/{b.slug}</p>
              <p className="text-xs text-slate-600 mt-1">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
