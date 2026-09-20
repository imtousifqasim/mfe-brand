'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Sparkles,
  Lock,
  Tag
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { ExternalImage } from '@/components/media/ExternalImage';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const { 
    items, 
    itemCount, 
    subtotal, 
    shipping, 
    grandTotal, 
    deliveryCharge,
    freeDeliveryThreshold,
    isCartDrawerOpen, 
    closeCartDrawer, 
    updateQuantity, 
    removeFromCart 
  } = useCart();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartDrawerOpen, closeCartDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isCartDrawerOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const hasThreshold = Boolean(freeDeliveryThreshold && freeDeliveryThreshold > 0);
  const progressPercent = hasThreshold ? Math.min(100, Math.round((subtotal / freeDeliveryThreshold!) * 100)) : 100;
  const remainingForFreeShipping = hasThreshold ? Math.max(0, freeDeliveryThreshold! - subtotal) : 0;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end font-sans">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={closeCartDrawer}
      />

      {/* Slide-over Side Cart Drawer Panel */}
      <aside 
        aria-label="Side Shopping Bag" 
        className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-[#eae7e2] flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300 overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#eae7e2] bg-[#faf8f5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#141414] text-white flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-4 h-4 text-[#b87414]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base font-bold uppercase tracking-wider text-[#141414]">
                    My Cart
                  </h2>
                  <span className="min-w-[20px] h-5 rounded-full bg-[#b87414] text-white text-[10px] font-bold flex items-center justify-center px-1.5 shadow-xs">
                    {itemCount}
                  </span>
                </div>
                <span className="text-[10px] text-[#8c827a] font-sans font-medium">
                  MFE Haute Couture Atelier
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCartDrawer}
              className="w-9 h-9 rounded-full bg-white hover:bg-[#eae7e2] active:bg-[#e4e0d8] text-[#6b6b6b] hover:text-[#141414] flex items-center justify-center cursor-pointer shadow-xs border border-[#eae7e2] transition"
              aria-label="Close cart drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nationwide Shipping Status Banner */}
          <div className="mt-3.5 pt-3 border-t border-[#eae7e2]/60">
            {hasThreshold ? (
              <>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-[#141414] font-semibold flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#b87414]" />
                    {remainingForFreeShipping === 0 ? (
                      <span className="text-emerald-600 font-bold">Free Express Delivery Unlocked!</span>
                    ) : (
                      <span>
                        Add <strong className="text-[#b87414]">PKR {remainingForFreeShipping.toLocaleString()}</strong> for Free Delivery
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-[#8c827a]">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#eae7e2] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#d99026] to-[#b87414] transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between text-[11px] bg-white py-1 px-2 rounded-lg border border-[#eae7e2]">
                <span className="text-[#141414] font-semibold flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#b87414]" />
                  <span>Express Courier: <strong className="text-[#b87414] font-mono">PKR {deliveryCharge}</strong> Flat Rate</span>
                </span>
                <span className="text-[10px] font-bold text-slate-700 bg-[#f7f5f2] px-2 py-0.5 rounded border border-[#eae7e2]">
                  Nationwide
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
              {/* Luxury Empty Icon Container */}
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#faf8f5] to-[#f2ece2] border border-[#e8dfd2] flex items-center justify-center text-[#b87414] shadow-inner">
                  <ShoppingBag className="w-9 h-9 stroke-[1.4]" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-serif text-xl font-bold text-[#141414]">
                  Your Shopping Bag is Empty
                </h3>
                <p className="text-xs text-[#6b6b6b] max-w-xs leading-relaxed">
                  You haven&apos;t added any luxury ensembles to your shopping bag yet. Explore our handcrafted collections to curate your bespoke look.
                </p>
              </div>

              {/* VIP Voucher Hint */}
              <div className="p-3 rounded-2xl bg-[#faf8f5] border border-amber-500/25 flex items-center gap-2 max-w-xs">
                <Tag className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[11px] text-[#141414] font-medium text-left">
                  Use code <strong className="font-mono text-[#b87414]">MFE10</strong> at checkout for 10% instant discount!
                </span>
              </div>

              {/* Quick Collection Discovery Links */}
              <div className="w-full pt-2 grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/category/womens-unstitched-stitched-suits"
                  onClick={closeCartDrawer}
                  className="p-2.5 rounded-xl bg-[#faf8f5] hover:bg-[#eae7e2] text-[#141414] font-bold text-center transition"
                >
                  Women's Suits
                </Link>
                <Link
                  href="/category/winter-wear-shawls"
                  onClick={closeCartDrawer}
                  className="p-2.5 rounded-xl bg-[#faf8f5] hover:bg-[#eae7e2] text-[#141414] font-bold text-center transition"
                >
                  Winter Shawls
                </Link>
              </div>

              <button
                type="button"
                onClick={closeCartDrawer}
                className="w-full py-3.5 px-6 rounded-full bg-[#141414] hover:bg-[#262626] text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Discover All Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            items.map((item) => {
              const itemKey = item.cartItemId || `${item.product.id}_${item.selectedSize || 'std'}_${item.selectedColor || 'std'}`;
              
              const primaryImage =
                item.product.images?.find((img) => img.is_primary)?.image_url ||
                [...(item.product.images || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.image_url ||
                item.product.images?.[0]?.image_url ||
                null;

              const price = item.unitPrice ?? (item.product.sale_price ?? item.product.regular_price);

              return (
                <div 
                  key={itemKey}
                  className="flex gap-3.5 p-3 rounded-2xl bg-white border border-[#eae7e2] hover:border-[#b87414]/30 hover:shadow-xs transition group"
                >
                  {/* Thumbnail */}
                  <div className="relative w-18 h-22 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-[#eae7e2]">
                    <ExternalImage
                      src={primaryImage}
                      alt={item.product.name}
                      fill
                      sizes="90px"
                      quality={95}
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link 
                          href={`/products/${item.product.slug}`}
                          onClick={closeCartDrawer}
                          className="font-bold text-xs text-[#141414] hover:text-[#b87414] transition line-clamp-2 leading-snug"
                        >
                          {item.product.name}
                        </Link>
                        
                        {/* Instant Single Item Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(itemKey)}
                          className="text-neutral-400 hover:text-rose-600 p-1 transition cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant tags */}
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8c827a] font-medium">
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.product.category && (
                          <span className="text-[#b87414] font-semibold">{item.product.category.name}</span>
                        )}
                      </div>
                    </div>

                    {/* Price & Quantity stepper */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#eae7e2]/60">
                      <div className="flex items-center border border-[#eae7e2] rounded-lg bg-[#faf8f5] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-[#6b6b6b] hover:text-[#141414] hover:bg-[#eae7e2] transition cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-mono font-bold text-xs text-[#141414]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-[#6b6b6b] hover:text-[#141414] hover:bg-[#eae7e2] transition cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-xs text-[#141414]">
                          PKR {(price * item.quantity).toLocaleString()}
                        </span>
                        {item.quantity > 1 && (
                          <span className="block text-[9.5px] text-neutral-400">
                            PKR {price.toLocaleString()} each
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer (Subtotal, View Cart, Checkout) */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#faf8f5] border-t border-[#eae7e2] space-y-3 shadow-inner">
            {/* Subtotal line */}
            <div className="space-y-1.5 pb-2">
              <div className="flex items-center justify-between text-xs text-[#6b6b6b]">
                <span>Bag Subtotal</span>
                <span className="font-mono font-bold text-[#141414]">
                  PKR {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#6b6b6b]">
                <span>Nationwide Shipping</span>
                <span className="font-mono font-bold text-[#141414]">
                  {shipping === 0 ? <span className="text-emerald-600 font-bold uppercase text-[10.5px]">Complimentary Free</span> : `PKR ${shipping.toLocaleString()}`}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#eae7e2] text-sm">
                <span className="font-bold text-[#141414] uppercase tracking-wider text-xs">
                  Estimated Total
                </span>
                <span className="font-mono font-black text-[#b87414] text-base">
                  PKR {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons: View Cart & Checkout */}
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/cart"
                onClick={closeCartDrawer}
                className="py-3 px-4 rounded-xl border border-[#141414] hover:bg-[#141414] text-[#141414] hover:text-white font-bold text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Cart</span>
              </Link>

              <Link
                href="/checkout"
                onClick={closeCartDrawer}
                className="py-3 px-4 rounded-xl bg-[#b87414] hover:bg-[#d99026] text-white font-black text-xs uppercase tracking-wider text-center transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Checkout</span>
              </Link>
            </div>

            <p className="text-[10px] text-center text-[#8c827a] flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>100% Authentic Designer Guarantee • Cash on Delivery</span>
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
