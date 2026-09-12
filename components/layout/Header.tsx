'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Sparkles, 
  Truck, 
  Menu, 
  X, 
  ChevronDown, 
  ArrowRight,
  Layers,
  Compass,
  LogOut,
  Shield
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useCustomer } from '@/components/providers/CustomerProvider';
import { ExternalImage } from '@/components/media/ExternalImage';

const MEGA_CATEGORIES = [
  {
    name: 'Unstitched Luxury',
    slug: 'unstitched-luxury',
    subtitle: 'Pure Lawn, Chiffon & Jacquard 3-Piece',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
    tag: 'Heirloom',
  },
  {
    name: 'Ready to Wear Pret',
    slug: 'ready-to-wear-pret',
    subtitle: 'Modern Luxury Kurtas & Irish Linen Co-ords',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=600&auto=format&fit=crop',
    tag: 'Trending',
  },
  {
    name: 'Festive & Formals',
    slug: 'festive-formals',
    subtitle: 'Handcrafted Zardozi, Tilla & Raw Silk',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
    tag: 'Couture',
  },
  {
    name: 'Menswear Royal',
    slug: 'menswear-royal',
    subtitle: 'Egyptian Cotton Kurtas & Tailored Waistcoats',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
    tag: 'Signature',
  },
  {
    name: 'Pashmina & Shawls',
    slug: 'accessories-shawls',
    subtitle: '100% Himalayan Cashmere Heirlooms',
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=600&auto=format&fit=crop',
    tag: 'Pure Luxury',
  },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { customer, logout: logoutCustomer } = useCustomer();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const megaMenuTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (mobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [mobileMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleMouseEnterMega = () => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setMegaMenuOpen(true);
  };

  const handleMouseLeaveMega = () => {
    megaMenuTimeout.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 font-sans ${
      isScrolled 
        ? 'bg-white/98 shadow-md shadow-black/[0.03] border-b border-[#eae7e2]' 
        : 'bg-white border-b border-[#eae7e2]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-6">
          
          {/* Mobile Menu Trigger */}
          <div className="flex items-center lg:hidden shrink-0 relative z-20">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="w-11 h-11 rounded-xl bg-[#f7f5f2] hover:bg-[#eae7e2] active:bg-[#e4e0d8] border border-[#eae7e2] flex items-center justify-center text-[#141414] cursor-pointer touch-manipulation transition-colors shadow-2xs"
              aria-label="Open Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5 text-[#141414]" />
            </button>
          </div>

          {/* Luxury Typographic Brand Logo (Clean Two-Line Lockup with Generous Spacing) */}
          <div className="flex items-center gap-6 lg:gap-9 min-w-0">
            <Link href="/" className="flex flex-col group py-1 shrink-0 justify-center">
              <span className="font-display text-xl sm:text-2xl lg:text-[25px] font-bold tracking-[0.24em] uppercase text-[#141414] transition-colors duration-300 group-hover:text-[#b87414] leading-none">
                MFE BRAND
              </span>
              <span className="text-[7.5px] sm:text-[8.5px] tracking-[0.40em] font-sans font-medium text-[#b87414] uppercase mt-1 leading-none">
                HAUTE COUTURE • EST. 2026
              </span>
            </Link>

            {/* Desktop Navigation Links (Standardized 28px gaps, matching font-size & tracking) */}
            <nav className="hidden lg:flex items-center gap-7 text-[12px] font-semibold tracking-[0.14em] uppercase font-sans text-[#141414]">
              
              {/* Interactive Mega-Menu Trigger */}
              <div 
                className="relative py-7"
                onMouseEnter={handleMouseEnterMega}
                onMouseLeave={handleMouseLeaveMega}
              >
                <button 
                  className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    megaMenuOpen ? 'text-[#b87414]' : 'hover:text-[#b87414]'
                  }`}
                >
                  <span>Collections</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${megaMenuOpen ? 'rotate-180 text-[#b87414]' : 'text-[#6b6b6b]'}`} />
                </button>

                {/* Animated underline */}
                <span className={`absolute bottom-5 left-0 h-[2px] bg-[#b87414] transition-all duration-300 rounded-full ${
                  megaMenuOpen ? 'w-full' : 'w-0'
                }`} />
              </div>

              <Link 
                href="/products" 
                className={`relative py-7 transition-colors hover:text-[#b87414] ${
                  pathname === '/products' ? 'text-[#b87414] font-bold' : ''
                }`}
              >
                All Pieces
                {pathname === '/products' && (
                  <span className="absolute bottom-5 left-0 w-full h-[2px] bg-[#b87414] rounded-full" />
                )}
              </Link>

              <Link 
                href="/products?category=unstitched-luxury" 
                className="relative py-7 hover:text-[#b87414] transition-colors"
              >
                Unstitched
              </Link>

              <Link 
                href="/products?category=ready-to-wear-pret" 
                className="relative py-7 hover:text-[#b87414] transition-colors"
              >
                Pret
              </Link>

              <Link 
                href="/products?category=festive-formals" 
                className="relative py-7 hover:text-[#b87414] transition-colors"
              >
                Formals
              </Link>

              {/* Best Deals (Unified single gold/amber accent, no competing pink) */}
              <Link 
                href="/products?isBestDeal=true" 
                className={`relative py-7 inline-flex items-center gap-1.5 transition-colors ${
                  pathname === '/products?isBestDeal=true' ? 'text-[#b87414] font-bold' : 'hover:text-[#b87414]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#b87414]" />
                <span>Best Deals</span>
              </Link>

              <Link 
                href="/track-order" 
                className="relative py-7 inline-flex items-center gap-1.5 hover:text-[#b87414] text-[#6b6b6b] transition-colors"
              >
                <Truck className="w-3.5 h-3.5 text-[#b87414]" />
                <span>Tracking</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Icons & Search */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 relative z-20">
            
            {/* Search Trigger / Full Bar (Wider, 44px height matching other elements) */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search velvet, silk, pret..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 w-52 sm:w-80 lg:w-72 xl:w-80 pl-11 pr-10 text-xs bg-[#f7f5f2] border border-[#d99026] rounded-full focus:outline-none focus:ring-1 focus:ring-[#d99026] text-[#141414] placeholder-[#6b6b6b]"
                  />
                  <Search className="w-4 h-4 text-[#d99026] absolute left-4 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1.5 text-[#6b6b6b] hover:text-[#141414] absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="h-11 px-3 sm:px-3.5 rounded-full text-[#141414] hover:bg-[#f7f5f2] active:bg-[#eae7e2] transition-colors flex items-center gap-2 text-xs touch-manipulation cursor-pointer border border-transparent hover:border-[#eae7e2]"
                  aria-label="Search Collection"
                >
                  <Search className="w-[18px] h-[18px] text-[#141414]" />
                  <span className="hidden xl:inline text-[#6b6b6b] text-xs font-sans">Search collection...</span>
                </button>
              )}
            </div>

            {/* Right Action Icons Cluster (Consistent 16-20px spacing & equal visual weight) */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Compare Pill */}
              <Link
                href="/compare"
                className="hidden md:flex w-10 h-10 sm:w-11 sm:h-11 items-center justify-center rounded-full text-[#141414] hover:bg-[#f7f5f2] transition-colors"
                title="Compare Suits"
                aria-label="Compare Products"
              >
                <Layers className="w-5 h-5 text-[#141414]" />
              </Link>

              {/* Wishlist Icon with Refined Badge */}
              <Link
                href="/wishlist"
                className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-[#141414] hover:text-[#b87414] hover:bg-[#f7f5f2] active:bg-[#eae7e2] transition-colors touch-manipulation group"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 transition-transform group-hover:scale-108" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[17px] h-[17px] rounded-full bg-[#141414] text-white text-[9px] font-bold flex items-center justify-center px-1 shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag with Gold Badge */}
              <Link
                href="/cart"
                className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-[#141414] hover:text-[#b87414] hover:bg-[#f7f5f2] active:bg-[#eae7e2] transition-colors touch-manipulation group"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-108" />
                {mounted && itemCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[17px] h-[17px] rounded-full bg-[#b87414] text-white text-[9px] font-black flex items-center justify-center px-1 shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Customer Account Icon (No Admin button in storefront!) */}
              <Link
                href="/account"
                className="hidden sm:flex w-10 h-10 sm:w-11 sm:h-11 items-center justify-center rounded-full text-[#141414] hover:bg-[#f7f5f2] transition-colors"
                aria-label="My Account"
              >
                <User className="w-5 h-5" />
              </Link>
            </div>

          </div>

        </div>
      </div>

      {/* Floating Mega Menu */}
      {megaMenuOpen && (
        <div
          className="hidden lg:block absolute top-full left-0 w-full bg-white/98 backdrop-blur-2xl border-b border-[#eae7e2] shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-2"
          onMouseEnter={handleMouseEnterMega}
          onMouseLeave={handleMouseLeaveMega}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#eae7e2]">
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 text-[#b87414]" />
                <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#6b6b6b]">
                  Curated Haute Couture Collections 2026
                </span>
              </div>
              <Link 
                href="/products" 
                className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#b87414] hover:text-[#d99026] transition"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-5 gap-5">
              {MEGA_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#f7f5f2] border border-[#eae7e2] hover:border-[#b87414] hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-200">
                    <ExternalImage
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/90 text-[#141414] shadow-sm">
                      {cat.tag}
                    </span>
                  </div>

                  <div className="p-4 bg-white">
                    <h4 className="font-serif text-base font-bold text-[#141414] group-hover:text-[#b87414] transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-[11px] text-[#6b6b6b] line-clamp-1 mt-0.5 font-sans">
                      {cat.subtitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modern Luxury Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-300 cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative ml-auto w-full max-w-sm bg-[#faf8f5] h-full shadow-2xl border-l border-[#eae7e2] flex flex-col justify-between z-10 overflow-y-auto overscroll-contain animate-in slide-in-from-right duration-300"
          >
            <div className="p-6 space-y-6">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-[#eae7e2]">
                <Link 
                  href="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#141414] text-white flex items-center justify-center font-serif font-black text-sm shadow-md border border-[#b87414]/30">
                    MFE
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display text-base font-bold tracking-[0.2em] text-[#141414] uppercase leading-none">
                      MFE BRAND
                    </span>
                    <span className="text-[7.5px] tracking-[0.35em] font-sans font-semibold text-[#b87414] uppercase mt-1">
                      HAUTE COUTURE • EST. 2026
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-white hover:bg-[#eae7e2] active:bg-[#e4e0d8] text-[#6b6b6b] hover:text-[#141414] flex items-center justify-center cursor-pointer shadow-sm border border-[#eae7e2] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Customer Patron Status Card */}
              {customer ? (
                <div className="p-4 rounded-2xl bg-white border border-[#eae7e2] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b87414] to-[#d99026] text-white font-bold text-xs flex items-center justify-center shadow-inner">
                        {customer.full_name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#141414] block leading-tight">
                          {customer.full_name}
                        </span>
                        <span className="text-[10px] text-[#b87414] font-medium tracking-wider uppercase">
                          {customer.tier || 'VIP Patron'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await logoutCustomer();
                        setMobileMenuOpen(false);
                        router.push('/');
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 transition"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#eae7e2]/60 text-xs">
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2 px-3 rounded-xl bg-[#faf8f5] hover:bg-[#eae7e2] text-[#141414] font-semibold text-[11px] transition"
                    >
                      Patron Lounge
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2 px-3 rounded-xl bg-[#faf8f5] hover:bg-[#eae7e2] text-[#141414] font-semibold text-[11px] transition"
                    >
                      Consignments
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-[#f5f1ea] border border-[#e8dfd2] shadow-sm space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[#b87414] text-[10px] font-bold uppercase tracking-[0.2em]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>MFE Patron Atelier</span>
                  </div>
                  <p className="text-xs text-[#525252] leading-snug">
                    Access private couture previews, order tracking, and bespoke client services.
                  </p>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#141414] hover:bg-[#262626] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition"
                  >
                    <User className="w-3.5 h-3.5 text-[#b87414]" />
                    <span>Sign In / Join Atelier</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </Link>
                </div>
              )}

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search luxury suits, pret, lawn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#eae7e2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#b87414] text-[#141414] placeholder-[#6b6b6b] shadow-sm"
                />
                <Search className="w-4 h-4 text-[#b87414] absolute left-3 top-1/2 -translate-y-1/2" />
              </form>

              {/* Navigation List */}
              <nav className="space-y-4 font-sans">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8c827a] mb-2 px-1">
                    Couture Collections
                  </div>
                  <div className="space-y-1.5">
                    <Link
                      href="/products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#eae7e2] text-[#141414] hover:border-[#b87414]/40 hover:shadow-sm text-xs font-bold transition-all"
                    >
                      <span>All Collections</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#b87414]" />
                    </Link>

                    {MEGA_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/products?category=${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-white/70 hover:bg-white border border-[#eae7e2]/80 text-[#141414] hover:text-[#b87414] text-xs transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#b87414]/40" />
                          <span className="font-semibold">{cat.name}</span>
                        </div>
                        <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-[#faf8f5] text-[#b87414] border border-[#eae7e2] font-bold">
                          {cat.tag}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8c827a] mb-2 px-1">
                    Privileges & Services
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/products?isBestDeal=true"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/25 text-[#141414] text-xs font-bold flex flex-col gap-1 hover:shadow-sm transition"
                    >
                      <Sparkles className="w-4 h-4 text-[#b87414]" />
                      <span>Best Deals</span>
                      <span className="text-[10px] text-[#b87414] font-medium">Limited Promos</span>
                    </Link>

                    <Link
                      href="/track-order"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-3 rounded-2xl bg-white border border-[#eae7e2] text-[#141414] text-xs font-bold flex flex-col gap-1 hover:shadow-sm transition"
                    >
                      <Truck className="w-4 h-4 text-[#b87414]" />
                      <span>Track Order</span>
                      <span className="text-[10px] text-neutral-500 font-medium">Live Status</span>
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-3 rounded-2xl bg-white border border-[#eae7e2] text-[#141414] text-xs font-bold flex flex-col gap-1 hover:shadow-sm transition"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Wishlist</span>
                      <span className="text-[10px] text-neutral-500 font-medium">
                        {mounted ? `${wishlistCount} Saved` : '0 Saved'}
                      </span>
                    </Link>

                    <Link
                      href="/compare"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-3 rounded-2xl bg-white border border-[#eae7e2] text-[#141414] text-xs font-bold flex flex-col gap-1 hover:shadow-sm transition"
                    >
                      <Layers className="w-4 h-4 text-neutral-600" />
                      <span>Compare</span>
                      <span className="text-[10px] text-neutral-500 font-medium">Side by Side</span>
                    </Link>
                  </div>
                </div>
              </nav>
            </div>

            {/* Bottom Concierge Card */}
            <div className="p-6 bg-white border-t border-[#eae7e2] space-y-3">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 text-center font-bold text-xs uppercase tracking-wider rounded-2xl bg-[#141414] hover:bg-[#262626] text-white shadow-md flex items-center justify-center gap-2 transition"
              >
                <span>Concierge: +92 300 1234567</span>
              </a>
              <p className="text-[9.5px] text-[#8c827a] text-center tracking-[0.2em] uppercase font-sans">
                MFE Atelier Lahore • Karachi • Islamabad
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
