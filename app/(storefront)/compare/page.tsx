'use client';

import React from 'react';
import Link from 'next/link';
import { useCompare } from '@/hooks/useCompare';
import { useCart } from '@/hooks/useCart';
import { ExternalImage } from '@/components/media/ExternalImage';
import { formatPrice } from '@/lib/utils';
import { Trash2, ShoppingBag, Layers, Star, ArrowRight } from 'lucide-react';

export default function ComparePage() {
  const { items, itemCount, isLoaded, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-neutral-500 font-sans">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="text-xs uppercase tracking-widest">Loading side-by-side comparison...</span>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-28 text-center font-sans">
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Layers className="w-9 h-9" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-white">
          No Products Added to Comparison
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-sm mx-auto leading-relaxed">
          Add up to 4 creations to compare fabrics, hand-embroidery hours, specifications, and prices side-by-side.
        </p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full transition shadow-xl shadow-amber-500/20"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">
            Technical & Aesthetic Specification
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-1">
            Product Comparison ({itemCount} / 4)
          </h1>
        </div>
        <button
          onClick={clearCompare}
          className="text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider transition self-start sm:self-auto"
        >
          Clear All Comparison Items
        </button>
      </div>

      <div className="overflow-x-auto border border-white/[0.08] rounded-3xl bg-[#111114] shadow-2xl">
        <table className="w-full text-left text-xs border-collapse min-w-[750px]">
          <tbody>
            {/* Image Row */}
            <tr className="border-b border-white/[0.06]">
              <td className="p-5 font-bold uppercase tracking-[0.2em] text-neutral-400 w-44 bg-neutral-950/60">
                Product Image
              </td>
              {items.map((p) => (
                <td key={p.id} className="p-5 align-top text-center">
                  <div className="relative w-36 h-48 mx-auto rounded-2xl overflow-hidden bg-neutral-900 border border-white/[0.08] mb-3">
                    <ExternalImage src={p.images?.[0]?.image_url} alt={p.name} fill className="object-cover" />
                  </div>
                  <button
                    onClick={() => removeFromCompare(p.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </td>
              ))}
            </tr>

            {/* Name */}
            <tr className="border-b border-white/[0.06]">
              <td className="p-5 font-bold uppercase tracking-[0.2em] text-neutral-400 bg-neutral-950/60">
                Title & Collection
              </td>
              {items.map((p) => (
                <td key={p.id} className="p-5 font-serif font-bold text-white text-base">
                  <Link href={`/products/${p.slug}`} className="hover:text-amber-400 transition">
                    {p.name}
                  </Link>
                </td>
              ))}
            </tr>

            {/* Price */}
            <tr className="border-b border-white/[0.06]">
              <td className="p-5 font-bold uppercase tracking-[0.2em] text-neutral-400 bg-neutral-950/60">
                Price (PKR)
              </td>
              {items.map((p) => (
                <td key={p.id} className="p-5 font-serif font-bold text-base text-white">
                  {p.sale_price ? (
                    <div className="space-y-0.5">
                      <span className="text-rose-400 block">{formatPrice(p.sale_price)}</span>
                      <span className="text-neutral-500 line-through text-xs font-normal font-sans">{formatPrice(p.regular_price)}</span>
                    </div>
                  ) : (
                    formatPrice(p.regular_price)
                  )}
                </td>
              ))}
            </tr>

            {/* Category */}
            <tr className="border-b border-white/[0.06]">
              <td className="p-5 font-bold uppercase tracking-[0.2em] text-neutral-400 bg-neutral-950/60">
                Category
              </td>
              {items.map((p) => (
                <td key={p.id} className="p-5 text-neutral-300 font-semibold uppercase tracking-wider text-[11px]">
                  {p.category?.name || 'Haute Couture'}
                </td>
              ))}
            </tr>

            {/* Brand */}
            <tr className="border-b border-white/[0.06]">
              <td className="p-5 font-bold uppercase tracking-[0.2em] text-neutral-400 bg-neutral-950/60">
                Artisan Maison
              </td>
              {items.map((p) => (
                <td key={p.id} className="p-5 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                  {p.brand?.name || 'MFE Signature'}
                </td>
              ))}
            </tr>

            {/* Action */}
            <tr>
              <td className="p-5 font-bold uppercase tracking-[0.2em] text-neutral-400 bg-neutral-950/60">
                Action
              </td>
              {items.map((p) => (
                <td key={p.id} className="p-5 text-center">
                  <button
                    onClick={() => {
                      addToCart(p, 1);
                      alert(`Added ${p.name} to shopping bag.`);
                    }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition shadow-md"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
