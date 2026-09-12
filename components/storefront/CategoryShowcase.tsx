'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Category } from '@/types/database';
import { ExternalImage } from '@/components/media/ExternalImage';
import { ArrowUpRight, Sparkles, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

interface CategoryShowcaseProps {
  categories: Category[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [progressKey, setProgressKey] = useState(0);

  const totalCards = categories.length;

  const getStepWidth = useCallback(() => {
    if (!scrollRef.current) return 0;
    const firstChild = scrollRef.current.firstElementChild as HTMLElement;
    if (firstChild) {
      return firstChild.offsetWidth + 24; // width + gap-6 (24px)
    }
    return scrollRef.current.clientWidth / 3;
  }, []);

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const step = getStepWidth() || 1;
    const index = Math.round(scrollLeft / step);
    setActiveIndex(Math.min(Math.max(0, index), totalCards - 1));
  }, [totalCards, getStepWidth]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  // Exact 3-second auto-play carousel
  useEffect(() => {
    if (isPaused || totalCards <= 1) return;

    // Reset progress animation key on each cycle
    setProgressKey((prev) => prev + 1);

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const step = getStepWidth();

      // Loop smoothly to beginning if reached end
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, 3000); // exactly 3 seconds

    return () => clearInterval(interval);
  }, [isPaused, totalCards, activeIndex, getStepWidth]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const step = getStepWidth();

    if (direction === 'right') {
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
      }
    } else {
      if (scrollLeft <= 10) {
        scrollRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const step = getStepWidth();
    scrollRef.current.scrollTo({
      left: index * step,
      behavior: 'smooth',
    });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section
      className="py-16 sm:py-24 bg-[#f7f5f2] border-b border-[#eae7e2] select-none overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Title and 3s Carousel Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6 pb-6 border-b border-[#eae7e2]">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.28em] text-[#b87414] bg-[#d99026]/10 border border-[#d99026]/30 px-3.5 py-1.5 rounded-full mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#d99026]" />
              <span>Curated Haute Couture Collections</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] tracking-tight">
              Signature Collections & Capsules
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#6b6b6b] mt-2 max-w-xl leading-relaxed">
              Explore our distinctive seasonal collections spanning unstitched luxury lawn, festive velvet formals, and hand-woven heirlooms.
            </p>
          </div>

          {/* Right Action & Controls */}
          <div className="flex flex-wrap items-center gap-4 self-start lg:self-auto shrink-0">
            {/* 3s Auto-scroll Status Badge */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-[#8c887b] px-3 py-1.5 rounded-full bg-white border border-[#eae7e2] shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
              <span>{isPaused ? 'Paused' : 'Auto 3s'}</span>
            </div>

            {/* View All Link */}
            <Link
              href="/products"
              className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-[#6b6b6b] hover:text-[#b87414] flex items-center gap-2 group transition-colors mr-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#b87414]" />
            </Link>

            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-[#eae7e2] bg-white text-[#141414] hover:bg-[#141414] hover:text-white hover:border-[#141414] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
                aria-label="Previous Collection"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-[#141414] bg-[#141414] text-white hover:bg-[#d99026] hover:text-[#141414] hover:border-[#d99026] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                aria-label="Next Collection"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3-Second Visual Progress Indicator */}
        <div className="w-full bg-[#eae7e2] h-[2px] rounded-full mb-8 overflow-hidden">
          <div
            key={progressKey}
            className={`h-full bg-gradient-to-r from-[#b87414] to-[#d99026] origin-left ${
              isPaused ? 'w-full opacity-30' : 'animate-category-progress'
            }`}
            style={{
              animationDuration: '3000ms',
              animationTimingFunction: 'linear',
            }}
          />
        </div>

        {/* Collections Carousel Scroll Track */}
        <div
          ref={scrollRef}
          className="flex gap-5 sm:gap-6 overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory pb-4 pt-1 text-left"
        >
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className="w-full sm:w-[calc((100%-24px)/2)] md:w-[calc((100%-48px)/3)] min-w-full sm:min-w-[calc((100%-24px)/2)] md:min-w-[calc((100%-48px)/3)] max-w-full sm:max-w-[calc((100%-24px)/2)] md:max-w-[calc((100%-48px)/3)] shrink-0 snap-start flex flex-col"
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className="group relative flex flex-col rounded-3xl overflow-hidden bg-white border border-[#eae7e2] hover:border-[#d99026] shadow-sm hover:shadow-xl transition-all duration-400 h-full"
              >
                {/* Image Container with high vibrancy and subtle zoom */}
                <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden bg-[#ebe7e1]">
                  <ExternalImage
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                  />

                  {/* Gradient shade for bottom contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-70 group-hover:opacity-60 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-mono font-bold text-[#141414] px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#eae7e2] shadow-xs">
                      0{idx + 1}
                    </span>
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                      Capsule
                    </span>
                  </div>

                  {/* Floating Luxury Glass Label */}
                  <div className="absolute inset-x-3 bottom-3 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#eae7e2] shadow-md flex items-center justify-between transition-all duration-300 group-hover:shadow-xl group-hover:border-[#d99026] group-hover:bg-white">
                    <div className="min-w-0 pr-2">
                      <h3 className="font-serif text-sm sm:text-base font-bold text-[#141414] group-hover:text-[#b87414] transition-colors truncate">
                        {cat.name}
                      </h3>
                      <span className="font-sans text-[11px] font-medium text-[#6b6b6b] block truncate mt-0.5 flex items-center gap-1">
                        <span>Explore Collection</span>
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[#f7f5f2] border border-[#eae7e2] flex items-center justify-center text-[#141414] group-hover:bg-[#d99026] group-hover:text-[#141414] group-hover:border-[#d99026] shrink-0 transition-all duration-300 shadow-xs">
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Carousel Pagination Indicator Dots */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {categories.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === activeIndex
                  ? 'w-8 bg-[#d99026]'
                  : 'w-2 bg-[#eae7e2] hover:bg-[#c2beb4]'
              }`}
              aria-label={`Go to collection ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

