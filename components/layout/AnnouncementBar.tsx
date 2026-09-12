'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tag, Check, ArrowRight, Phone, Sparkles } from 'lucide-react';

interface AnnouncementBarProps {
  message?: string;
  couponCode?: string | null;
  linkUrl?: string | null;
}

export function AnnouncementBar({
  message = 'Complimentary Express Nationwide Delivery on all orders over PKR 5,000',
  couponCode = 'MFE10',
  linkUrl = '/products',
}: AnnouncementBarProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <aside aria-label="Announcement" className="bg-[#0c0c0e] text-neutral-300 text-[11px] font-sans border-b border-white/[0.06] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Brand Promise */}
        <div className="flex items-center gap-2.5 tracking-wider uppercase font-semibold text-[10px] text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>{message}</span>
        </div>

        {/* Center: Exclusive Coupon Code Pill */}
        <div className="flex items-center gap-3">
          {couponCode && (
            <button
              onClick={copyCode}
              className="group inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 text-neutral-200 transition text-[11px] shadow-sm"
              title="Click to copy coupon code for 10% discount"
            >
              <Sparkles className="w-3 h-3 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="text-neutral-400">Use Code:</span>
              <span className="font-mono font-bold text-amber-300 tracking-wider">{couponCode}</span>
              <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30">
                {copied ? '✓ COPIED' : 'COPY'}
              </span>
            </button>
          )}

          {linkUrl && (
            <Link
              href={linkUrl}
              className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition uppercase tracking-wider"
            >
              <span>Explore Deals</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Right: Concierge Contact & Currency */}
        <div className="hidden sm:flex items-center gap-4 text-neutral-400 text-[11px]">
          <a
            href="https://wa.me/923001234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-amber-400 transition"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>WhatsApp Concierge: +92 300 1234567</span>
          </a>
          <span className="text-neutral-700">|</span>
          <span className="font-semibold text-neutral-300 uppercase tracking-widest text-[10px]">
            PKR (₨)
          </span>
        </div>

      </div>
    </aside>
  );
}
