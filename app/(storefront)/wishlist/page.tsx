'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types/database';
import { 
  Heart, ShoppingBag, Trash2, ArrowRight, Share2, 
  Check, Sparkles, AlertCircle, Eye, ExternalLink 
} from 'lucide-react';

export default function WishlistPage() {
  const { items, itemCount, isLoaded, removeFromWishlist } = useWishlist();
  const { addToCart, openCartDrawer } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMoveToBag = (product: Product) => {
    addToCart(product, 1, undefined, true);
    showToast(`"${product.name}" has been added to your shopping bag.`);
  };

  const handleMoveAllToBag = () => {
    if (items.length === 0) return;
    items.forEach((product) => {
      addToCart(product, 1, undefined, false);
    });
    openCartDrawer();
    showToast(`All ${items.length} wishlist creations have been moved to your bag!`);
  };

  const handleShareWhatsApp = () => {
    const storeUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mfebrand.com';
    const garmentsList = items.map((it, idx) => `${idx + 1}. ${it.name} - ${formatPrice(it.sale_price ?? it.regular_price)} (${storeUrl}/products/${it.slug})`).join('\n');
    const message = `Look at these stunning Haute Couture ensembles from MFE Brand I'm coveting:\n\n${garmentsList}\n\nView more on: ${storeUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-sans">
        <div className="w-10 h-10 border-2 border-[#d99026] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="text-xs uppercase tracking-widest text-[#8c827a] font-bold">
          Opening Your Atelier Wishlist...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans bg-white text-[#141414]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#141414] text-white text-xs flex items-center gap-3 shadow-2xl border border-[#d99026]/40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Sparkles className="w-4 h-4 text-[#d99026] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-6 border-b border-[#eae7e2] gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b87414]">
            Private Salon Lookbook
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#141414] mt-1">
            Curated Wishlist ({itemCount})
          </h1>
          <p className="text-xs sm:text-sm text-[#6b6b6b] mt-2 max-w-xl leading-relaxed">
            Your personal salon collection of coveted hand-embroidered silhouettes, festive formals, and bridal couture.
          </p>
        </div>

        {itemCount > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleMoveAllToBag}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#d99026] hover:bg-[#c67d18] text-[#141414] text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Move All to Bag</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {itemCount === 0 ? (
        <div className="text-center py-20 bg-[#faf8f5] rounded-3xl border border-[#eae7e2] p-8 sm:p-12 max-w-xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#f5efe6] border border-[#e2d5c3] text-[#b87414] flex items-center justify-center mx-auto shadow-sm">
            <Heart className="w-8 h-8 fill-[#b87414]/10 text-[#b87414]" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">
            Your Private Lookbook is Empty
          </h2>
          <p className="text-xs sm:text-sm text-[#6b6b6b] max-w-md mx-auto leading-relaxed">
            Touch the gold heart icon on any luxury creation across our collections to bookmark it for private styling or seasonal ordering.
          </p>
          <div className="pt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#d99026] hover:bg-[#c67d18] text-[#141414] font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full transition shadow-md hover:shadow-lg"
            >
              <span>Explore Creations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => {
            const hasSale = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.regular_price;
            const activePrice = hasSale ? product.sale_price! : product.regular_price;
            const discountPct = hasSale ? Math.round(((product.regular_price - product.sale_price!) / product.regular_price) * 100) : 0;
            const imageUrl = product.images?.[0]?.image_url || '/placeholder-garment.jpg';

            return (
              <div
                key={product.id}
                className="group relative bg-[#faf8f5] rounded-3xl border border-[#eae7e2] overflow-hidden hover:border-[#d99026]/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Product Media */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f2ede6]">
                  <Link href={`/products/${product.slug}`} className="block w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-[#8c827a] hover:text-rose-600 border border-[#eae7e2] flex items-center justify-center transition shadow-sm cursor-pointer z-10"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Discount Badge */}
                  {hasSale && (
                    <span className="absolute top-3 left-3 bg-[#141414] text-[#d99026] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                      {discountPct}% Privilege
                    </span>
                  )}
                </div>

                {/* Garment Details & Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c827a] mb-1">
                      {product.category?.name || 'Haute Couture'}
                    </div>
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-serif text-sm font-bold text-[#141414] hover:text-[#b87414] transition line-clamp-2 leading-snug"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-sans text-base font-bold text-[#141414]">
                        {formatPrice(activePrice)}
                      </span>
                      {hasSale && (
                        <span className="text-xs text-[#8c827a] line-through">
                          {formatPrice(product.regular_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[#eae7e2] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveToBag(product)}
                      className="flex-1 bg-[#141414] hover:bg-[#262626] text-white text-xs font-bold uppercase tracking-wider py-3 rounded-full flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#d99026]" />
                      <span>Add to Bag</span>
                    </button>

                    <Link
                      href={`/products/${product.slug}`}
                      className="w-10 h-10 rounded-full border border-[#eae7e2] hover:border-[#d99026] text-[#141414] flex items-center justify-center transition shadow-sm"
                      title="Inspect Creation"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Haute Couture Atelier Service Note */}
      <div className="mt-16 p-8 rounded-3xl bg-[#faf8f5] border border-[#eae7e2] text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#b87414]">
          <Sparkles className="w-4 h-4" />
          <span>Bespoke Tailoring & Styling Assistance</span>
        </div>
        <p className="text-xs text-[#6b6b6b] leading-relaxed">
          Need custom sleeve lining, specific lengths, or bespoke colorways? Connect with our master stylist on WhatsApp (+92 300 1234567) quoting any garment from your wishlist.
        </p>
      </div>

    </div>
  );
}
