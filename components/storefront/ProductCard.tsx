'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, Star, Layers, Check } from 'lucide-react';
import { Product } from '@/types/database';
import { ExternalImage } from '@/components/media/ExternalImage';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useCompare } from '@/hooks/useCompare';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare } = useCompare();
  const [added, setAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const primaryImage = product.images?.[0]?.image_url || null;

  const hasDiscount = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.regular_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.regular_price - product.sale_price!) / product.regular_price) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="group relative flex flex-col bg-white border border-[#eae7e2] rounded-2xl sm:rounded-3xl overflow-hidden hover:border-[#d99026] hover:shadow-xl transition-all duration-300">
      
      {/* Product Image Frame (3:4 aspect ratio dominating the card) */}
      <div className="relative aspect-[3/4] w-full bg-[#f7f5f2] overflow-hidden">
        <Link href={`/products/${product.slug}`} className="relative block w-full h-full">
          <ExternalImage
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Subtle Bottom Vignette so labels/actions stay visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 pointer-events-none" />

        {/* Single Badge Only (% off OR "New 2026" OR "Special") */}
        <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-10">
          {hasDiscount ? (
            <span className="bg-rose-600 text-white font-sans font-bold text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider shadow-sm">
              {discountPercent}% OFF
            </span>
          ) : product.is_new_arrival ? (
            <span className="bg-[#141414] text-white font-sans font-bold text-[8px] sm:text-[9px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider shadow-sm">
              New Season
            </span>
          ) : product.is_best_deal ? (
            <span className="bg-[#d99026] text-[#141414] font-sans font-bold text-[8px] sm:text-[9px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider shadow-sm">
              Special
            </span>
          ) : null}
        </div>

        {/* Floating Quick Action Icons */}
        <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 flex flex-col gap-1.5 z-10 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={() => toggleWishlist(product)}
            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-md border border-[#eae7e2] flex items-center justify-center shadow-md transition hover:scale-110 cursor-pointer touch-manipulation ${
              isFavorited ? 'text-rose-500' : 'text-[#141414] hover:text-rose-500'
            }`}
            title="Add to Wishlist"
            aria-label="Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => {
              const res = addToCompare(product);
              alert(res.message);
            }}
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-md border border-[#eae7e2] flex items-center justify-center text-[#141414] hover:text-[#d99026] shadow-md transition hover:scale-110 cursor-pointer touch-manipulation"
            title="Add to Compare"
            aria-label="Compare"
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Slide-Up Quick Add to Bag */}
        <div className="absolute bottom-2.5 inset-x-2.5 sm:bottom-3 sm:inset-x-3 z-10 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleQuickAdd}
            className={`w-full font-sans font-bold text-[10px] sm:text-xs py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg transition-all cursor-pointer touch-manipulation ${
              added 
                ? 'bg-emerald-600 text-white' 
                : 'bg-[#141414] hover:bg-[#d99026] hover:text-[#141414] text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Metadata */}
      <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between gap-2 sm:gap-3 bg-white">
        <div>
          {/* Brand & Category Kicker */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] text-[#6b6b6b] mb-1 font-sans">
            <span className="truncate max-w-[100px]">{product.brand?.name || 'MFE Signature'}</span>
            <span className="text-[#b87414] font-semibold truncate">{product.category?.name || 'Couture'}</span>
          </div>

          {/* Title */}
          <h3 className="font-sans font-medium text-[13px] sm:text-[15px] text-[#141414] line-clamp-2 hover:text-[#b87414] transition-colors leading-snug">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>

        <div>
          {/* Rating Micro Bar with AA contrast */}
          <div className="flex items-center gap-1 text-xs mb-1.5 sm:mb-2">
            <div className="flex items-center text-[#d99026]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                    i < Math.floor(product.average_rating || 5)
                      ? 'fill-current text-[#d99026]'
                      : 'text-neutral-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] font-sans font-medium text-[#6b6b6b]">
              ({product.review_count || 14})
            </span>
          </div>

          {/* Price Block - transactional UI strictly Sans-Serif */}
          <div className="flex items-baseline gap-2 pt-2 border-t border-[#eae7e2]">
            <span className="font-sans text-sm sm:text-[17px] font-bold text-[#141414]">
              {formatPrice(product.sale_price ?? product.regular_price)}
            </span>

            {hasDiscount && (
              <span className="font-sans text-[10px] sm:text-xs text-[#6b6b6b] line-through">
                {formatPrice(product.regular_price)}
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
