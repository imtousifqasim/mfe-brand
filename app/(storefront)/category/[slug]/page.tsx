import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductRepository } from '@/repositories/product.repository';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Compass, ArrowUpDown, ChevronRight, Sparkles } from 'lucide-react';
import { resolveHighResImageUrl } from '@/lib/image-resolver';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';
  }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await ProductRepository.getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return {
      title: 'Category Not Found | MFE BRAND',
      description: 'The requested luxury collection could not be located.',
    };
  }

  const categoryName = category.name;
  const categoryDesc =
    category.description ||
    `Explore MFE BRAND's exclusive ${categoryName} collection. Discover master-tailored Pakistani unstitched suits, festive formals, and artisan couture with white-glove nationwide express delivery.`;
  const canonicalUrl = `https://mfe-brand.com/category/${category.slug}`;
  const ogImage = resolveHighResImageUrl(category.image_url) || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop';

  return {
    title: `${categoryName} Collection`,
    description: categoryDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${categoryName} Collection | MFE BRAND`,
      description: categoryDesc,
      url: canonicalUrl,
      siteName: 'MFE BRAND',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${categoryName} - MFE BRAND`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} Collection | MFE BRAND`,
      description: categoryDesc,
      images: [ogImage],
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sortBy = 'newest' } = await searchParams;

  const [categories, { products, total }] = await Promise.all([
    ProductRepository.getCategories(),
    ProductRepository.getProducts({
      categorySlug: slug,
      sortBy,
      limit: 50,
    }),
  ]);

  const currentCategory = categories.find((c) => c.slug === slug);

  if (!currentCategory) {
    notFound();
  }

  const categoryUrl = `https://mfe-brand.com/category/${slug}`;

  // Structured Data: BreadcrumbList + CollectionPage JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://mfe-brand.com',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Collections',
            'item': 'https://mfe-brand.com/products',
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': currentCategory.name,
            'item': categoryUrl,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': categoryUrl,
        'url': categoryUrl,
        'name': `${currentCategory.name} Collection | MFE BRAND`,
        'description':
          currentCategory.description ||
          `Handcrafted luxury ${currentCategory.name} by MFE BRAND atelier.`,
        'numberOfItems': total,
        'mainEntity': {
          '@type': 'ItemList',
          'itemListElement': products.map((p, idx) => ({
            '@type': 'ListItem',
            'position': idx + 1,
            'url': `https://mfe-brand.com/products/${p.slug}`,
            'name': p.name,
          })),
        },
      },
    ],
  };

  const otherCategories = categories.filter((c) => c.slug !== slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans bg-white text-[#141414]">
        
        {/* Editorial Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs font-sans font-medium text-[#6b6b6b] mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[#b87414] transition">Home</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <Link href="/products" className="hover:text-[#b87414] transition">Collections</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <span className="text-[#141414] font-semibold">{currentCategory.name}</span>
        </nav>

        {/* Category Hero Header */}
        <header className="mb-10 pb-8 border-b border-[#eae7e2]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#b87414] bg-[#b87414]/10 border border-[#b87414]/20 px-3 py-1 rounded-full mb-3">
                <Compass className="w-3.5 h-3.5 text-[#b87414]" />
                <span>Curated Editorial Category</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] tracking-tight">
                {currentCategory.name}
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#6b6b6b] mt-3 leading-relaxed max-w-2xl">
                {currentCategory.description ||
                  `Explore the pinnacle of contemporary Pakistani fashion and artisan craftsmanship. Every ensemble in our ${currentCategory.name} curation is tailored to exacting standards using premium raw materials and master-grade finishing.`}
              </p>
              <div className="mt-4 flex items-center gap-3 text-xs text-[#8c827a]">
                <span className="font-semibold text-[#141414]">{products.length}</span>
                <span>{products.length === 1 ? 'creation available' : 'creations available in this collection'}</span>
              </div>
            </div>

            {/* Sort Dropdown */}
            <form method="GET" className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-[#6b6b6b] flex items-center gap-1.5 uppercase tracking-wider">
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
              <button
                type="submit"
                className="bg-[#141414] hover:bg-[#d99026] text-white hover:text-[#141414] text-xs font-bold px-3.5 py-2 rounded-full transition cursor-pointer"
              >
                Apply
              </button>
            </form>
          </div>
        </header>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="py-20 text-center bg-[#faf8f5] rounded-3xl border border-[#eae7e2] my-8">
            <Sparkles className="w-8 h-8 text-[#d99026] mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-[#141414]">New Creations Arriving Soon</h3>
            <p className="text-xs text-[#6b6b6b] mt-1 max-w-md mx-auto">
              Our master artisans are currently crafting the next release for {currentCategory.name}.
            </p>
            <Link
              href="/products"
              className="inline-block mt-6 bg-[#141414] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-[#d99026] hover:text-[#141414] transition"
            >
              Browse All Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Cross-Collection Internal Links (SEO Siloing & Discovery) */}
        <div className="mt-20 pt-10 border-t border-[#eae7e2]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#141414]">
              Explore Other Curated Collections
            </h2>
            <Link href="/products" className="text-xs font-bold text-[#b87414] hover:underline">
              View All Collections →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {otherCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="text-xs font-medium px-4 py-2 rounded-full bg-[#f7f5f2] hover:bg-[#141414] text-[#141414] hover:text-white border border-[#eae7e2] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
