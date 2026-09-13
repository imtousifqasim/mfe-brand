'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Check, 
  Truck, 
  ShieldCheck, 
  Tag, 
  Copy, 
  MessageCircle 
} from 'lucide-react';
import { CouponCopiedModal } from '@/components/storefront/CouponCopiedModal';

interface AnnouncementBarProps {
  message?: string;
  couponCode?: string | null;
  linkUrl?: string | null;
  whatsappNumber?: string | null;
  tickerMessages?: string[] | null;
}

export function AnnouncementBar({
  message = 'Complimentary Express Nationwide Delivery on orders over PKR 5,000',
  couponCode = 'MFE10',
  whatsappNumber = '+92 300 1234567',
  tickerMessages,
}: AnnouncementBarProps) {
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const cleanMessage =
    !message || message.toLowerCase().includes('use code') || message.length > 70
      ? 'Complimentary Express Nationwide Delivery on orders over PKR 5,000'
      : message;

  const activeWhatsApp = whatsappNumber || '+92 300 1234567';
  const cleanPhoneDigits = activeWhatsApp.replace(/[^0-9]/g, '');

  const copyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setModalOpen(true);
    setTimeout(() => setCopied(false), 2600);
  };

  const defaultMessages = [
    cleanMessage,
    'Haute Couture 2026: Pure Handcrafted Lawn, Silk & Chiffon Heirlooms',
    '100% Genuine Designer Fabrics & 7-Day Seamless Return Privilege',
    couponCode 
      ? `First Order Privilege: Unlock 10% Off with Code ${couponCode}` 
      : 'Complimentary Styling Assistance Across Pakistan',
    `VIP WhatsApp Concierge: ${activeWhatsApp} (Live Support)`,
  ];

  const activeList = tickerMessages && tickerMessages.length > 0 ? tickerMessages : defaultMessages;

  const tickerItems = activeList.map((text, i) => {
    let icon = <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    if (i % 4 === 1) icon = <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    if (i % 4 === 2) icon = <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    if (i % 4 === 3) icon = <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    return { icon, text };
  });

  return (
    <>
      <aside 
        aria-label="Announcement & VIP Privileges" 
        className="bg-[#0b0c10] text-neutral-300 text-[11px] font-sans border-b border-amber-500/20 relative z-40 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
          
          {/* DESKTOP & TABLET VIEW */}
          <div className="hidden md:flex items-center justify-between gap-4">
            
            {/* Smooth Scrolling Ticker Section */}
            <div className="flex-1 min-w-0 overflow-hidden relative announcement-ticker-container">
              {/* Subtle edge fades */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0b0c10] to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0b0c10] to-transparent z-10" />

              <div className="animate-announcement-ticker flex items-center gap-10 cursor-default select-none">
                {[...tickerItems, ...tickerItems].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 shrink-0 whitespace-nowrap text-neutral-300 font-medium">
                    <span className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-inner">
                      {item.icon}
                    </span>
                    <span className="hover:text-amber-300 transition-colors">{item.text}</span>
                    <span className="text-amber-500/40 ml-5 select-none">✦</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dedicated Modern VIP Coupon Capsule & Official WhatsApp Concierge (No PKR/Rs, No Phone call) */}
            <div className="flex items-center gap-3 shrink-0">
              {couponCode && (
                <button
                  type="button"
                  onClick={copyCode}
                  className="group relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 hover:from-amber-500/25 hover:to-amber-500/25 border border-amber-500/50 hover:border-amber-400 text-neutral-200 transition-all duration-300 shadow-[0_0_15px_rgba(217,144,38,0.18)] hover:shadow-[0_0_24px_rgba(217,144,38,0.35)] cursor-pointer active:scale-95"
                  title="Click to copy coupon code for 10% instant discount"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
                  
                  <span className="text-[10px] font-bold tracking-wider text-white uppercase hidden lg:inline">
                    VIP 10% OFF:
                  </span>

                  <span className="font-mono font-black text-amber-300 tracking-wider text-xs px-2 py-0.5 rounded bg-black/60 border border-amber-500/40 shadow-inner">
                    {couponCode}
                  </span>

                  <span className={`inline-flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full transition-all duration-200 ${
                    copied 
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30' 
                      : 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 group-hover:from-amber-400 group-hover:to-amber-300'
                  }`}>
                    {copied ? (
                      <>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span>COPY</span>
                      </>
                    )}
                  </span>
                </button>
              )}

              <span className="text-neutral-700 select-none hidden lg:inline">|</span>

              {/* Official WhatsApp Concierge (Set from Admin) */}
              <a
                href={`https://wa.me/${cleanPhoneDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:border-emerald-400 transition group cursor-pointer shadow-xs"
                title="Direct WhatsApp VIP Concierge"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-xs text-neutral-200">
                  WhatsApp: <span className="font-mono text-emerald-400 font-bold">{activeWhatsApp}</span>
                </span>
              </a>
            </div>

          </div>

          {/* MOBILE VIEW */}
          <div className="flex md:hidden flex-col gap-1.5">
            {/* Mobile Scrolling Marquee */}
            <div className="overflow-hidden relative announcement-ticker-container py-0.5">
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0b0c10] to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0b0c10] to-transparent z-10" />

              <div className="animate-announcement-ticker flex items-center gap-6 cursor-default select-none text-[10.5px]">
                {[...tickerItems, ...tickerItems].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 shrink-0 whitespace-nowrap text-neutral-300">
                    {item.icon}
                    <span>{item.text}</span>
                    <span className="text-amber-500/40 ml-3 select-none">•</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Actions Bar: Coupon Badge + WhatsApp Link */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
              {couponCode ? (
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-neutral-200 text-[10px] active:scale-95 transition"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span className="font-semibold text-white">10% OFF:</span>
                  <span className="font-mono font-bold text-amber-300 bg-black/40 px-1.5 py-0.5 rounded border border-amber-500/30">
                    {couponCode}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    copied ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'
                  }`}>
                    {copied ? '✓ COPIED' : 'TAP TO COPY'}
                  </span>
                </button>
              ) : (
                <span className="text-[10px] text-neutral-400">MFE Haute Couture 2026</span>
              )}

              <a
                href={`https://wa.me/${cleanPhoneDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10.5px] text-emerald-400 hover:text-emerald-300 font-medium shrink-0 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30"
              >
                <MessageCircle className="w-3 h-3 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>
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
