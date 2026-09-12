import React from 'react';
import Link from 'next/link';
import { ProductRepository } from '@/repositories/product.repository';
import { ProductCard } from '@/components/storefront/ProductCard';
import { SlidersHorizontal, ArrowUpDown, X, Sparkles, Compass } from 'lucide-react';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';
    isBestDeal?: string;
    isNewArrival?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const categorySlug = params.category;
  const brandSlug = params.brand;
  const search = params.search;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sortBy = params.sortBy || 'newest';
  const isBestDeal = params.isBestDeal === 'true';
  const isNewArrival = params.isNewArrival === 'true';

  const [{ products, total }, categories, brands] = await Promise.all([
    ProductRepository.getProducts({
      categorySlug,
      brandSlug,
      search,
      minPrice,
      maxPrice,
      sortBy,
      isBestDeal,
      isNewArrival,
    }),
    ProductRepository.getCategories(),
    ProductRepository.getBrands(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans bg-white text-[#141414]">
      
      {/* Editorial Breadcrumbs & Page Title */}
      <div className="mb-10 border-b border-[#eae7e2] pb-8">
        <nav className="text-xs font-sans font-medium text-[#6b6b6b] mb-3 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b87414] transition">Atelier Home</Link>
          <span className="text-neutral-400">/</span>
          <span className="text-[#141414]">Catalog</span>
          {categorySlug && (
            <>
              <span className="text-neutral-400">/</span>
              <span className="text-[#b87414] uppercase tracking-wider font-bold">{categorySlug.replace('-', ' ')}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#b87414] mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Haute Couture Collection Catalog</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414]">
              {search ? `Search: "${search}"` : categorySlug ? categorySlug.replace('-', ' ').toUpperCase() : 'All Collections & Pret'}
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#6b6b6b] mt-2">
              Displaying {products.length} of {total} handcrafted luxury silhouettes and heirloom designs
            </p>
          </div>

          {/* Sort Dropdown */}
          <form method="GET" className="flex items-center gap-3">
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {brandSlug && <input type="hidden" name="brand" value={brandSlug} />}
            {search && <input type="hidden" name="search" value={search} />}
            
            <div className="relative flex items-center">
              <span className="text-xs font-bold text-[#6b6b6b] mr-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#d99026]" />
                <span>Sort:</span>
              </span>
              <select
                name="sortBy"
                defaultValue={sortBy}
                className="bg-[#f7f5f2] border border-[#eae7e2] rounded-full text-xs font-semibold px-4 py-2 text-[#141414] outline-none focus:border-[#d99026] cursor-pointer shadow-sm"
              >
                <option value="newest">New Season Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Artisan Rating</option>
              </select>
            </div>
            <button 
              type="submit" 
              className="text-xs bg-[#141414] hover:bg-[#262626] text-white px-5 py-2 rounded-full font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Horizontal Category Filter Pills for Instant Switching */}
        <div className="flex items-center gap-2.5 overflow-x-auto pt-6 pb-2 no-scrollbar">
          <Link
            href="/products"
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0 transition ${
              !categorySlug && !isBestDeal && !isNewArrival
                ? 'bg-[#d99026] text-[#141414] font-bold shadow-sm'
                : 'bg-[#f7f5f2] text-[#141414] hover:border-[#d99026] border border-[#eae7e2]'
            }`}
          >
            All Pieces
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0 transition ${
                categorySlug === cat.slug
                  ? 'bg-[#d99026] text-[#141414] font-bold shadow-sm'
                  : 'bg-[#f7f5f2] text-[#141414] hover:border-[#d99026] border border-[#eae7e2]'
              }`}
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/products?isBestDeal=true"
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 transition flex items-center gap-1.5 ${
              isBestDeal
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-rose-500" />
            <span>Best Deals</span>
          </Link>
        </div>

        {/* Active Filter Badges */}
        {(categorySlug || brandSlug || search || isBestDeal || isNewArrival) && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[#eae7e2]">
            <span className="text-xs text-[#6b6b6b] font-medium">Applied Filters:</span>
            {categorySlug && (
              <span className="inline-flex items-center gap-1.5 bg-[#d99026]/10 text-[#b87414] text-xs px-3 py-1 rounded-full border border-[#d99026]/30 font-medium">
                Category: {categorySlug}
                <Link href="/products" className="hover:text-black"><X className="w-3 h-3" /></Link>
              </span>
            )}
            {brandSlug && (
              <span className="inline-flex items-center gap-1.5 bg-[#d99026]/10 text-[#b87414] text-xs px-3 py-1 rounded-full border border-[#d99026]/30 font-medium">
                Brand: {brandSlug}
                <Link href="/products" className="hover:text-black"><X className="w-3 h-3" /></Link>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1.5 bg-[#f7f5f2] text-[#141414] text-xs px-3 py-1 rounded-full font-medium border border-[#eae7e2]">
                "{search}"
                <Link href="/products" className="hover:text-rose-600"><X className="w-3 h-3" /></Link>
              </span>
            )}
            <Link href="/products" className="text-xs text-rose-600 font-bold hover:underline ml-2 uppercase tracking-wider">
              Clear All
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Left Filter Sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-[#f7f5f2] border border-[#eae7e2] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 font-serif font-bold text-lg text-[#141414] border-b border-[#eae7e2] pb-3">
              <SlidersHorizontal className="w-4 h-4 text-[#d99026]" />
              <span>Refine Pieces</span>
            </div>

            {/* Categories List */}
            <div>
              <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#6b6b6b] mb-3">
                Couture Categories
              </h3>
              <ul className="space-y-2 text-xs font-medium font-sans">
                <li>
                  <Link
                    href="/products"
                    className={`block py-1 hover:text-[#b87414] transition ${!categorySlug ? 'text-[#b87414] font-bold' : 'text-[#141414]'}`}
                  >
                    All Categories
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}${brandSlug ? `&brand=${brandSlug}` : ''}`}
                      className={`block py-1 hover:text-[#b87414] transition ${categorySlug === cat.slug ? 'text-[#b87414] font-bold' : 'text-[#141414]'}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Brands List */}
            <div className="border-t border-[#eae7e2] pt-4">
              <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#6b6b6b] mb-3">
                Artisan Labels
              </h3>
              <ul className="space-y-2 text-xs font-medium font-sans">
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <Link
                      href={`/products?brand=${brand.slug}${categorySlug ? `&category=${categorySlug}` : ''}`}
                      className={`block py-1 hover:text-[#b87414] transition ${brandSlug === brand.slug ? 'text-[#b87414] font-bold' : 'text-[#141414]'}`}
                    >
                      {brand.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range Filter Form */}
            <div className="border-t border-[#eae7e2] pt-4">
              <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#6b6b6b] mb-3">
                Price Range (PKR)
              </h3>
              <form method="GET" className="space-y-3 font-sans">
                {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                {brandSlug && <input type="hidden" name="brand" value={brandSlug} />}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min ₨"
                    defaultValue={minPrice}
                    className="w-full text-xs p-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] placeholder-[#6b6b6b] focus:outline-none focus:border-[#d99026]"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max ₨"
                    defaultValue={maxPrice}
                    className="w-full text-xs p-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] placeholder-[#6b6b6b] focus:outline-none focus:border-[#d99026]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-xs bg-[#141414] hover:bg-[#262626] text-white font-bold py-3 rounded-xl uppercase tracking-wider transition cursor-pointer"
                >
                  Apply Filter
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Product Grid Area (2 Cols on mobile, 3 Cols on desktop) */}
        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="text-center py-20 bg-[#f7f5f2] border border-[#eae7e2] rounded-3xl p-10 shadow-sm">
              <Compass className="w-12 h-12 text-[#b87414] mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-bold text-[#141414]">No Creations Found</h2>
              <p className="text-xs text-[#6b6b6b] mt-2 max-w-sm mx-auto">
                No luxury pieces matched your specified filters. Try selecting another category or clear your search criteria.
              </p>
              <div className="mt-6">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-[#d99026] hover:bg-[#c67d18] text-[#141414] font-bold text-xs uppercase tracking-wider px-7 py-3 rounded-full shadow-md"
                >
                  Reset Catalog Filters
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
