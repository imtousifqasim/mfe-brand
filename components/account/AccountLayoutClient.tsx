'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, MapPin, User, 
  Heart, Layers, LogOut, Truck, Sparkles, ChevronRight,
  Loader2 
} from 'lucide-react';
import { useCustomer } from '@/components/providers/CustomerProvider';
import { CustomerAuthPortal } from '@/components/auth/CustomerAuthPortal';

const ACCOUNT_NAV = [
  { href: '/account', label: 'Dashboard Overview', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Order History & Invoices', icon: ShoppingBag },
  { href: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
  { href: '/account/profile', label: 'Atelier Profile & Security', icon: User },
  { href: '/wishlist', label: 'Curated Wishlist', icon: Heart },
  { href: '/compare', label: 'Product Compare', icon: Layers },
  { href: '/track-order', label: 'Courier Tracking Portal', icon: Truck },
];

export function AccountLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, loading, logout } = useCustomer();

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#faf8f5] flex flex-col items-center justify-center gap-3 text-[#6b6b6b]">
        <Loader2 className="w-8 h-8 animate-spin text-[#b87414]" />
        <span className="text-xs uppercase tracking-widest font-sans font-semibold">
          Connecting to Atelier Patron Lounge...
        </span>
      </div>
    );
  }

  // If visitor is NOT logged in, show the Customer Authentication Portal
  if (!customer) {
    return (
      <div className="min-h-[85vh] bg-[#faf8f5] px-4 sm:px-6 lg:px-8 py-16">
        <CustomerAuthPortal />
      </div>
    );
  }

  const handleSignOut = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] py-10 font-sans text-[#141414]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Modern Luxury Customer Account Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white via-[#faf8f5] to-[#f5f0e8] text-[#141414] p-6 sm:p-10 rounded-3xl mb-8 border border-[#e8dfd2] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#b87414] bg-[#b87414]/10 border border-[#b87414]/20 px-3 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-[#b87414]" />
              <span>MFE Patron Lounge • {customer.tier || 'VIP Concierge'}</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[#141414]">
              Welcome, {customer.full_name}
            </h1>
            <p className="text-xs text-[#6b6b6b] font-sans">
              Verified Patron: <span className="font-semibold text-[#141414]">{customer.email}</span>
              {customer.phone && <> • Phone: <span className="font-semibold text-[#141414]">{customer.phone}</span></>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs bg-[#141414] hover:bg-[#262626] text-white font-bold px-5 py-3 rounded-2xl transition shadow uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#b87414]" />
              <span>Discover New Pieces</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-xs bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-semibold px-4 py-3 rounded-2xl transition shadow-sm cursor-pointer"
              title="Sign Out of Atelier"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Navigation Sidebar (3 Cols) */}
          <aside className="lg:col-span-3">
            <div className="bg-white border border-[#eae7e2] rounded-3xl p-4 shadow-sm space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8c827a]">
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
                        ? 'bg-[#141414] text-white font-bold shadow-sm'
                        : 'text-[#525252] hover:bg-[#faf8f5] hover:text-[#b87414]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#b87414]' : 'text-[#8c827a]'}`} />
                      <span>{nav.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#b87414]" />}
                  </Link>
                );
              })}

              <div className="pt-4 mt-4 border-t border-[#eae7e2]">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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
    </div>
  );
}
