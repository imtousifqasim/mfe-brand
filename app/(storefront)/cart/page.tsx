'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { ExternalImage } from '@/components/media/ExternalImage';
import { formatPrice } from '@/lib/utils';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

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
  const [couponMsg, setCouponMsg] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    const res = await applyCoupon(inputCoupon);
    setCouponMsg(res.message);
    setIsApplying(false);
  };

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-[#6b6b6b] font-sans bg-white">
        <div className="w-10 h-10 border-2 border-[#d99026] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="text-xs uppercase tracking-widest">Opening Atelier Shopping Bag...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center font-sans bg-white text-[#141414]">
        <div className="w-20 h-20 bg-[#d99026]/10 text-[#b87414] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#d99026]/20 shadow-md">
          <ShoppingBag className="w-9 h-9" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#141414]">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs sm:text-sm text-[#6b6b6b] mt-2.5 max-w-md mx-auto leading-relaxed">
          Explore our signature unstitched lawn, festive velvet formals, and hand-woven pashmina heirlooms to begin your order.
        </p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2.5 bg-[#d99026] hover:bg-[#c67d18] text-[#141414] font-bold text-xs uppercase tracking-[0.16em] px-8 py-4 rounded-full transition shadow-lg"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans bg-white text-[#141414]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-10 border-b border-[#eae7e2] gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b87414]">
            Selected Couture Ensembles
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] mt-1">
            Shopping Bag ({itemCount} {itemCount === 1 ? 'piece' : 'pieces'})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-bold uppercase tracking-wider transition self-start sm:self-auto cursor-pointer"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Cart Items List (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-[#eae7e2] rounded-3xl overflow-hidden shadow-sm">
            <div className="divide-y divide-[#eae7e2]">
              {items.map(({ product, quantity }) => {
                const price = product.sale_price ?? product.regular_price;
                const itemTotal = price * quantity;
                const imgUrl = product.images?.[0]?.image_url || null;

                return (
                  <div key={product.id} className="p-5 sm:p-7 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 hover:bg-[#f7f5f2] transition">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-32 rounded-2xl overflow-hidden bg-[#f7f5f2] shrink-0 border border-[#eae7e2]">
                      <ExternalImage src={imgUrl} alt={product.name} fill className="object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b87414]">
                        {product.brand?.name || 'MFE Signature'} • {product.category?.name || 'Haute Couture'}
                      </span>
                      <h3 className="font-sans font-bold text-base text-[#141414] hover:text-[#b87414] transition">
                        <Link href={`/products/${product.slug}`}>{product.name}</Link>
                      </h3>
                      <div className="font-sans text-sm font-bold text-[#141414] pt-1">
                        {formatPrice(price)}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 border border-[#eae7e2] rounded-full p-1 bg-white">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#6b6b6b] hover:text-[#141414] hover:bg-[#f7f5f2] text-sm font-bold transition cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#141414]">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#6b6b6b] hover:text-[#141414] hover:bg-[#f7f5f2] text-sm font-bold transition cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="font-sans text-base font-bold text-[#141414] sm:w-28 sm:text-right">
                      {formatPrice(itemTotal)}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="p-2 text-[#6b6b6b] hover:text-rose-600 transition cursor-pointer"
                      title="Remove piece"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#f7f5f2] border border-[#eae7e2] text-xs text-[#6b6b6b]">
            <ShieldCheck className="w-4 h-4 text-[#b87414] shrink-0" />
            <span>Complimentary signature gift packaging and tamper-evident courier seal on all dispatches.</span>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#f7f5f2] border border-[#eae7e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#141414] pb-3 border-b border-[#eae7e2]">
              Bag Summary
            </h2>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b6b6b] block">
                Patron Voucher / Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. MFE10"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 text-xs bg-white border border-[#eae7e2] rounded-xl focus:outline-none focus:border-[#d99026] text-[#141414] uppercase font-mono tracking-wider"
                />
                <button
                  type="submit"
                  disabled={isApplying}
                  className="px-5 py-2.5 rounded-xl bg-[#141414] hover:bg-[#262626] text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
                >
                  {isApplying ? '...' : 'Apply'}
                </button>
              </div>
              {couponMsg && (
                <p className="text-xs text-[#b87414] pt-1 font-semibold">{couponMsg}</p>
              )}
            </form>

            {/* Totals Breakdown */}
            <div className="space-y-3 text-xs pt-2 border-t border-[#eae7e2]">
              <div className="flex justify-between text-[#6b6b6b]">
                <span>Subtotal</span>
                <span className="font-sans font-bold text-[#141414] text-sm">{formatPrice(subtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span className="font-sans font-bold">-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#6b6b6b]">
                <span>Nationwide Express Courier</span>
                <span className="text-[#141414] font-bold">
                  {shipping === 0 ? <span className="text-emerald-700 uppercase tracking-wider text-[11px] font-bold">Complimentary</span> : formatPrice(shipping)}
                </span>
              </div>

              <div className="pt-3 border-t border-[#eae7e2] flex justify-between items-baseline">
                <span className="text-sm font-bold uppercase tracking-wider text-[#141414]">Estimated Total</span>
                <span className="font-sans text-2xl font-black text-[#141414]">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="w-full bg-[#d99026] hover:bg-[#c67d18] text-[#141414] font-bold text-xs uppercase tracking-[0.16em] py-4 rounded-full flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
