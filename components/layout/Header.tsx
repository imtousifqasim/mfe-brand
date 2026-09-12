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
  Compass
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
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
        ? 'bg-white/98 shadow-md shadow-black/[0.04] border-b border-[#eae7e2]' 
        : 'bg-white border-b border-[#eae7e2]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
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

          {/* Luxury Typographic Brand Logo */}
          <div className="flex items-center gap-6 lg:gap-10 min-w-0">
            <Link href="/" className="flex flex-col group py-1 min-w-0">
              <span className="font-display text-lg sm:text-2xl lg:text-3xl font-bold tracking-[0.14em] sm:tracking-[0.22em] uppercase text-[#141414] transition-all duration-300 group-hover:text-[#b87414] truncate">
                MFE BRAND
              </span>
              <span className="text-[7.5px] sm:text-[8px] tracking-[0.32em] sm:tracking-[0.45em] font-sans font-bold text-[#b87414] uppercase -mt-0.5">
                Haute Couture • Est. 2026
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 text-[12px] font-semibold tracking-[0.14em] uppercase font-sans text-[#141414]">
              
              {/* Interactive Mega-Menu Trigger */}
              <div 
                className="relative py-7"
                onMouseEnter={handleMouseEnterMega}
                onMouseLeave={handleMouseLeaveMega}
              >
                <button 
                  className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    megaMenuOpen ? 'text-[#d99026]' : 'hover:text-[#d99026]'
                  }`}
                >
                  <span>Collections</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${megaMenuOpen ? 'rotate-180 text-[#d99026]' : 'text-[#6b6b6b]'}`} />
                </button>

                {/* Animated underline */}
                <span className={`absolute bottom-5 left-0 h-[2px] bg-[#d99026] transition-all duration-300 rounded-full ${
                  megaMenuOpen ? 'w-full' : 'w-0'
                }`} />
              </div>

              <Link 
                href="/products" 
                className={`relative py-7 transition hover:text-[#d99026] ${
                  pathname === '/products' ? 'text-[#d99026] font-bold' : ''
                }`}
              >
                All Pieces
                {pathname === '/products' && (
                  <span className="absolute bottom-5 left-0 w-full h-[2px] bg-[#d99026] rounded-full" />
                )}
              </Link>

              <Link 
                href="/products?category=unstitched-luxury" 
                className="relative py-7 hover:text-[#d99026] transition"
              >
                Unstitched
              </Link>

              <Link 
                href="/products?category=ready-to-wear-pret" 
                className="relative py-7 hover:text-[#d99026] transition"
              >
                Pret
              </Link>

              <Link 
                href="/products?category=festive-formals" 
                className="relative py-7 hover:text-[#d99026] transition"
              >
                Formals
              </Link>

              <Link 
                href="/products?isBestDeal=true" 
                className="relative py-7 inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Best Deals</span>
              </Link>

              <Link 
                href="/track-order" 
                className="relative py-7 inline-flex items-center gap-1.5 text-[#6b6b6b] hover:text-[#141414] text-xs font-normal"
              >
                <Truck className="w-3.5 h-3.5 text-[#d99026]" />
                <span>Tracking</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Icons & Search */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 relative z-20">
            
            {/* Search Trigger / Bar */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search velvet, silk, pret..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 sm:w-72 pl-9 pr-8 py-2 text-xs bg-[#f7f5f2] border border-[#d99026] rounded-full focus:outline-none focus:ring-1 focus:ring-[#d99026] text-[#141414] placeholder-[#6b6b6b]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#d99026] absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1 text-[#6b6b6b] hover:text-[#141414] absolute right-2.5 top-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 sm:p-2.5 rounded-full text-[#141414] hover:bg-[#f7f5f2] active:bg-[#eae7e2] transition flex items-center gap-2 text-xs touch-manipulation cursor-pointer"
                  aria-label="Search Collection"
                >
                  <Search className="w-4 h-4 text-[#141414]" />
                  <span className="hidden xl:inline text-[#6b6b6b] text-xs font-sans">Search collection...</span>
                </button>
              )}
            </div>

            {/* Compare Pill */}
            <Link
              href="/compare"
              className="hidden md:inline-flex p-2.5 rounded-full text-[#141414] hover:bg-[#f7f5f2] transition"
              title="Compare Suits"
            >
              <Layers className="w-4 h-4" />
            </Link>

            {/* Wishlist Icon with Glowing Badge */}
            <Link
              href="/wishlist"
              className="relative p-2 sm:p-2.5 rounded-full text-[#141414] hover:text-rose-600 hover:bg-[#f7f5f2] active:bg-[#eae7e2] transition touch-manipulation group"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 transition-transform group-hover:scale-110" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[17px] h-[17px] rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Bag with Gold Badge */}
            <Link
              href="/cart"
              className="relative p-2 sm:p-2.5 rounded-full text-[#141414] hover:text-[#b87414] hover:bg-[#f7f5f2] active:bg-[#eae7e2] transition touch-manipulation group"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
              {mounted && itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[17px] h-[17px] rounded-full bg-[#d99026] text-[#141414] text-[9px] font-black flex items-center justify-center px-1 shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Customer Account Icon (available in mobile drawer too) */}
            <Link
              href="/account"
              className="hidden sm:inline-flex p-2.5 rounded-full text-[#141414] hover:bg-[#f7f5f2] transition"
              aria-label="My Account"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Admin Console Shortcut */}
            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#141414] hover:bg-[#262626] text-white shadow-sm transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Admin</span>
            </Link>
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
                <Compass className="w-4 h-4 text-[#d99026]" />
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
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#f7f5f2] border border-[#eae7e2] hover:border-[#d99026] hover:shadow-xl transition-all duration-300"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl border-l border-[#eae7e2] flex flex-col justify-between p-6 z-10 overflow-y-auto overscroll-contain animate-in slide-in-from-right duration-300"
          >
            <div className="space-y-6">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-[#eae7e2]">
                <span className="font-display text-lg font-bold tracking-wider text-[#141414] uppercase">
                  MFE BRAND
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-[#f7f5f2] hover:bg-[#eae7e2] active:bg-[#e4e0d8] text-[#6b6b6b] hover:text-[#141414] flex items-center justify-center cursor-pointer touch-manipulation transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search luxury suits, pret..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#f7f5f2] border border-[#eae7e2] rounded-full focus:outline-none focus:ring-1 focus:ring-[#d99026] text-[#141414] placeholder-[#6b6b6b]"
                />
                <Search className="w-3.5 h-3.5 text-[#d99026] absolute left-3 top-3.5" />
              </form>

              {/* Navigation List */}
              <nav className="flex flex-col space-y-2 font-sans text-sm font-medium">
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl text-[#141414] hover:bg-[#f7f5f2] hover:text-[#b87414] transition"
                >
                  <span>All Collections</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#6b6b6b]" />
                </Link>

                <div className="pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#6b6b6b]">
                  Haute Categories
                </div>

                {MEGA_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/products?category=${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl text-[#141414] hover:bg-[#f7f5f2] hover:text-[#b87414] text-xs transition"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-[#f7f5f2] text-[#b87414] border border-[#eae7e2] font-semibold">
                      {cat.tag}
                    </span>
                  </Link>
                ))}

                <div className="pt-4 border-t border-[#eae7e2] space-y-1.5">
                  <Link
                    href="/products?isBestDeal=true"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-rose-600 font-semibold text-xs p-2 rounded-xl hover:bg-rose-50 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Best Deals & Specials</span>
                  </Link>
                  <Link
                    href="/track-order"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-[#141414] text-xs p-2 rounded-xl hover:bg-[#f7f5f2] transition"
                  >
                    <Truck className="w-3.5 h-3.5 text-[#d99026]" />
                    <span>Track Your Order</span>
                  </Link>
                  <Link
                    href="/compare"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-[#141414] text-xs p-2 rounded-xl hover:bg-[#f7f5f2] transition"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#6b6b6b]" />
                    <span>Compare Products</span>
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-[#141414] text-xs p-2 rounded-xl hover:bg-[#f7f5f2] transition"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>My Wishlist ({mounted ? wishlistCount : 0})</span>
                  </Link>
                </div>
              </nav>
            </div>

            {/* Bottom Drawer info */}
            <div className="pt-6 border-t border-[#eae7e2] text-xs space-y-3">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 text-center font-bold text-xs uppercase tracking-wider rounded-xl bg-[#141414] hover:bg-[#262626] text-white shadow-md flex items-center justify-center gap-2 transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Admin Dashboard</span>
              </Link>
              <p className="text-[11px] text-[#6b6b6b] text-center">
                Concierge WhatsApp: +92 300 1234567
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
