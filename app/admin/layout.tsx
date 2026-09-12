'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, Package, Tag, 
  MessageSquare, Truck, Sliders, Users, Settings, 
  BarChart3, Database, ShieldAlert, History, Menu, X, 
  ExternalLink, Layers, Sparkles, LogOut
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
      { href: '/admin/customers', label: 'Customers Directory', icon: Users },
      { href: '/admin/coupons', label: 'Coupons & Promos', icon: Tag },
      { href: '/admin/reviews', label: 'Reviews Moderation', icon: MessageSquare },
      { href: '/admin/shipments', label: 'Couriers & Shipments', icon: Truck },
      { href: '/admin/homepage', label: 'Homepage CMS (Hero)', icon: Sliders },
    ]
  },
  {
    group: 'System & Intelligence',
    items: [
      { href: '/admin/analytics', label: 'Sales Analytics', icon: BarChart3 },
      { href: '/admin/database', label: 'Database Monitoring', icon: Database },
      { href: '/admin/audit-logs', label: 'Audit Activity Logs', icon: History },
      { href: '/admin/settings', label: 'Store & Gateways', icon: Settings },
      { href: '/admin/profile', label: 'Security & Profile (2FA)', icon: ShieldAlert },
    ]
  }
];

export default function AdminLayout({
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white"
            aria-label="Toggle Admin Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow">
              MFE
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">
                MFE BRAND CONTROL CENTER
              </span>
              <span className="text-[10px] text-amber-400 font-mono block">
                Production Administration Suite
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Link 
            href="/admin/profile" 
            className="flex items-center gap-2 pl-3 border-l border-slate-800 hover:opacity-80 transition group"
            title="Manage Admin Profile & 2FA Security"
          >
            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center group-hover:scale-105 transition">
              A
            </div>
            <span className="text-xs font-bold text-slate-300 hidden md:inline group-hover:text-amber-400 transition">
              Super Administrator
            </span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 transition cursor-pointer disabled:opacity-50"
            title="Terminate Administrative Session"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">{loggingOut ? 'Logging out...' : 'Sign Out'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar (Left) */}
        <aside className="hidden lg:block w-64 shrink-0 bg-slate-900/60 border-r border-slate-800 p-4 space-y-6 overflow-y-auto">
          {ADMIN_NAV_GROUPS.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block">
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
                        ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-md pt-16 p-6 overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
              <span className="text-sm font-bold text-amber-500">Navigation Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            {ADMIN_NAV_GROUPS.map((group, idx) => (
              <div key={idx} className="mb-6 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{group.group}</span>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-bold py-1.5 text-slate-300 hover:text-amber-400"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Admin Content Viewport */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
