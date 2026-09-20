'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/database';
import { ExternalImage } from '@/components/media/ExternalImage';
import { 
  ArrowLeft, DollarSign, Package, Check, 
  Sparkles, Save, Eye, Palette, Scissors, Ruler, Plus, Trash2, X
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

  // Size selection and size chart management
  const [hasSizes, setHasSizes] = useState(Boolean(initialProduct.has_sizes));
  const [availableSizes, setAvailableSizes] = useState<string[]>(
    Array.isArray(initialProduct.available_sizes) && initialProduct.available_sizes.length > 0
      ? initialProduct.available_sizes
      : ['S', 'M', 'L', 'XL']
  );
  const [newSizeInput, setNewSizeInput] = useState('');

  const defaultTrouserRows = [
    { size: 'S', waist: '26-30', length: '39' },
    { size: 'M', waist: '28-44', length: '39' },
    { size: 'L', waist: '32-48', length: '39' },
    { size: 'XL', waist: '36-52', length: '40' },
  ];

  const defaultShirtRows = [
    { size: 'S', chest: '19', sleeves: '20.5', length: '25.5' },
    { size: 'M', chest: '20', sleeves: '20.5', length: '27' },
    { size: 'L', chest: '21', sleeves: '21.5', length: '28' },
    { size: 'XL', chest: '22', sleeves: '22', length: '30' },
  ];

  const [trouserChart, setTrouserChart] = useState<Array<{ size: string; waist: string; length: string }>>(
    initialProduct.size_chart?.trouser && Array.isArray(initialProduct.size_chart.trouser)
      ? initialProduct.size_chart.trouser
      : defaultTrouserRows
  );

  const [shirtChart, setShirtChart] = useState<Array<{ size: string; chest: string; sleeves: string; length: string }>>(
    initialProduct.size_chart?.shirt && Array.isArray(initialProduct.size_chart.shirt)
      ? initialProduct.size_chart.shirt
      : defaultShirtRows
  );

  const handleAddSize = () => {
    const trimmed = newSizeInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!availableSizes.includes(trimmed)) {
      setAvailableSizes([...availableSizes, trimmed]);
    }
    setNewSizeInput('');
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setAvailableSizes(availableSizes.filter(s => s !== sizeToRemove));
  };

  const handleLoadPreset = (preset: string[]) => {
    setAvailableSizes(preset);
  };

  const handleUpdateTrouser = (index: number, field: 'size' | 'waist' | 'length', val: string) => {
    const updated = [...trouserChart];
    updated[index] = { ...updated[index], [field]: val };
    setTrouserChart(updated);
  };

  const handleAddTrouserRow = () => {
    setTrouserChart([...trouserChart, { size: 'Custom', waist: '', length: '' }]);
  };

  const handleRemoveTrouserRow = (index: number) => {
    setTrouserChart(trouserChart.filter((_, i) => i !== index));
  };

  const handleUpdateShirt = (index: number, field: 'size' | 'chest' | 'sleeves' | 'length', val: string) => {
    const updated = [...shirtChart];
    updated[index] = { ...updated[index], [field]: val };
    setShirtChart(updated);
  };

  const handleAddShirtRow = () => {
    setShirtChart([...shirtChart, { size: 'Custom', chest: '', sleeves: '', length: '' }]);
  };

  const handleRemoveShirtRow = (index: number) => {
    setShirtChart(shirtChart.filter((_, i) => i !== index));
  };

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
          has_sizes: hasSizes,
          available_sizes: availableSizes,
          size_chart: {
            trouser: trouserChart,
            shirt: shirtChart,
          },
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

          {/* Section: Sizes & Size Chart Management */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-amber-600" />
                <span>Product Sizes & Size Chart Management</span>
              </h2>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition">
                <input
                  type="checkbox"
                  checked={hasSizes}
                  onChange={(e) => setHasSizes(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  {hasSizes ? 'Sizes Enabled' : 'Sizes Disabled'}
                </span>
              </label>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Enable size selection for garments, stitched suits, and shoes. When enabled, customers must pick a size before adding to cart. Leave disabled for accessories, shawls, quilts, and perfumes.
            </p>

            {hasSizes && (
              <div className="space-y-6 pt-1 animate-in fade-in">
                {/* 1. Selectable Size Chips */}
                <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-800">
                      Active Customer Size Options:
                    </label>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-slate-400">Presets:</span>
                      <button
                        type="button"
                        onClick={() => handleLoadPreset(['S', 'M', 'L', 'XL'])}
                        className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 font-semibold text-slate-700 cursor-pointer"
                      >
                        S, M, L, XL
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadPreset(['XS', 'S', 'M', 'L', 'XL', '2XL'])}
                        className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 font-semibold text-slate-700 cursor-pointer"
                      >
                        XS to 2XL
                      </button>
                    </div>
                  </div>

                  {/* Size chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {availableSizes.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-900 shadow-2xs"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(s)}
                          className="p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title={`Remove size ${s}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add size input */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add size (e.g. 2XL, Free Size)..."
                      value={newSizeInput}
                      onChange={(e) => setNewSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSize();
                        }
                      }}
                      className="text-xs p-2 rounded-lg bg-white border border-slate-200 text-slate-900 uppercase font-bold focus:border-amber-500 outline-none w-44"
                    />
                    <button
                      type="button"
                      onClick={handleAddSize}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Size</span>
                    </button>
                  </div>
                </div>

                {/* 2. Trouser Measurements Editor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-amber-600" />
                      <span>Trouser Size Chart Measurements</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddTrouserRow}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Row
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-left text-slate-800">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Size</th>
                          <th className="py-2.5 px-3">Waist (Inches)</th>
                          <th className="py-2.5 px-3">Length (Inches)</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white font-mono">
                        {trouserChart.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.size}
                                onChange={(e) => handleUpdateTrouser(idx, 'size', e.target.value)}
                                className="w-20 p-1.5 rounded-lg border border-slate-200 text-xs font-bold text-amber-700"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.waist}
                                onChange={(e) => handleUpdateTrouser(idx, 'waist', e.target.value)}
                                className="w-28 p-1.5 rounded-lg border border-slate-200 text-xs"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.length}
                                onChange={(e) => handleUpdateTrouser(idx, 'length', e.target.value)}
                                className="w-24 p-1.5 rounded-lg border border-slate-200 text-xs"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveTrouserRow(idx)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. T-Shirt Measurements Editor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-amber-600" />
                      <span>T-Shirt Size Chart Measurements</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddShirtRow}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Row
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-left text-slate-800">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Size</th>
                          <th className="py-2.5 px-3">Chest (Inches)</th>
                          <th className="py-2.5 px-3">Sleeves (Inches)</th>
                          <th className="py-2.5 px-3">Length (Inches)</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white font-mono">
                        {shirtChart.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.size}
                                onChange={(e) => handleUpdateShirt(idx, 'size', e.target.value)}
                                className="w-20 p-1.5 rounded-lg border border-slate-200 text-xs font-bold text-amber-700"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.chest}
                                onChange={(e) => handleUpdateShirt(idx, 'chest', e.target.value)}
                                className="w-24 p-1.5 rounded-lg border border-slate-200 text-xs"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.sleeves}
                                onChange={(e) => handleUpdateShirt(idx, 'sleeves', e.target.value)}
                                className="w-24 p-1.5 rounded-lg border border-slate-200 text-xs"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.length}
                                onChange={(e) => handleUpdateShirt(idx, 'length', e.target.value)}
                                className="w-24 p-1.5 rounded-lg border border-slate-200 text-xs"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveShirtRow(idx)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
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
