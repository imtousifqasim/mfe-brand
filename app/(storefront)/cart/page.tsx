'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { ExternalImage } from '@/components/media/ExternalImage';
import { formatPrice } from '@/lib/utils';
import { 
  Trash2, 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Tag, 
  Lock, 
  Plus, 
  Minus,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function CartPage() {
  const {
    items,
    itemCount,
    isLoaded,
    subtotal,
    shipping,
    grandTotal,
    couponCode,
    couponDiscount,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setIsApplying(true);
    const res = await applyCoupon(inputCoupon);
    if (res.success) {
      setCouponMsg({ type: 'success', text: res.message });
    } else {
      setCouponMsg({ type: 'error', text: res.message });
    }
    setIsApplying(false);
  };

  const freeShippingThreshold = 5000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center text-[#6b6b6b] font-sans bg-white">
        <div className="w-10 h-10 border-2 border-[#b87414] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="text-xs uppercase tracking-widest font-bold text-[#141414]">Opening Atelier Shopping Bag...</span>
      </div>
    );
  }

  // REDESIGNED LUXURY EMPTY CART STATE
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 sm:py-28 text-center font-sans bg-white text-[#141414]">
        {/* Glow & Luxury Icon */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#faf8f5] to-[#f4eee6] border border-[#e8dfd2] flex items-center justify-center text-[#b87414] shadow-xl shadow-black/5 mx-auto">
            <ShoppingBag className="w-11 h-11 stroke-[1.3]" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#b87414] text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <span className="text-[10.5px] font-sans font-bold uppercase tracking-[0.3em] text-[#b87414] block mb-1">
          MFE Atelier Privé
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#141414] tracking-tight">
          Your Shopping Bag is Empty
        </h1>
        
        <p className="text-xs sm:text-sm text-[#6b6b6b] mt-3 max-w-md mx-auto leading-relaxed">
          Your personal bespoke bag currently holds no garments. Explore our ready-to-wear pret, festive formal wear, and heirloom lawn drops to curate your wardrobe.
        </p>

        {/* VIP Coupon Reminder Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-[#faf8f5] border border-amber-500/30 max-w-md mx-auto flex items-center justify-center gap-2.5 shadow-xs">
          <Tag className="w-4 h-4 text-[#b87414] shrink-0" />
          <p className="text-xs text-[#141414] font-medium">
            First order privilege: Use code <strong className="font-mono text-[#b87414] font-black">MFE10</strong> at checkout for 10% instant discount.
          </p>
        </div>

        {/* Curated Collection Shortcuts */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto text-xs">
          <Link
            href="/products?category=ready-to-wear-pret"
            className="p-3 rounded-2xl bg-[#f7f5f2] hover:bg-[#eae7e2] text-[#141414] font-bold transition border border-[#eae7e2]"
          >
            Pret Co-ords
          </Link>
          <Link
            href="/products?category=festive-formals"
            className="p-3 rounded-2xl bg-[#f7f5f2] hover:bg-[#eae7e2] text-[#141414] font-bold transition border border-[#eae7e2]"
          >
            Festive Formals
          </Link>
          <Link
            href="/products?category=unstitched-luxury"
            className="p-3 rounded-2xl bg-[#f7f5f2] hover:bg-[#eae7e2] text-[#141414] font-bold transition border border-[#eae7e2]"
          >
            Unstitched
          </Link>
          <Link
            href="/products?isBestDeal=true"
            className="p-3 rounded-2xl bg-[#f7f5f2] hover:bg-[#eae7e2] text-[#b87414] font-bold transition border border-amber-500/20"
          >
            Special Deals
          </Link>
        </div>

        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2.5 bg-[#141414] hover:bg-[#262626] text-white font-bold text-xs uppercase tracking-[0.16em] px-9 py-4 rounded-full transition shadow-xl hover:scale-102 cursor-pointer"
          >
            <span>Discover All Collections</span>
            <ArrowRight className="w-4 h-4 text-[#b87414]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans bg-white text-[#141414]">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b border-[#eae7e2] gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b87414]">
            Haute Couture Bag
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] mt-1">
            Shopping Bag ({itemCount} {itemCount === 1 ? 'piece' : 'pieces'})
          </h1>
        </div>
        <div className="flex items-center gap-4 self-start sm:self-auto">
          <Link
            href="/products"
            className="text-xs text-[#6b6b6b] hover:text-[#141414] font-semibold transition"
          >
            ← Continue Shopping
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Clear Bag
          </button>
        </div>
      </div>

      {/* Free Nationwide Shipping Progress Bar Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-[#faf8f5] border border-[#eae7e2] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
          <span className="text-[#141414] font-semibold flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#b87414]" />
            {remainingForFreeShipping === 0 ? (
              <strong className="text-emerald-700">Congratulations! You unlocked Free Nationwide Express Delivery.</strong>
            ) : (
              <span>
                Add <strong className="text-[#b87414] font-mono font-bold">PKR {remainingForFreeShipping.toLocaleString()}</strong> more to enjoy Complimentary Delivery across Pakistan.
              </span>
            )}
          </span>
          <span className="font-mono text-xs font-bold text-[#8c827a]">
            {progressPercent}% Met
          </span>
        </div>
        <div className="w-full h-2 bg-[#eae7e2] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#d99026] to-[#b87414] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* Left Column: Cart Items (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-[#eae7e2] rounded-3xl overflow-hidden shadow-sm">
            <div className="divide-y divide-[#eae7e2]">
              {items.map((item) => {
                const itemKey = item.cartItemId || `${item.product.id}_${item.selectedSize || 'std'}_${item.selectedColor || 'std'}`;
                const price = item.unitPrice ?? (item.product.sale_price ?? item.product.regular_price);
                const itemTotal = price * item.quantity;
                const primaryImage =
                  item.product.images?.find((img) => img.is_primary)?.image_url ||
                  item.product.images?.[0]?.image_url ||
                  null;

                return (
                  <div key={itemKey} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 hover:bg-[#faf8f5]/60 transition">
                    
                    {/* Thumbnail */}
                    <div className="relative w-20 h-26 sm:w-24 sm:h-32 rounded-2xl overflow-hidden bg-[#f7f5f2] shrink-0 border border-[#eae7e2]">
                      <ExternalImage src={primaryImage} alt={item.product.name} fill className="object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b87414] block">
                        {item.product.brand?.name || 'MFE Signature'} • {item.product.category?.name || 'Haute Couture'}
                      </span>
                      <h3 className="font-sans font-bold text-sm sm:text-base text-[#141414] hover:text-[#b87414] transition line-clamp-2">
                        <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                      </h3>

                      {/* Variant tags */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1 text-[10.5px]">
                        {item.selectedSize && (
                          <span className="px-2 py-0.5 rounded-md bg-[#f7f5f2] border border-[#eae7e2] font-semibold text-[#141414]">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="px-2 py-0.5 rounded-md bg-[#f7f5f2] border border-[#eae7e2] font-semibold text-[#141414]">
                            Color: {item.selectedColor}
                          </span>
                        )}
                      </div>

                      <div className="font-sans text-xs text-[#6b6b6b] pt-1">
                        Unit Price: <strong className="text-[#141414]">{formatPrice(price)}</strong>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1 border border-[#eae7e2] rounded-full p-1 bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#6b6b6b] hover:text-[#141414] hover:bg-[#f7f5f2] text-sm font-bold transition cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-[#141414]">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#6b6b6b] hover:text-[#141414] hover:bg-[#f7f5f2] text-sm font-bold transition cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="font-sans text-base font-black text-[#141414] sm:w-28 sm:text-right">
                      {formatPrice(itemTotal)}
                    </div>

                    {/* Single Item Delete Button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(itemKey)}
                      className="p-2 text-neutral-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                      title="Remove this item only"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#faf8f5] border border-[#eae7e2] text-xs text-[#6b6b6b]">
            <ShieldCheck className="w-4 h-4 text-[#b87414] shrink-0" />
            <span>Complimentary signature luxury gift packaging with wax seal dispatch across Karachi, Lahore, Islamabad, and all of Pakistan.</span>
          </div>
        </div>

        {/* Right Column: Order Summary (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#faf8f5] border border-[#eae7e2] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 sticky top-28">
            <h2 className="font-serif text-xl font-bold text-[#141414] pb-3 border-b border-[#eae7e2] flex items-center justify-between">
              <span>Order Summary</span>
              <span className="font-sans text-xs font-bold text-[#8c827a] uppercase">{itemCount} items</span>
            </h2>

            {/* Coupon Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#141414]">
                Promotional Voucher
              </label>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. MFE10"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#eae7e2] text-xs font-mono uppercase font-bold text-[#141414] outline-none focus:border-[#b87414]"
                />
                <button
                  type="submit"
                  disabled={isApplying}
                  className="px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-[#262626] text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-60"
                >
                  {isApplying ? '...' : 'Apply'}
                </button>
              </form>

              {couponMsg && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  couponMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {couponMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{couponMsg.text}</span>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs pt-3 border-t border-[#eae7e2]">
              <div className="flex justify-between text-[#6b6b6b]">
                <span>Bag Subtotal</span>
                <span className="font-mono font-bold text-[#141414] text-sm">{formatPrice(subtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span className="font-mono">- {formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#6b6b6b]">
                <span>Nationwide Delivery</span>
                <span className="font-mono font-bold text-[#141414]">
                  {shipping === 0 ? <span className="text-emerald-600 font-bold uppercase text-[11px]">Complimentary Free</span> : formatPrice(shipping)}
                </span>
              </div>

              <div className="flex justify-between pt-3 border-t border-[#eae7e2] text-sm">
                <span className="font-bold text-[#141414] uppercase tracking-wider text-xs">Grand Total</span>
                <span className="font-mono font-black text-[#b87414] text-lg sm:text-xl">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Checkout CTA Button */}
            <Link
              href="/checkout"
              className="w-full py-4 px-6 rounded-full bg-[#b87414] hover:bg-[#d99026] text-white font-black text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2 shadow-lg shadow-[#b87414]/25 transition hover:scale-101 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <p className="text-[10px] text-center text-[#8c827a] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bank-grade 256-Bit SSL Encrypted Checkout</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
