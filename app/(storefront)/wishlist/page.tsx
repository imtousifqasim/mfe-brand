'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { items, itemCount, isLoaded } = useWishlist();

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-neutral-500 font-sans">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="text-xs uppercase tracking-widest">Loading Curated Wishlist...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">
            Private Atelier Selection
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-1">
            Curated Wishlist ({itemCount})
          </h1>
          <p className="text-xs text-neutral-400 mt-2">
            Keep track of your favorite luxury silhouettes, festive formals, and hand-embroidered suits.
          </p>
        </div>
      </div>

      {itemCount === 0 ? (
        <div className="text-center py-24 bg-[#111114] rounded-3xl border border-white/[0.08] p-10 max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-white">Your Wishlist is Empty</h2>
          <p className="text-xs text-neutral-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Tap the heart icon on any haute couture design to save it to your private curated lookbook.
          </p>
          <div className="mt-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full transition shadow-xl shadow-amber-500/20"
            >
              <span>Explore Creations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
