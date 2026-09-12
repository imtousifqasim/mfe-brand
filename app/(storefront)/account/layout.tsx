'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, MapPin, User, 
  Heart, Layers, LogOut, Truck, Sparkles, ChevronRight 
} from 'lucide-react';

const ACCOUNT_NAV = [
  { href: '/account', label: 'Dashboard Overview', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Order History & Invoices', icon: ShoppingBag },
  { href: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
  { href: '/account/profile', label: 'Atelier Profile & Security', icon: User },
  { href: '/wishlist', label: 'Curated Wishlist', icon: Heart },
  { href: '/compare', label: 'Product Compare', icon: Layers },
  { href: '/track-order', label: 'Courier Tracking Portal', icon: Truck },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Account Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#121216] via-[#15151b] to-[#09090b] text-white p-6 sm:p-10 rounded-3xl mb-10 border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            MFE Patron Lounge • VIP Concierge
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold mt-1 text-white">
            Welcome, Tousif Qasim
          </h1>
          <p className="text-xs text-neutral-400 font-sans">
            Maison Member since September 2026 • Royal Gold Tier • Express Dispatch Enabled
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-6 py-3 rounded-full transition shadow-lg shadow-amber-500/20 uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover New Pieces</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Navigation Sidebar (3 Cols) */}
        <aside className="lg:col-span-3">
          <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-4 shadow-xl space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
              Patron Navigation
            </div>
            {ACCOUNT_NAV.map((nav) => {
              const Icon = nav.icon;
              const isActive = pathname === nav.href;

              return (
                <Link
                  key={nav.href}
                  href={nav.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-neutral-300 hover:bg-neutral-900/80 hover:text-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-neutral-400'}`} />
                    <span>{nav.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => alert('Logged out from simulated patron session.')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out of Atelier</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Content Area (9 Cols) */}
        <div className="lg:col-span-9">
          {children}
        </div>

      </div>

    </div>
  );
}
