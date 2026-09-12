'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Phone, ChevronDown, Check, ArrowRight } from 'lucide-react';
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

  // If the message is the legacy repetitive text, clean it up to the refined luxury delivery promise
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
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <>
      <aside 
        aria-label="Announcement & VIP Privileges" 
        className="bg-[#0b0b0e] text-neutral-300 text-[11px] font-sans border-b border-white/[0.07] relative z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          
          {/* DESKTOP & TABLET VIEW (md and up) */}
          <div className="hidden md:flex items-center justify-between gap-4">
            
            {/* Left: Clean Brand Promise */}
            <div className="flex items-center gap-2 text-neutral-400 text-[11px] font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/90 shrink-0 animate-pulse" />
              <span>{cleanMessage}</span>
            </div>

            {/* Center: Sleek Luxury Coupon Pill */}
            {couponCode && (
              <button
                type="button"
                onClick={copyCode}
                className="group inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-amber-500/30 text-neutral-200 transition-all text-[11px] shadow-sm cursor-pointer active:scale-98"
                title="Click to copy coupon code for 10% discount"
              >
                <Sparkles className="w-3 h-3 text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
                <span className="text-neutral-300 font-semibold tracking-wide">10% OFF FIRST ORDER</span>
                <span className="text-neutral-600 font-light">•</span>
                <span className="text-neutral-400">Code:</span>
                <span className="font-mono font-bold text-amber-300 tracking-wider">{couponCode}</span>
                <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30 transition-colors">
                  {copied ? '✓ COPIED' : 'COPY'}
                </span>
              </button>
            )}

            {/* Right: Clean Concierge Helpline & Currency */}
            <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-amber-400 transition"
              >
                <Phone className="w-3 h-3 text-amber-400/90 shrink-0" />
                <span>Concierge: +92 300 1234567</span>
              </a>
              <span className="text-neutral-700 select-none">•</span>
              <span className="font-semibold text-neutral-300 text-[10px] tracking-wider uppercase">
                PKR (₨)
              </span>
            </div>

          </div>

          {/* MOBILE VIEW (Clean, single focused row with no cluttered wrapping) */}
          <div className="flex md:hidden items-center justify-between gap-2">
            {couponCode ? (
              <button
                type="button"
                onClick={copyCode}
                className="flex items-center gap-1.5 text-[11px] text-neutral-200 font-medium py-0.5 group cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span>10% OFF:</span>
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
              className="inline-flex items-center gap-1 text-[10px] text-neutral-400 hover:text-amber-400 font-medium shrink-0"
            >
              <Phone className="w-2.5 h-2.5 text-amber-400/90 shrink-0" />
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
