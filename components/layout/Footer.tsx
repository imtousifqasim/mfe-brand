'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Sparkles, ArrowUpRight } from 'lucide-react';
import { SEED_CATEGORIES } from '@/lib/data/seed-data';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subMessage, setSubMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribed(true);
        setSubMessage(data.message || 'You are on the VIP guest list for private releases.');
      } else {
        alert(data.error || 'Failed to subscribe.');
      }
    } catch {
      setSubscribed(true);
      setSubMessage('Thank you for joining MFE Private Salon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#0c0c0e] text-neutral-300 border-t border-white/[0.08] pt-24 pb-16 transition-colors font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter / Salon Pre-Order Banner with Generous Luxury Spacing */}
        <div className="mb-24 p-10 sm:p-16 lg:p-20 rounded-3xl bg-gradient-to-br from-[#16161c] via-[#121216] to-[#0c0c0e] border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl">
          <div className="max-w-xl text-center lg:text-left space-y-3">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#d99026] flex items-center justify-center lg:justify-start gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MFE Private Salon Membership</span>
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Receive VIP Access to Private Pre-Orders
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans pt-1">
              Be the first to secure limited-edition unstitched lawn drops, bridal formals, and hand-woven Kashmiri pashminas before public release.
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            {subscribed ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold text-white">Privilege Membership Registered</p>
                  <p className="text-[11px] text-emerald-300 mt-0.5">{subMessage}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 px-5 py-4 text-xs bg-neutral-950/80 border border-neutral-700 rounded-full focus:outline-none focus:border-[#d99026] text-white placeholder-neutral-400 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 rounded-full bg-[#d99026] hover:bg-[#c67d18] text-[#141414] font-bold text-xs uppercase tracking-[0.16em] transition shadow-lg shadow-[#d99026]/25 whitespace-nowrap cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'Joining...' : 'Join Salon'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 4 Major Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/[0.08]">
          
          {/* Column 1: Brand & Social */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl tracking-[0.22em] uppercase font-bold text-white">
                MFE BRAND
              </span>
              <div className="text-[9px] tracking-[0.35em] font-sans font-bold text-[#d99026] uppercase mt-0.5">
                Haute Couture • Est. 2026
              </div>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              MFE Brand defines contemporary Pakistani high fashion, combining heirloom artisanal zardozi embroidery with modern pret silhouettes for timeless luxury.
            </p>
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 block mb-3">
                Follow The Atelier
              </span>
              <div className="flex items-center gap-3 text-neutral-300">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center hover:text-[#d99026] hover:border-[#d99026] transition" aria-label="Instagram">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center hover:text-[#d99026] hover:border-[#d99026] transition" aria-label="Facebook">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center hover:text-[#d99026] hover:border-[#d99026] transition" aria-label="YouTube">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9 10 15"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Customer Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white mb-5 font-sans">
              Customer Concierge
            </h3>
            <ul className="space-y-3 text-xs text-neutral-300 font-sans">
              <li>
                <Link href="/account" className="hover:text-white hover:underline transition">My Account Portal</Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-white hover:underline transition">Order History</Link>
              </li>
              <li>
                <Link href="/track-order" className="text-[#d99026] font-bold hover:underline transition">Track Consignment</Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white hover:underline transition">Curated Wishlist</Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white hover:underline transition">Compare Formals</Link>
              </li>
              <li>
                <Link href="/products?isBestDeal=true" className="hover:text-white hover:underline transition">Limited Edition Specials</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white mb-5 font-sans">
              Couture Collections
            </h3>
            <ul className="space-y-3 text-xs text-neutral-300 font-sans">
              {SEED_CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-white hover:underline transition">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/products?isNewArrival=true" className="hover:text-[#d99026] transition">
                  New Season 2026
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Flagship */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white mb-5 font-sans">
              Flagship Atelier
            </h3>
            <ul className="space-y-3 text-xs text-neutral-300 font-sans">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#d99026] shrink-0 mt-0.5" />
                <span>Near Meezan Bank Branch, Peco Road, Lahore, Punjab, Pakistan</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#d99026] shrink-0" />
                <a href="tel:+923267727318" className="hover:text-[#d99026] transition">
                  +92 326 7727318
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#d99026] shrink-0" />
                <span>concierge@mfebrand.com</span>
              </li>
              <li className="pt-2 text-[11px] text-neutral-400">
                Opening Hours: Mon - Sat: 11:00 AM - 9:00 PM PKT
              </li>
            </ul>
          </div>

        </div>

        {/* Modern Developer Credit & Hire CTA Showcase */}
        <div className="my-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-[#d99026]/[0.06] border border-white/[0.1] hover:border-[#d99026]/40 transition-all duration-500 relative overflow-hidden group shadow-2xl backdrop-blur-md">
          {/* Subtle ambient decorative gradient */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#d99026]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#d99026]/20 transition-all duration-700" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#d99026]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
              <a 
                href="https://tousifqasim.dev/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d99026] via-[#b87414] to-[#7a4805] text-black font-extrabold text-xl flex items-center justify-center shadow-lg shadow-[#d99026]/20 hover:scale-105 active:scale-95 transition-transform shrink-0 tracking-wider font-display"
                title="Tousif Qasim - Full Stack & Modern Web Engineer"
              >
                TQ
              </a>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <span className="text-white font-semibold text-sm sm:text-base tracking-wide font-sans">
                    Engineered & Designed with precision by{' '}
                    <a
                      href="https://tousifqasim.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#d99026] hover:text-[#f3a83b] underline underline-offset-4 decoration-[#d99026]/40 hover:decoration-[#d99026] font-bold transition-colors inline-flex items-center gap-1"
                    >
                      Tousif Qasim
                      <ArrowUpRight className="w-3.5 h-3.5 inline" />
                    </a>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Available for Custom Projects
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed font-sans">
                  Impressed by this modern e-commerce experience? Elevate your brand with a bespoke, lightning-fast web application or luxury store tailored for scale.
                </p>
              </div>
            </div>

            <a
              href="https://tousifqasim.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#d99026] to-[#b87414] hover:from-[#e59b30] hover:to-[#c87e16] text-black font-bold text-xs uppercase tracking-[0.16em] transition-all duration-300 shadow-lg shadow-[#d99026]/25 hover:shadow-[#d99026]/40 hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap shrink-0 group/cta"
            >
              <span>Build Your Website</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-sans">
          <p>
            © {new Date().getFullYear()} MFE BRAND Haute Couture. All Rights Reserved. Crafted by{' '}
            <a
              href="https://tousifqasim.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d99026] hover:text-[#f3a83b] hover:underline font-medium inline-flex items-center gap-0.5 transition-colors"
            >
              Tousif Qasim
              <ArrowUpRight className="w-3 h-3 inline" />
            </a>
          </p>
          <div className="flex items-center gap-4 text-[11px] text-neutral-300">
            <span>Cash on Delivery (COD)</span>
            <span>•</span>
            <span>Bank Transfer</span>
            <span>•</span>
            <span>EasyPaisa / JazzCash</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
