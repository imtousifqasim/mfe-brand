'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Phone, ChevronDown, Check, Truck, ShieldCheck } from 'lucide-react';
import { CouponCopiedModal } from '@/components/storefront/CouponCopiedModal';

interface AnnouncementBarProps {
  message?: string;
  couponCode?: string | null;
  linkUrl?: string | null;
}

export function AnnouncementBar({
  message = 'Complimentary Express Nationwide Delivery on orders over PKR 5,000',
  couponCode = 'MFE10',
}: AnnouncementBarProps) {
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const cleanMessage =
    !message || message.toLowerCase().includes('use code') || message.length > 70
      ? 'Complimentary Express Nationwide Delivery on orders over PKR 5,000'
      : message;

  const copyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setModalOpen(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <>
      <aside 
        aria-label="Announcement & VIP Privileges" 
        className="bg-[#0b0c10] text-neutral-300 text-[11px] font-sans border-b border-amber-500/20 relative z-40 transition-colors shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
          
          {/* DESKTOP & TABLET VIEW (3-Column Balanced Layout) */}
          <div className="hidden lg:grid grid-cols-12 items-center gap-4">
            
            {/* Left Column (Col 4): Brand Promise with Icon */}
            <div className="col-span-4 flex items-center justify-start gap-2.5 text-neutral-400 text-[11px] font-medium tracking-wide">
              <span className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-amber-400 shadow-inner">
                <Truck className="w-3.5 h-3.5" />
              </span>
              <span className="truncate text-neutral-300 font-medium">{cleanMessage}</span>
            </div>

            {/* Center Column (Col 4): Mathematically Centered Designer Promo Capsule */}
            <div className="col-span-4 flex items-center justify-center">
              {couponCode && (
                <button
                  type="button"
                  onClick={copyCode}
                  className="group inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 hover:from-amber-500/20 hover:to-amber-500/20 border border-amber-500/40 hover:border-amber-400 text-neutral-200 transition-all duration-300 shadow-[0_0_15px_rgba(217,144,38,0.12)] hover:shadow-[0_0_22px_rgba(217,144,38,0.25)] cursor-pointer active:scale-98"
                  title="Click to copy coupon code for 10% discount"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform shrink-0 animate-pulse" />
                  <span className="text-white font-bold tracking-[0.14em] uppercase text-[10.5px]">
                    10% OFF FIRST ORDER
                  </span>
                  <span className="text-amber-500/40 select-none">•</span>
                  <span className="font-mono font-black text-amber-300 tracking-wider text-xs px-2 py-0.5 rounded bg-black/50 border border-amber-500/30">
                    {couponCode}
                  </span>
                  <span className={`text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full transition-all shadow-sm ${
                    copied 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 group-hover:from-amber-400 group-hover:to-amber-300'
                  }`}>
                    {copied ? '✓ COPIED' : 'COPY'}
                  </span>
                </button>
              )}
            </div>

            {/* Right Column (Col 4): Live Concierge Hotline & Currency */}
            <div className="col-span-4 flex items-center justify-end gap-3 text-neutral-400 text-[11px]">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-amber-300 transition group"
                title="Direct WhatsApp Concierge Assistance"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <Phone className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-neutral-300">Concierge: +92 300 1234567</span>
              </a>

              <span className="text-neutral-800 select-none">|</span>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-300 text-[10px] font-bold tracking-widest uppercase hover:bg-white/[0.08] transition cursor-pointer">
                <span>PKR (₨)</span>
                <ChevronDown className="w-3 h-3 text-neutral-500" />
              </div>
            </div>

          </div>

          {/* TABLET VIEW (md to lg) */}
          <div className="hidden md:flex lg:hidden items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-neutral-400 text-[11px] font-medium truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="truncate">{cleanMessage}</span>
            </div>

            {couponCode && (
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-neutral-200 transition text-[11px] shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="font-bold text-white text-[10.5px]">10% OFF</span>
                <span className="font-mono font-bold text-amber-300">{couponCode}</span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  {copied ? '✓' : 'COPY'}
                </span>
              </button>
            )}
          </div>

          {/* MOBILE VIEW (Single Clean Row) */}
          <div className="flex md:hidden items-center justify-between gap-2">
            {couponCode ? (
              <button
                type="button"
                onClick={copyCode}
                className="flex items-center gap-1.5 text-[11px] text-neutral-200 font-medium py-0.5 group cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="font-semibold text-white">10% OFF:</span>
                <span className="font-mono font-bold text-amber-300 px-1.5 py-0.5 rounded bg-white/5 border border-amber-500/30">
                  {couponCode}
                </span>
                <span className="text-[9px] uppercase font-bold text-amber-400 ml-1">
                  {copied ? '✓ COPIED' : 'TAP TO COPY'}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/90 shrink-0" />
                <span className="truncate">{cleanMessage}</span>
              </div>
            )}

            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-neutral-300 hover:text-amber-400 font-medium shrink-0 bg-white/[0.04] px-2 py-1 rounded-full border border-white/[0.08]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Concierge</span>
            </a>
          </div>

        </div>
      </aside>

      {/* Modern Luxury Pop-Up Modal */}
      {couponCode && (
        <CouponCopiedModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          couponCode={couponCode}
        />
      )}
    </>
  );
}
