'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Check, X, ArrowRight, Tag, ShoppingBag } from 'lucide-react';

interface CouponCopiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  couponCode: string;
  discountText?: string;
}

export function CouponCopiedModal({
  isOpen,
  onClose,
  couponCode,
  discountText = 'Enjoy 10% instant discount on your bespoke couture order.',
}: CouponCopiedModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-modal-title"
        className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#1c1c22] to-[#121216] border border-amber-500/30 p-6 sm:p-8 shadow-2xl text-white font-sans z-10 animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/15 blur-[60px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-4 relative z-10 pt-2">
          {/* Badge & Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 shadow-inner">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Check className="w-3.5 h-3.5" />
              <span>Promo Code Copied to Clipboard!</span>
            </div>
            <h2 id="coupon-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Privilege Unlocked
            </h2>
            <p className="text-xs text-neutral-300 mt-1 max-w-xs mx-auto leading-relaxed">
              {discountText}
            </p>
          </div>

          {/* Coupon Code Pill */}
          <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/40 flex items-center justify-between gap-3 max-w-xs mx-auto">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Code:</span>
            </div>
            <span className="font-mono text-base font-black tracking-widest text-amber-300">
              {couponCode}
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              COPIED
            </span>
          </div>

          {/* Instructions */}
          <p className="text-[11px] text-neutral-400">
            Paste this code at checkout in the promo voucher field to redeem your savings instantly.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <Link
              href="/products"
              onClick={onClose}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              <span>Explore Haute Pieces</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold tracking-wider transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
