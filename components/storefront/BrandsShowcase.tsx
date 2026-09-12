'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Brand } from '@/types/database';
import { ExternalImage } from '@/components/media/ExternalImage';
import { ArrowUpRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface BrandsShowcaseProps {
  brands: Brand[];
}

export function BrandsShowcase({ brands }: BrandsShowcaseProps) {
  const displayBrands = brands && brands.length > 0 ? brands : [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Repeat brands so the carousel always has multiple panels to cycle through
  const carouselBrands = displayBrands.length > 0
    ? (displayBrands.length < 6 ? [...displayBrands, ...displayBrands, ...displayBrands] : displayBrands)
    : [];

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const itemWidth = clientWidth / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
    const index = Math.round(scrollLeft / (itemWidth || 1));
    setActiveIndex(Math.min(index, carouselBrands.length - 1));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState);
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [carouselBrands.length]);

  // Auto-scroll every 3 seconds; pauses on hover
  useEffect(() => {
    if (isPaused || carouselBrands.length === 0) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      // If reached the end, loop smoothly back to start
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const itemWidth = clientWidth / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
        scrollRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, carouselBrands.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const itemWidth = clientWidth / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
    scrollRef.current.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth',
    });
  };

  if (!displayBrands || displayBrands.length === 0) return null;

  return (
    <section
      className="py-16 sm:py-24 bg-[#f7f5f2] border-b border-[#eae7e2] font-sans select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Navigation Arrow Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6 pb-6 border-b border-[#eae7e2]">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.28em] text-[#b87414] bg-[#d99026]/10 border border-[#d99026]/30 px-3.5 py-1.5 rounded-full mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#d99026]" />
              <span>Artisanal Houses & Sub-Labels</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] tracking-tight">
              The MFE Design Collective
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#6b6b6b] mt-2 max-w-xl leading-relaxed">
              Explore our specialized couture houses, each dedicated to a distinct aesthetic — from bespoke royal formals to modern luxury pret.
            </p>
          </div>

          {/* Carousel Arrow Controls */}
          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                canScrollLeft
                  ? 'bg-white border-[#eae7e2] text-[#141414] hover:bg-[#141414] hover:text-white shadow-xs'
                  : 'bg-white/40 border-[#eae7e2]/50 text-neutral-300 cursor-not-allowed'
              }`}
              aria-label="Previous Brand"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                canScrollRight
                  ? 'bg-[#141414] border-[#141414] text-white hover:bg-[#d99026] hover:text-[#141414] hover:border-[#d99026] shadow-md'
                  : 'bg-white/40 border-[#eae7e2]/50 text-neutral-300 cursor-not-allowed'
              }`}
              aria-label="Next Brand"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Scroll Track */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory pb-4 pt-1 text-left"
        >
          {carouselBrands.map((brand, idx) => (
            <div
              key={`${brand.id || brand.slug}-${idx}`}
              className="min-w-[85%] sm:min-w-[47%] lg:min-w-[31.5%] shrink-0 snap-start"
            >
              <Link
                href={`/products?brand=${brand.slug}`}
                className="group relative flex flex-col h-full rounded-3xl overflow-hidden bg-white border border-[#eae7e2] hover:border-[#d99026] shadow-xs hover:shadow-xl transition-all duration-400 block"
              >
                {/* Visual Header / Portrait Frame */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#faf8f5]">
                  <ExternalImage
                    src={brand.logo_url}
                    alt={brand.name}
                    fill
                    className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />

                  {/* Brand Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#141414] px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#eae7e2] shadow-xs">
                      Maison {(idx % displayBrands.length) + 1}
                    </span>
                  </div>

                  {/* Floating Action Arrow */}
                  <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md border border-[#eae7e2] flex items-center justify-center text-[#141414] group-hover:bg-[#d99026] group-hover:border-[#d99026] group-hover:text-white shadow-md transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>

                {/* Sub-Brand Information Body */}
                <div className="p-6 sm:p-7 flex flex-col justify-between flex-1 gap-3 bg-white">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#141414] group-hover:text-[#b87414] transition-colors leading-tight">
                      {brand.name}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#6b6b6b] leading-relaxed mt-2 line-clamp-2">
                      {brand.description || 'Specialized atelier sub-label celebrating traditional craftsmanship, delicate embroideries, and contemporary luxury.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#eae7e2] flex items-center justify-between text-xs font-sans font-semibold">
                    <span className="text-[#b87414] group-hover:underline">Explore Sub-Brand Capsule</span>
                    <span className="text-neutral-400 font-mono text-[11px]">View Line →</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {displayBrands.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === (activeIndex % displayBrands.length) ? 'w-8 bg-[#d99026]' : 'w-2 bg-[#eae7e2] hover:bg-neutral-400'
              }`}
              aria-label={`Go to brand ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
