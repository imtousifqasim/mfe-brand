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
  Loader2,
  Tag
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useCustomer } from '@/components/providers/CustomerProvider';
import { ExternalImage } from '@/components/media/ExternalImage';

const MEGA_CATEGORIES = [
  {
    name: "Women's Suits",
    slug: 'womens-unstitched-stitched-suits',
    subtitle: 'Organza Sequins & Stitched Lawn Pret',
    image: 'https://i.postimg.cc/8Tj1P085/Whats-App-Image-2026-09-19-at-10-02-48-PM.jpg',
    tag: 'Suits',
  },
  {
    name: "Women's Nightwear",
    slug: 'womens-nightwear-loungewear',
    subtitle: 'Soft Combed Jersey Loungewear Sets',
    image: 'https://i.postimg.cc/zz5wrWL3/Whats-App-Image-2026-09-19-at-11-33-05-PM.jpg',
    tag: 'Loungewear',
  },
  {
    name: "Men's Clothing",
    slug: 'mens-clothing',
    subtitle: 'Casual Full-Zip Winter Bomber Jackets',
    image: 'https://i.postimg.cc/nZ9VJ5JK/Whats-App-Image-2026-09-19-at-11-13-37-PM.jpg',
    tag: 'Outerwear',
  },
  {
    name: "Men's Wallets",
    slug: 'mens-accessories-wallets',
    subtitle: 'Continental Long & Checkered Bifolds',
    image: 'https://i.postimg.cc/Zm2ZVcdY/Whats-App-Image-2026-09-19-at-11-16-46-PM-(1).jpg',
    tag: 'Wallets',
  },
  {
    name: "Women's Bags",
    slug: 'womens-accessories-bags',
    subtitle: 'Minimalist Vegan Leather Shoulder Bags',
    image: 'https://i.postimg.cc/JmVvsdX5/Whats-App-Image-2026-09-19-at-11-32-39-PM.jpg',
    tag: 'Bags',
  },
  {
    name: "Winter Wear / Shawls",
    slug: 'winter-wear-shawls',
    subtitle: 'Pure Warm Wool 3-Yard Shawls',
    image: 'https://i.postimg.cc/hcgG1rkr/Whats-App-Image-2026-09-19-at-11-42-49-PM.jpg',
    tag: 'Shawls',
  },
  {
    name: "Bath & Personal Care",
    slug: 'bath-personal-care',
    subtitle: 'Silicone Baby Brushes & Body Scrubbers',
    image: 'https://i.postimg.cc/2z99j0DD/Whats-App-Image-2026-09-19-at-10-34-14-PM.jpg',
    tag: 'Bath Care',
  },
  {
    name: "Home & Living",
    slug: 'home-living',
    subtitle: 'Quilted AC & Mattress Protectors',
    image: 'https://i.postimg.cc/fz2Vr0mq/Whats-App-Image-2026-09-19-at-10-59-54-PM.jpg',
    tag: 'Home',
  },
  {
    name: "Health & Wellness",
    slug: 'health-fitness-wellness',
    subtitle: 'Adjustable Posture Support Braces',
    image: 'https://i.postimg.cc/8Dx5fGHB/Whats-App-Image-2026-09-19-at-11-06-08-PM.jpg',
    tag: 'Wellness',
  },
  {
    name: "Fragrance & Perfumes",
    slug: 'fragrance-perfumes',
    subtitle: 'Citrus & Woody Long-Lasting Men EDPs',
    image: 'https://i.postimg.cc/VfYs1Lzt/Whats-App-Image-2026-09-19-at-10-48-33-PM.jpg',
    tag: 'Fragrance',
  },
  {
    name: "Luxury Watches",
    slug: 'luxury-watches',
    subtitle: 'Rhinestone Quartz Chain Timepieces',
    image: 'https://i.postimg.cc/TG87RLrM/Whats-App-Image-2026-09-22-at-10-33-57-PM.jpg',
    tag: 'Watches',
  },
];

const TRENDING_SEARCHES = [
  'Teal Majestique',
  'Pink Organza Suit',
  'Winter Jacket',
  'Leather Wallet',
  'Citrus Woody Perfume',
  'Wool Shawl',
  'Double Bed Mattress Cover',
];

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  regular_price: number;
  sale_price?: number | null;
  image: string | null;
  category: string | null;
  category_slug?: string | null;
  stock_status: string;
  is_best_deal: boolean;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount, openCartDrawer } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { customer, logout: logoutCustomer } = useCustomer();

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const megaMenuTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    setSearchFocused(false);
    setSearchQuery('');
  }, [pathname]);

  // Handle outside clicks for search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Real-time live product search with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(searchQuery.trim())}&limit=6`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
          setTotalResults(data.total || 0);
        } else {
          setSearchResults([]);
          setTotalResults(0);
        }
      } catch (err) {
        console.error('Failed to search products:', err);
        setSearchResults([]);
        setTotalResults(0);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
      setMobileMenuOpen(false);
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
        ? 'bg-white/98 backdrop-blur-md shadow-md shadow-black/[0.03] border-b border-[#eae7e2]' 
        : 'bg-white border-b border-[#eae7e2]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 gap-3 sm:gap-6">
          
          {/* Mobile Menu Trigger */}
          <div className="flex items-center lg:hidden shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 rounded-xl bg-[#f7f5f2] hover:bg-[#eae7e2] active:bg-[#e4e0d8] border border-[#eae7e2] flex items-center justify-center text-[#141414] cursor-pointer touch-manipulation transition-colors shadow-2xs"
              aria-label="Open Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5 text-[#141414]" />
            </button>
          </div>

          {/* Logo & Reduced Focused Navigation Links */}
          <div className="flex items-center gap-5 xl:gap-8 min-w-0">
            <Link href="/" className="flex items-center group py-1 shrink-0">
              <img
                src="/logo.png"
                alt="MFE BRAND"
                className="h-14 sm:h-16 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-xs"
              />
            </Link>

            {/* Reduced, clean navigation menus (NO OVERLAP) */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-[12px] font-semibold tracking-[0.12em] uppercase font-sans text-[#141414]">
              {/* Mega-Menu Trigger */}
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

                <span className={`absolute bottom-5 left-0 h-[2px] bg-[#b87414] transition-all duration-300 rounded-full ${
                  megaMenuOpen ? 'w-full' : 'w-0'
                }`} />
              </div>

              <Link 
                href="/category/womens-unstitched-stitched-suits" 
                className={`relative py-7 transition-colors hover:text-[#b87414] whitespace-nowrap ${
                  pathname.includes('womens-unstitched-stitched-suits') ? 'text-[#b87414] font-bold' : ''
                }`}
              >
                Women's Suits
              </Link>

              <Link 
                href="/category/winter-wear-shawls" 
                className={`relative py-7 transition-colors hover:text-[#b87414] whitespace-nowrap ${
                  pathname.includes('winter-wear-shawls') ? 'text-[#b87414] font-bold' : ''
                }`}
              >
                Winter Shawls
              </Link>

              <Link 
                href="/category/mens-clothing" 
                className={`relative py-7 transition-colors hover:text-[#b87414] whitespace-nowrap ${
                  pathname.includes('mens-clothing') ? 'text-[#b87414] font-bold' : ''
                }`}
              >
                Men's Wear
              </Link>

              <Link 
                href="/products?isBestDeal=true" 
                className={`relative py-7 inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
                  pathname === '/products?isBestDeal=true' ? 'text-[#b87414] font-bold' : 'hover:text-[#b87414]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#b87414]" />
                <span>Deals</span>
              </Link>
            </nav>
          </div>

          {/* Prominent, Large Live Search Bar Directly in Header */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search velvet, lawn, pret, silk..."
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                className={`w-full h-11 pl-11 pr-9 text-xs rounded-full bg-[#f7f5f2] border transition-all duration-200 outline-none shadow-inner text-[#141414] placeholder-[#8c827a] ${
                  searchFocused 
                    ? 'border-[#b87414] bg-white ring-2 ring-[#b87414]/15 shadow-sm' 
                    : 'border-[#eae7e2] hover:border-[#d4cfc7]'
                }`}
              />
              <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                searchFocused ? 'text-[#b87414]' : 'text-[#8c827a]'
              }`} />
              
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 text-[#8c827a] hover:text-[#141414] absolute right-3.5 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* REAL-TIME INSTANT SEARCH RESULTS DROPDOWN */}
            {searchFocused && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#eae7e2] shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="max-h-[380px] overflow-y-auto overscroll-contain">
                  
                  {/* Loading Spinner */}
                  {isSearching && (
                    <div className="p-8 text-center space-y-2">
                      <Loader2 className="w-5 h-5 text-[#b87414] animate-spin mx-auto" />
                      <p className="text-xs text-[#6b6b6b] font-medium">
                        Searching couture archive...
                      </p>
                    </div>
                  )}

                  {/* Matching Results */}
                  {!isSearching && searchQuery.trim() && searchResults.length > 0 && (
                    <div className="p-2 space-y-1">
                      <div className="px-3 py-1.5 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[#8c827a] border-b border-[#eae7e2]/60">
                        <span>Matching Pieces ({searchResults.length})</span>
                        <span>Instant Preview</span>
                      </div>

                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          onClick={() => setSearchFocused(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f7f5f2] transition group border border-transparent hover:border-[#eae7e2]"
                        >
                          <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-[#eae7e2]">
                            <ExternalImage
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="56px"
                              quality={95}
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-[#141414] group-hover:text-[#b87414] transition-colors truncate">
                              {product.name}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-0.5">
                              {product.category && (
                                <span className="text-[10px] text-[#8c827a] uppercase tracking-wider font-medium truncate">
                                  {product.category}
                                </span>
                              )}
                              {product.is_best_deal && (
                                <span className="text-[9px] font-bold text-[#b87414] uppercase tracking-wider">
                                  • Deal
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              {product.sale_price ? (
                                <>
                                  <span className="font-bold text-xs text-[#b87414]">
                                    PKR {product.sale_price.toLocaleString()}
                                  </span>
                                  <span className="line-through text-[10px] text-neutral-400">
                                    PKR {product.regular_price.toLocaleString()}
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold text-xs text-[#141414]">
                                  PKR {product.regular_price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#b87414] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* No Results State */}
                  {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
                    <div className="p-8 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 text-[#b87414] flex items-center justify-center mx-auto">
                        <Search className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-xs text-[#141414]">
                        No pieces found for &ldquo;{searchQuery}&rdquo;
                      </h4>
                      <p className="text-[11px] text-[#6b6b6b] max-w-xs mx-auto">
                        Try searching for velvet, lawn, pret, or explore all couture collections.
                      </p>
                    </div>
                  )}

                  {/* Default State: Popular Suggestions */}
                  {!isSearching && !searchQuery.trim() && (
                    <div className="p-4 space-y-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#8c827a] mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-[#b87414]" />
                          <span>Popular Searches</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {TRENDING_SEARCHES.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                setSearchQuery(tag);
                                searchInputRef.current?.focus();
                              }}
                              className="text-[11px] font-medium px-3 py-1 rounded-full bg-[#f7f5f2] hover:bg-[#eae7e2] text-[#141414] border border-[#eae7e2] transition cursor-pointer"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#eae7e2]">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#8c827a] mb-2 flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-[#b87414]" />
                          <span>Quick Categories</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {MEGA_CATEGORIES.slice(0, 4).map((cat) => (
                            <Link
                              key={cat.slug}
                              href={`/category/${cat.slug}`}
                              onClick={() => setSearchFocused(false)}
                              className="p-2 rounded-xl bg-[#faf8f5] hover:bg-[#eae7e2] text-[#141414] font-medium flex items-center justify-between transition"
                            >
                              <span className="truncate">{cat.name}</span>
                              <ArrowRight className="w-3 h-3 text-neutral-400" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom View All */}
                {searchQuery.trim() && searchResults.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 px-4 bg-[#faf8f5] hover:bg-[#f2efe9] text-[#b87414] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-t border-[#eae7e2] transition cursor-pointer"
                  >
                    <span>View all {totalResults > searchResults.length ? totalResults : searchResults.length} pieces</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons (Slide-over Cart Drawer Trigger) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-[#141414] hover:bg-[#f7f5f2] transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-[#141414]" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#141414] hover:text-[#b87414] hover:bg-[#f7f5f2] active:bg-[#eae7e2] transition-colors touch-manipulation group"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 transition-transform group-hover:scale-108" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[17px] h-[17px] rounded-full bg-[#141414] text-white text-[9px] font-bold flex items-center justify-center px-1 shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Bag / Cart Drawer Button with Dynamic Badge Count */}
            <button
              type="button"
              onClick={openCartDrawer}
              className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#141414] hover:text-[#b87414] hover:bg-[#f7f5f2] active:bg-[#eae7e2] transition-colors touch-manipulation group cursor-pointer"
              aria-label="Shopping Bag"
              title="Open Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-108" />
              {mounted && itemCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[17px] h-[17px] rounded-full bg-[#b87414] text-white text-[9px] font-black flex items-center justify-center px-1 shadow-sm animate-in zoom-in-50 duration-200">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Customer Account Icon */}
            <Link
              href="/account"
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full text-[#141414] hover:bg-[#f7f5f2] transition-colors"
              aria-label="My Account"
            >
              <User className="w-5 h-5" />
            </Link>

          </div>

        </div>
      </div>

      {/* Floating Mega Menu */}
      {megaMenuOpen && (
        <div
          className="hidden lg:block absolute top-full left-0 w-full bg-white/98 backdrop-blur-2xl border-b border-[#eae7e2] shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-2 z-40"
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
                  href={`/category/${cat.slug}`}
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

      {/* Luxury Mobile Slide-Over Drawer with Real-Time Search */}
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
            <div className="p-5 sm:p-6 space-y-5">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-[#eae7e2]">
                <Link 
                  href="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center group"
                >
                  <img
                    src="/logo.png"
                    alt="MFE BRAND"
                    className="h-16 sm:h-20 w-auto object-contain drop-shadow-xs"
                  />
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

              {/* Mobile Real-Time Live Search */}
              <div className="space-y-2">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search luxury suits, pret, lawn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 text-xs bg-white border border-[#eae7e2] focus:border-[#b87414] focus:ring-1 focus:ring-[#b87414] rounded-xl text-[#141414] placeholder-[#8c827a] shadow-sm outline-none"
                  />
                  <Search className="w-4 h-4 text-[#b87414] absolute left-3 top-1/2 -translate-y-1/2" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-[#8c827a] hover:text-[#141414] absolute right-2.5 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>

                {/* Mobile Search Results Preview */}
                {searchQuery.trim() && (
                  <div className="bg-white rounded-xl border border-[#eae7e2] shadow-md max-h-60 overflow-y-auto p-2 divide-y divide-[#eae7e2]/60">
                    {isSearching ? (
                      <div className="p-4 text-center">
                        <Loader2 className="w-5 h-5 text-[#b87414] animate-spin mx-auto" />
                        <span className="text-[11px] text-[#6b6b6b] mt-1 block">Searching...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        {searchResults.slice(0, 4).map((item) => (
                          <Link
                            key={item.id}
                            href={`/products/${item.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 py-2 px-1 hover:bg-[#faf8f5] transition"
                          >
                            <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-[#eae7e2]">
                              <ExternalImage src={item.image} alt={item.name} fill sizes="48px" quality={95} className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#141414] truncate">{item.name}</p>
                              <span className="text-[11px] font-bold text-[#b87414]">
                                PKR {(item.sale_price || item.regular_price).toLocaleString()}
                              </span>
                            </div>
                          </Link>
                        ))}
                        <button
                          type="button"
                          onClick={handleSearchSubmit}
                          className="w-full pt-2 text-center text-[11px] font-bold uppercase text-[#b87414] flex items-center justify-center gap-1"
                        >
                          <span>View all results</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="p-3 text-center text-xs text-[#6b6b6b]">
                        No matching couture pieces found.
                      </div>
                    )}
                  </div>
                )}
              </div>

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
                        href={`/category/${cat.slug}`}
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

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openCartDrawer();
                      }}
                      className="p-3 rounded-2xl bg-white border border-[#eae7e2] text-[#141414] text-xs font-bold flex flex-col gap-1 hover:shadow-sm transition text-left"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#b87414]" />
                      <span>View Bag</span>
                      <span className="text-[10px] text-neutral-500 font-medium">{itemCount} items</span>
                    </button>

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
                      href="/track-order"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-3 rounded-2xl bg-white border border-[#eae7e2] text-[#141414] text-xs font-bold flex flex-col gap-1 hover:shadow-sm transition"
                    >
                      <Truck className="w-4 h-4 text-[#b87414]" />
                      <span>Track Order</span>
                      <span className="text-[10px] text-neutral-500 font-medium">Live Status</span>
                    </Link>
                  </div>
                </div>
              </nav>
            </div>

            {/* Bottom Concierge Card */}
            <div className="p-6 bg-white border-t border-[#eae7e2] space-y-3">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 text-center font-bold text-xs uppercase tracking-wider rounded-2xl bg-[#141414] hover:bg-[#262626] text-white shadow-md flex items-center justify-center gap-2 transition"
              >
                <User className="w-4 h-4 text-[#b87414]" />
                <span>My Patron Account</span>
              </Link>
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
