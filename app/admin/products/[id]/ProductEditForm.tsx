'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/database';
import { ExternalImage } from '@/components/media/ExternalImage';
import { 
  ArrowLeft, DollarSign, Package, Check, 
  Sparkles, Save, Eye, Palette, Scissors
} from 'lucide-react';

interface ProductEditFormProps {
  initialProduct: Product;
}

export function ProductEditForm({ initialProduct }: ProductEditFormProps) {
  const router = useRouter();

  const [regularPrice, setRegularPrice] = useState(initialProduct.regular_price.toString());
  const [salePrice, setSalePrice] = useState(initialProduct.sale_price ? initialProduct.sale_price.toString() : '');
  const [stockQuantity, setStockQuantity] = useState(initialProduct.stock_quantity.toString());
  const [name, setName] = useState(initialProduct.name);
  const [sku, setSku] = useState(initialProduct.sku);
  const [shortDescription, setShortDescription] = useState(initialProduct.short_description || '');

  // Variations / Stitching Cost config
  const [stitchedAddon, setStitchedAddon] = useState('2500');
  const [bespokeAddon, setBespokeAddon] = useState('4500');

  // Shade colors config
  const [colorShades, setColorShades] = useState('Antique Gold (#d4af37), Royal Emerald (#0f5257), Midnight Velvet (#1c1c24), Ruby Crimson (#800020)');

  const [isFeatured, setIsFeatured] = useState(initialProduct.is_featured);
  const [isBestDeal, setIsBestDeal] = useState(initialProduct.is_best_deal);
  const [isNewArrival, setIsNewArrival] = useState(initialProduct.is_new_arrival);

  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/admin/products/${initialProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          sku,
          regular_price: Number(regularPrice),
          sale_price: salePrice ? Number(salePrice) : null,
          stock_quantity: Number(stockQuantity),
          short_description: shortDescription,
          is_featured: isFeatured,
          is_best_deal: isBestDeal,
          is_new_arrival: isNewArrival,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Product pricing, stock, and variations updated successfully!', type: 'success' });
        router.refresh();
      } else {
        setMsg({ text: data.error || 'Failed to update product', type: 'error' });
      }
    } catch {
      setMsg({ text: 'Server error while saving product', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const primaryImage = initialProduct.images?.[0]?.image_url || null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-800">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Edit Product & Variant Pricing
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Update live pricing, color shades, and cut/silhouette options for <span className="text-amber-700 font-semibold">{initialProduct.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/products/${initialProduct.slug}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>View Live Page</span>
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
          msg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <Check className="w-4 h-4" />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Form Inputs */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Section: Pricing & Variations */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span>Live Pricing & Discounts (PKR)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Base Regular Price (₨) *
                </label>
                <input
                  type="number"
                  required
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sale / Discounted Price (₨)
                </label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Leave empty if no discount"
                  className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-emerald-700 font-mono font-bold focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Available Stock Quantity
                </label>
                <input
                  type="number"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Product SKU Identifier
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-mono focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition shadow-2xs uppercase"
                />
              </div>
            </div>
          </div>

          {/* Section: Silhouette / Cut Price Deltas */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Scissors className="w-4 h-4 text-amber-600" />
              <span>Silhouette / Cut Price Adjustments</span>
            </h2>

            <p className="text-[11px] text-slate-500">
              When a customer selects standard pret stitched or custom bespoke fit, the storefront price automatically adds this delta to the base price:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Stitched (S, M, L, XL) Add-on (₨)
                </label>
                <input
                  type="number"
                  value={stitchedAddon}
                  onChange={(e) => setStitchedAddon(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-slate-200 text-amber-700 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Default: +₨2,500 for ready-to-wear stitching</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Custom Fit (Bespoke) Add-on (₨)
                </label>
                <input
                  type="number"
                  value={bespokeAddon}
                  onChange={(e) => setBespokeAddon(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-slate-200 text-amber-700 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Default: +₨4,500 for master tailor custom cut</span>
              </div>
            </div>
          </div>

          {/* Section: Fabric Shades / Colors */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Palette className="w-4 h-4 text-amber-600" />
              <span>Available Color Shades</span>
            </h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Color Names & Hex Codes
              </label>
              <textarea
                rows={2}
                value={colorShades}
                onChange={(e) => setColorShades(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition shadow-2xs"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Format: Color Name (#hexCode), Color 2 (#hexCode)
              </span>
            </div>
          </div>

          {/* Section: Basic Metadata */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Package className="w-4 h-4 text-amber-600" />
              <span>Product Identity</span>
            </h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition shadow-2xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Short Description</label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition shadow-2xs"
              />
            </div>
          </div>

        </div>

        {/* Right 1 Col: Preview & Badges */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
              Product Image Preview
            </h2>
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <ExternalImage src={primaryImage} alt={initialProduct.name} fill className="object-cover" />
            </div>
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Category:</span>
                <strong className="text-slate-900">{initialProduct.category?.name || 'Couture'}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Brand:</span>
                <strong className="text-slate-900">{initialProduct.brand?.name || 'MFE'}</strong>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
              Display Badges
            </h2>
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-semibold">Featured Haute Piece</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={isBestDeal}
                onChange={(e) => setIsBestDeal(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-semibold">Special Atelier Deal</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-semibold">New Season 2026</span>
            </label>
          </div>
        </div>

      </div>

    </form>
  );
}
