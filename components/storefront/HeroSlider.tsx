'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { HeroSlide } from '@/types/database';
import { ExternalImage } from '@/components/media/ExternalImage';

interface HeroSliderProps {
  slides: HeroSlide[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = slides.length;

  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % total);
    }, 4500); // 4.5 seconds auto-slide for luxury pacing

    return () => clearInterval(timer);
  }, [total, isPaused]);

  if (!slides || slides.length === 0) return null;

  const prevSlide = () => {
    setCurrent(prev => (prev === 0 ? total - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent(prev => (prev + 1) % total);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    touchStartX.current = null;
  };

  const slide = slides[current];

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-neutral-950 group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide Image with Ken Burns Zoom Effect */}
      <div className="relative w-full h-[520px] sm:h-[620px] lg:h-[700px] xl:h-[740px]">
        <ExternalImage
          key={slide.image_url}
          src={slide.image_url}
          alt={slide.heading}
          fill
          priority
          className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Sophisticated Luxury Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/50 to-transparent flex items-center">
          <div className="max-w-3xl px-6 sm:px-14 lg:px-20 xl:px-28 space-y-6">
            
            {/* Haute Couture Kicker Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[11px] font-sans font-bold uppercase tracking-[0.25em]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Haute Couture • Capsule 2026</span>
            </div>

            {/* Editorial Heading with Playfair Display */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.12] tracking-tight drop-shadow-lg">
              {slide.heading}
            </h1>

            {/* Subtitle */}
            {slide.subtitle && (
              <p className="font-sans text-sm sm:text-base lg:text-lg text-neutral-300 max-w-xl font-normal leading-relaxed drop-shadow">
                {slide.subtitle}
              </p>
            )}

            {/* Dual CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={slide.button_url || '/products'}
                className="inline-flex items-center gap-2.5 bg-[#d99026] hover:bg-[#c67d18] text-[#141414] font-sans font-bold px-8 py-4 rounded-full shadow-lg shadow-[#d99026]/25 transition transform hover:-translate-y-0.5 text-xs uppercase tracking-[0.16em]"
              >
                <span>{slide.button_text || 'Explore Collection'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/products?category=unstitched-luxury"
                className="hidden sm:inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#141414]/90 hover:bg-[#141414] text-white border border-white/25 backdrop-blur-md font-sans text-xs uppercase tracking-[0.16em] font-bold transition"
              >
                <span>View Lookbook</span>
              </Link>
            </div>

            {/* Delivery Assurance micro-badge */}
            <div className="pt-3 flex items-center gap-4 text-[11px] text-neutral-400 font-sans">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Authentic Fabric Guaranteed</span>
              </div>
              <span className="text-neutral-600">•</span>
              <span>Express TCS / Leopards Dispatch</span>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Arrows with Glassmorphic Style */}
      {total > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-neutral-950/60 hover:bg-neutral-950/90 text-white backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-neutral-950/60 hover:bg-neutral-950/90 text-white backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Minimalist Progress Pill Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  current === idx ? 'w-8 bg-amber-400 shadow-sm' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
