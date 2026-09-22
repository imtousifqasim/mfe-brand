'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, Package, Tag, 
  MessageSquare, Truck, Sliders, Users, Settings, 
  BarChart3, Database, ShieldAlert, History, Menu, X, 
  ExternalLink, Layers, Sparkles, LogOut, Mail, CreditCard
} from 'lucide-react';

const ADMIN_NAV_GROUPS = [
  {
    group: 'Main',
    items: [
      { href: '/admin', label: 'Executive Overview', icon: LayoutDashboard },
      { href: '/admin/orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
      { href: '/admin/products', label: 'Products Catalog', icon: Package },
      { href: '/admin/categories', label: 'Categories', icon: Layers },
      { href: '/admin/brands', label: 'Brands & Labels', icon: Sparkles },
    ]
  },
  {
    group: 'Marketing & Customers',
    items: [
      { href: '/admin/subscribers', label: 'VIP Subscribers & SMTP', icon: Mail },
      { href: '/admin/customers', label: 'Customers Directory', icon: Users },
      { href: '/admin/coupons', label: 'Coupons & Promos', icon: Tag },
      { href: '/admin/reviews', label: 'Reviews Moderation', icon: MessageSquare },
      { href: '/admin/shipments', label: 'Couriers & Shipments', icon: Truck },
      { href: '/admin/homepage', label: 'Announcement & Hero CMS', icon: Sliders },
    ]
  },
  {
    group: 'System & Intelligence',
    items: [
      { href: '/admin/analytics', label: 'Sales Analytics', icon: BarChart3 },
      { href: '/admin/database', label: 'Database Monitoring', icon: Database },
      { href: '/admin/audit-logs', label: 'Audit Activity Logs', icon: History },
      { href: '/admin/payment-methods', label: 'Payment Gateways & Tills', icon: CreditCard },
      { href: '/admin/settings', label: 'Store & Gateways', icon: Settings },
      { href: '/admin/profile', label: 'Security & Profile (2FA)', icon: ShieldAlert },
    ]
  }
];

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // If on login page, render clean page without admin shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Toggle Admin Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="MFE BRAND Logo"
              className="w-8 h-8 rounded-xl object-contain shadow-xs bg-white p-0.5 border border-slate-200"
            />
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
                MFE BRAND CONTROL
              </span>
              <span className="text-[10px] text-amber-700 font-semibold tracking-wider uppercase block">
                Atelier Administration Suite
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 px-3 py-1.5 rounded-xl transition shadow-2xs"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <Link 
            href="/admin/profile" 
            className="flex items-center gap-2 pl-3 border-l border-slate-200 hover:opacity-80 transition group"
            title="Manage Admin Profile & 2FA Security"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
              A
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-slate-900 block leading-none">
                Super Admin
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold block leading-none mt-0.5">
                ● Active Session
              </span>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Terminate Administrative Session"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">{loggingOut ? 'Logging out...' : 'Sign Out'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar (Left) */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-200/90 p-4 space-y-6 overflow-y-auto">
          {ADMIN_NAV_GROUPS.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block">
                {group.group}
              </span>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-16 p-6 overflow-y-auto border-r border-slate-200 shadow-xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6">
              <span className="text-sm font-black text-slate-900">Navigation Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            {ADMIN_NAV_GROUPS.map((group, idx) => (
              <div key={idx} className="mb-6 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{group.group}</span>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                        isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Admin Content Viewport */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
