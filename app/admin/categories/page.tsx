'use client';

import React, { useState } from 'react';
import { SEED_CATEGORIES } from '@/lib/data/seed-data';
import { Category } from '@/types/database';
import { ExternalImage } from '@/components/media/ExternalImage';
import { Layers, Plus, CheckCircle2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop');
  const [saved, setSaved] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: desc,
      image_url: imageUrl,
      sort_order: categories.length + 1,
      is_active: true,
    };
    setCategories([...categories, newCat]);
    setShowAdd(false);
    setName('');
    setSlug('');
    setDesc('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Category Management ({categories.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage product categories. All category banners are stored as external URLs only.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Category</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Category created successfully!</span>
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-500">
            Add Store Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">External Banner Image URL (CDN / Hosting) *</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
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
              Save Category
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <ExternalImage src={cat.image_url} alt={cat.name} fill className="object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{cat.name}</h3>
              <p className="text-[11px] font-mono text-slate-500">/{cat.slug}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
