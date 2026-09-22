import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { HeroSlider } from '@/components/storefront/HeroSlider';
import { DealsSection } from '@/components/storefront/DealsSection';
import { CategoryShowcase } from '@/components/storefront/CategoryShowcase';
import { BrandsShowcase } from '@/components/storefront/BrandsShowcase';
import { AdvantagesSection } from '@/components/storefront/AdvantagesSection';
import { TestimonialsCarousel } from '@/components/storefront/TestimonialsCarousel';
import { SettingsRepository } from '@/repositories/settings.repository';
import { ProductRepository } from '@/repositories/product.repository';
import { ArrowRight, Compass } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    absolute: 'MFE BRAND | Haute Couture & Luxury Pret Atelier',
  },
  description:
    'Official online maison for MFE BRAND. Discover handcrafted luxury Pakistani unstitched lawn, festive velvet formals, bespoke pret, pure wool shawls, and signature fragrances with nationwide express delivery.',
  alternates: {
    canonical: 'https://mfe-brand.com',
  },
  openGraph: {
    title: 'MFE BRAND | Haute Couture & Luxury Pret Atelier',
    description:
      'Where centuries of artisan heritage meet contemporary Pakistani grandeur. Handcrafted raw silk, organza, and zardozi thread ensembles.',
    url: 'https://mfe-brand.com',
    siteName: 'MFE BRAND',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
        width: 1600,
        height: 900,
        alt: 'MFE BRAND Luxury Pret & Haute Couture',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MFE BRAND | Haute Couture & Luxury Pret Atelier',
    description:
      'Centuries of Lahore artisan heritage tailored for the contemporary connoisseur.',
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
    ],
  },
};

export default async function HomePage() {
  const slides = await SettingsRepository.getHeroSlides();
  const advantages = await SettingsRepository.getAdvantages();
  const categories = await ProductRepository.getCategories();
  const brands = await ProductRepository.getBrands();

  // Fetch the 8 most recent products so all newly added creations appear immediately
  const { products: recentDeals } = await ProductRepository.getProducts({
    sortBy: 'newest',
    limit: 8,
  });

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ClothingStore'],
        '@id': 'https://mfe-brand.com/#organization',
        'name': 'MFE BRAND',
        'url': 'https://mfe-brand.com',
        'logo': 'https://mfe-brand.com/favicon.ico',
        'description':
          'Premier Pakistani haute couture maison specializing in hand-embroidered unstitched suits, festive formals, pure wool shawls, and fine leather accessories.',
        'telephone': '+923267727318',
        'priceRange': 'PKR 1,500 - PKR 25,000',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Near Meezan Bank Branch, Peco Road',
          'addressLocality': 'Lahore',
          'addressRegion': 'Punjab',
          'addressCountry': 'PK',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://mfe-brand.com/#website',
        'url': 'https://mfe-brand.com',
        'name': 'MFE BRAND',
        'publisher': {
          '@id': 'https://mfe-brand.com/#organization',
        },
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://mfe-brand.com/products?search={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="space-y-16 sm:space-y-24 pb-24 font-sans bg-white text-[#141414]">
        
        {/* 1. Cinematic Hero Slider Section (Expansive with subtle side margins, not boxed) */}
        <section className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4">
          <HeroSlider slides={slides} />
        </section>

        {/* 2. Artisanal Trust & Advantages Bar (Warm-gray background) */}
        <AdvantagesSection advantages={advantages} />

        {/* 3. Limited Time Specials & Deals (8 Recent Products) */}
        <DealsSection products={recentDeals} />

        {/* 4. The Couture Edit: Categories Showcase (Warm-gray background with subtle bottom-only gradient) */}
        <CategoryShowcase categories={categories} />

        {/* 5. Editorial Lookbook: The Atelier Heritage (ONE deliberate full-bleed dark section for contrast) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-[#0c0c0e] text-white p-8 sm:p-14 lg:p-16 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl space-y-5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#d99026] bg-[#d99026]/10 border border-[#d99026]/30 px-3.5 py-1.5 rounded-full">
                <Compass className="w-3.5 h-3.5 text-[#d99026]" />
                <span>The Atelier Heritage</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
                Where Centuries of Artisan Heritage Meet Contemporary Pakistani Grandeur
              </h2>
              <p className="text-sm sm:text-base text-neutral-200 font-sans leading-relaxed font-normal">
                Every MFE creation begins in our private Lahore atelier, where master craftsmen hand-weave pure raw silk, organza, and zardozi threads. We honor traditional Mughalesque embellishment while tailoring for the modern global Pakistani.
              </p>
              <div className="pt-3">
                <Link
                  href="/category/womens-unstitched-stitched-suits"
                  className="inline-flex items-center gap-2.5 bg-[#d99026] hover:bg-[#c67d18] text-[#141414] font-bold px-8 py-4 rounded-full text-xs uppercase tracking-[0.16em] shadow-xl shadow-[#d99026]/20 transition transform hover:-translate-y-0.5"
                >
                  <span>Discover Suits Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* High visual weight & generous spacing for key heritage metrics */}
            <div className="hidden lg:flex flex-col gap-8 text-xs text-neutral-300 border-l border-white/15 pl-12 shrink-0">
              <div className="space-y-1">
                <span className="text-[#d99026] block font-serif font-bold text-3xl sm:text-4xl tracking-tight">100%</span>
                <span className="text-white font-medium text-xs sm:text-sm block">Authentic Himalayan Cashmere & Pure Silks</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#d99026] block font-serif font-bold text-3xl sm:text-4xl tracking-tight">180+</span>
                <span className="text-white font-medium text-xs sm:text-sm block">Hours of Artisan Hand Embroidery per Ensemble</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#d99026] block font-serif font-bold text-3xl sm:text-4xl tracking-tight">2–3 Days</span>
                <span className="text-white font-medium text-xs sm:text-sm block">Express Courier Dispatch Across Pakistan</span>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Sub-Brands Collective (MFE Design Collective with fixed circular cropping) */}
        <BrandsShowcase brands={brands} />

        {/* 8. Verified Patron Testimonials (Interactive Carousel with auto-scroll & pause-on-hover) */}
        <TestimonialsCarousel />

      </div>
    </>
  );
}
