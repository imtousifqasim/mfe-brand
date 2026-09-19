'use client';

import React, { useState } from 'react';
import { SEED_CATEGORIES } from '@/lib/data/seed-data';
import { Category } from '@/types/database';
import { ExternalImage } from '@/components/media/ExternalImage';
import { Layers, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; catId: string; name: string }>({
    isOpen: false,
    catId: '',
    name: '',
  });
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
          <h1 className="text-2xl font-black text-slate-900">
            Category Management ({categories.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage store product categories, banners, and taxonomy.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Category</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Category created successfully!</span>
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-600">
            Add Store Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
              />
            </div>
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">External Banner Image URL (CDN / Hosting) *</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
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
              Save Category
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <ExternalImage src={cat.image_url} alt={cat.name} fill className="object-cover" />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900">{cat.name}</h3>
                <p className="text-[11px] font-mono text-slate-400">/{cat.slug}</p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{cat.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: true, catId: cat.id, name: cat.name })}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Confirmation Modal */}
      <AdminConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Store Category"
        message={`Are you sure you want to delete category "${deleteModal.name}"? Products under this category will need reassignment.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        variant="danger"
        iconType="delete"
        onConfirm={() => {
          setCategories(categories.filter(c => c.id !== deleteModal.catId));
          setDeleteModal({ isOpen: false, catId: '', name: '' });
        }}
        onClose={() => setDeleteModal({ isOpen: false, catId: '', name: '' })}
      />
    </div>
  );
}
