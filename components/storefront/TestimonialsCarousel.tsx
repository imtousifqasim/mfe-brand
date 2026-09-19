'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  ThumbsUp,
  PackageCheck,
  Truck,
  Award,
  PlusCircle,
  X,
  MessageSquare,
  Play,
  Pause
} from 'lucide-react';

interface Testimonial {
  id: string;
  category: 'suits' | 'mens' | 'shawls' | 'accessories';
  categoryLabel: string;
  headline: string;
  comment: string;
  author: string;
  initials: string;
  location: string;
  productOrdered: string;
  productImage: string;
  rating: number;
  date: string;
  specs: string;
  initialLikes: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    category: 'suits',
    categoryLabel: "Women's Suits",
    headline: 'Exquisite Schiffli Boring Embroidery & Flawless Drape',
    comment: 'The Teal Majestique stitched suit surpassed every expectation. The cutwork boring embroidery was remarkably clean and dense. The soft chiffon dupatta framed the look flawlessly. Worth every single rupee.',
    author: 'Ayesha Khan',
    initials: 'AK',
    location: 'Lahore, DHA Phase 5',
    productOrdered: 'Teal Majestique Lawn Cotton Embroidered Dress',
    productImage: 'https://i.postimg.cc/jtGs2hsV/Whats-App-Image-2026-09-19-at-10-11-42-PM.jpg',
    rating: 5,
    date: '2 days ago',
    specs: 'Stitched Pret • Combed Lawn • TCS Express',
    initialLikes: 42,
  },
  {
    id: 't-2',
    category: 'mens',
    categoryLabel: "Men's Clothing",
    headline: 'Premium Windproof Finish with Sleek Urban Fit',
    comment: 'Ordered via Cash on Delivery to Clifton. The parcel reached Karachi in under 36 hours via TCS. The bomber jacket is warm, lightweight, and the metal zipper hardware is high quality.',
    author: 'Hamza Tariq',
    initials: 'HT',
    location: 'Karachi, Clifton',
    productOrdered: "Men's Casual Stylish Full-Zip Winter Bomber Jacket",
    productImage: 'https://i.postimg.cc/nZ9VJ5JK/Whats-App-Image-2026-09-19-at-11-13-37-PM.jpg',
    rating: 5,
    date: '4 days ago',
    specs: 'Size: L • Thermal Poly Blend • COD Verified',
    initialLikes: 35,
  },
  {
    id: 't-3',
    category: 'shawls',
    categoryLabel: 'Winter Shawls',
    headline: 'Authentic Soft Warm Wool 3-Yard Shawl',
    comment: 'The wool weave is exquisitely light yet profoundly warm. The woven contrast geometric border shows genuine artistry. Generous 3-yard drape perfect for winter functions.',
    author: 'Fatima Zahra',
    initials: 'FZ',
    location: 'Islamabad, F-7 Sector',
    productOrdered: 'Premium Warm Wool Shawl with Contrast Border Trim',
    productImage: 'https://i.postimg.cc/hcgG1rkr/Whats-App-Image-2026-09-19-at-11-42-49-PM.jpg',
    rating: 5,
    date: '6 days ago',
    specs: '100% High-Grade Wool • 3 Yards • TCS Express',
    initialLikes: 29,
  },
  {
    id: 't-4',
    category: 'suits',
    categoryLabel: "Women's Suits",
    headline: 'Breathtaking Handwork Stones, Sequins & Bead Details',
    comment: 'The intricate handwork stones and sequins on the neckline and sleeves were breathtaking. Paired with the oil-painted organza dupatta, I received countless compliments at the family event.',
    author: 'Maham Raza',
    initials: 'MR',
    location: 'Peshawar, University Town',
    productOrdered: 'KI Fashion Pink Organza Handwork Sequins 3-Piece Suit',
    productImage: 'https://i.postimg.cc/8Tj1P085/Whats-App-Image-2026-09-19-at-10-02-48-PM.jpg',
    rating: 5,
    date: '1 week ago',
    specs: '3-Piece Unstitched • Katan Silk Trouser • TCS Dispatch',
    initialLikes: 51,
  },
  {
    id: 't-5',
    category: 'accessories',
    categoryLabel: "Men's Accessories",
    headline: 'Refined Slim Profile with Ample Card Organization',
    comment: 'Superb leather craftsmanship. Currency notes lay completely flat without folding, and 10 card slots hold everything securely. Arrived in clean packaging with express dispatch.',
    author: 'Zainab Malik',
    initials: 'ZM',
    location: 'Rawalpindi, Bahria Town',
    productOrdered: "Men's Luxury Genuine Long Continental Leather Wallet",
    productImage: 'https://i.postimg.cc/Zm2ZVcdY/Whats-App-Image-2026-09-19-at-11-16-46-PM-(1).jpg',
    rating: 5,
    date: '1 week ago',
    specs: 'Continental Long • 10 Card Slots • Verified Order',
    initialLikes: 38,
  },
  {
    id: 't-6',
    category: 'accessories',
    categoryLabel: 'Fragrance / Perfumes',
    headline: 'Mesmerizing Sillage with 10+ Hours Longevity',
    comment: 'Opens with fresh Italian bergamot and grapefruit, developing into deep cedarwood and amber. The projection easily lasts throughout the entire workday without fading.',
    author: 'Dr. Sana Mir',
    initials: 'SM',
    location: 'Faisalabad, Civil Lines',
    productOrdered: 'Citrus & Woody Long-Lasting Eau de Parfum for Men (50ml)',
    productImage: 'https://i.postimg.cc/VfYs1Lzt/Whats-App-Image-2026-09-19-at-10-48-33-PM.jpg',
    rating: 5,
    date: '2 weeks ago',
    specs: '50ml EDP Flacon • High Concentration • Fast Shipping',
    initialLikes: 46,
  },
];

export function TestimonialsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'suits' | 'mens' | 'shawls' | 'accessories'>('all');
  
  // Likes state
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [likesCount, setLikesCount] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    TESTIMONIALS.forEach((t) => {
      initial[t.id] = t.initialLikes;
    });
    return initial;
  });

  // Write Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Filtered reviews
  const displayedReviews = activeFilter === 'all' 
    ? TESTIMONIALS 
    : TESTIMONIALS.filter((t) => t.category === activeFilter);

  const totalCards = displayedReviews.length;

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
  }, [updateScrollState, displayedReviews]);

  // Exact 3-second auto-rotation interval
  useEffect(() => {
    if (isPaused || totalCards <= 1) return;

    setProgressKey((prev) => prev + 1);

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const step = getStepWidth();

      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [isPaused, totalCards, activeIndex, activeFilter, getStepWidth]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const step = getStepWidth();

    if (direction === 'right') {
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
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

  const toggleLike = (id: string) => {
    const isLiked = likedReviews[id];
    setLikedReviews((prev) => ({ ...prev, [id]: !isLiked }));
    setLikesCount((prev) => ({
      ...prev,
      [id]: isLiked ? (prev[id] || 1) - 1 : (prev[id] || 0) + 1,
    }));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor || !newComment) return;
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setIsReviewModalOpen(false);
      setNewAuthor('');
      setNewCity('');
      setNewProduct('');
      setNewComment('');
    }, 2000);
  };

  return (
    <section
      className="py-16 sm:py-24 bg-[#faf8f5] border-t border-b border-[#eae7e2] overflow-hidden select-none relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Badge & Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6 pb-6 border-b border-[#eae7e2]">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.28em] text-[#b87414] bg-[#d99026]/10 border border-[#d99026]/30 px-3.5 py-1.5 rounded-full mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#d99026]" />
              <span>Verified Patron Reviews & Client Diaries</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] tracking-tight">
              Words from Our Couture Patrons
            </h2>

            <p className="font-sans text-xs sm:text-sm text-[#6b6b6b] mt-2.5 max-w-2xl leading-relaxed">
              Real impressions of pure fabric luxury, master artisan embellishments, and white-glove doorstep delivery across Lahore, Karachi, Islamabad, and worldwide.
            </p>
          </div>

          {/* Action Buttons: Write Review & Carousel Controls */}
          <div className="flex flex-wrap items-center gap-3.5 self-start lg:self-auto shrink-0">
            {/* Write a review button */}
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#eae7e2] hover:border-[#d99026] text-[#141414] hover:text-[#b87414] font-sans text-xs font-bold transition-all duration-200 shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#b87414]" />
              <span>Share Your Experience</span>
            </button>

            {/* 3s Auto-play indicator & toggle */}
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="inline-flex items-center gap-2 text-[11px] font-medium text-[#8c887b] px-3.5 py-2 rounded-full bg-white border border-[#eae7e2] hover:border-neutral-400 transition cursor-pointer shadow-2xs"
              title={isPaused ? 'Click to play' : 'Click to pause'}
            >
              {isPaused ? (
                <>
                  <Play className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>Resume 3s</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[#141414] font-semibold">Auto 3s</span>
                </>
              )}
            </button>

            {/* Carousel Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-[#eae7e2] bg-white text-[#141414] hover:bg-[#141414] hover:text-white hover:border-[#141414] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs active:scale-95"
                aria-label="Previous Review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-[#141414] bg-[#141414] text-white hover:bg-[#d99026] hover:text-[#141414] hover:border-[#d99026] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                aria-label="Next Review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Social Proof & Trust Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white border border-[#eae7e2] shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#faf6ee] border border-[#e8dfcf] flex items-center justify-center text-[#d99026] shrink-0">
              <Star className="w-5 h-5 fill-[#d99026]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif font-bold text-lg text-[#141414]">4.9</span>
                <span className="text-xs text-[#8c887b]">/ 5.0</span>
              </div>
              <p className="text-[11px] font-sans text-[#6b6b6b] leading-tight">
                1,480+ Verified Patron Reviews
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#eae7e2] shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#faf6ee] border border-[#e8dfcf] flex items-center justify-center text-[#d99026] shrink-0">
              <Award className="w-5 h-5 text-[#b87414]" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-[#141414]">99.4%</span>
              <p className="text-[11px] font-sans text-[#6b6b6b] leading-tight">
                Fabric & Work Authenticity
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#eae7e2] shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#faf6ee] border border-[#e8dfcf] flex items-center justify-center text-[#d99026] shrink-0">
              <Truck className="w-5 h-5 text-[#b87414]" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-[#141414]">48 Hours</span>
              <p className="text-[11px] font-sans text-[#6b6b6b] leading-tight">
                Average TCS Courier Dispatch
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#eae7e2] shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#faf6ee] border border-[#e8dfcf] flex items-center justify-center text-[#d99026] shrink-0">
              <PackageCheck className="w-5 h-5 text-[#b87414]" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-[#141414]">100% COD</span>
              <p className="text-[11px] font-sans text-[#6b6b6b] leading-tight">
                Cash on Delivery Nationwide
              </p>
            </div>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-white text-[#6b6b6b] border border-[#eae7e2] hover:border-neutral-400'
            }`}
          >
            All Reviews ({TESTIMONIALS.length})
          </button>
          <button
            onClick={() => setActiveFilter('suits')}
            className={`px-4 py-2 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeFilter === 'suits'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-white text-[#6b6b6b] border border-[#eae7e2] hover:border-neutral-400'
            }`}
          >
            Women's Suits
          </button>
          <button
            onClick={() => setActiveFilter('mens')}
            className={`px-4 py-2 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeFilter === 'mens'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-white text-[#6b6b6b] border border-[#eae7e2] hover:border-neutral-400'
            }`}
          >
            Men's Clothing
          </button>
          <button
            onClick={() => setActiveFilter('shawls')}
            className={`px-4 py-2 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeFilter === 'shawls'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-white text-[#6b6b6b] border border-[#eae7e2] hover:border-neutral-400'
            }`}
          >
            Winter Shawls
          </button>
          <button
            onClick={() => setActiveFilter('accessories')}
            className={`px-4 py-2 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeFilter === 'accessories'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-white text-[#6b6b6b] border border-[#eae7e2] hover:border-neutral-400'
            }`}
          >
            Accessories & Scents
          </button>
        </div>

        {/* 3-Second Visual Progress Indicator Bar */}
        <div className="w-full bg-[#eae7e2] h-[2.5px] rounded-full mb-8 overflow-hidden">
          <div
            key={progressKey}
            className={`h-full bg-gradient-to-r from-[#b87414] to-[#d99026] origin-left ${
              isPaused ? 'w-full opacity-30' : 'animate-testimonials-progress'
            }`}
            style={{
              animationDuration: '3000ms',
              animationTimingFunction: 'linear',
            }}
          />
        </div>

        {/* Reviews Carousel Track */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory pb-4 pt-1 text-left"
        >
          {displayedReviews.map((t, idx) => (
            <div
              key={t.id}
              className="w-full sm:w-[calc((100%-24px)/2)] md:w-[calc((100%-48px)/3)] min-w-full sm:min-w-[calc((100%-24px)/2)] md:min-w-[calc((100%-48px)/3)] max-w-full sm:max-w-[calc((100%-24px)/2)] md:max-w-[calc((100%-48px)/3)] shrink-0 snap-start flex flex-col"
            >
              <div className="group relative flex flex-col rounded-3xl overflow-hidden bg-white border border-[#eae7e2] hover:border-[#d99026] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 h-full">
                
                {/* 1. Visual Showcase Header: Real Ensemble Photo with Overlays */}
                <div 
                  className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#faf8f5]"
                  style={{ position: 'relative' }}
                >
                  <Image
                    src={t.productImage}
                    alt={t.productOrdered}
                    fill
                    className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                    unoptimized
                  />

                  {/* Gradient shadow for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-mono font-bold text-[#141414] px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#eae7e2] shadow-xs">
                      0{idx + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/40 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Order</span>
                    </span>
                  </div>

                  {/* Floating Product Name & Category on Image */}
                  <div className="absolute inset-x-3.5 bottom-3 text-white">
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#d99026] bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-sm inline-block mb-1">
                      {t.categoryLabel}
                    </span>
                    <h4 className="font-serif text-xs sm:text-sm font-bold text-white drop-shadow-md truncate">
                      {t.productOrdered}
                    </h4>
                  </div>
                </div>

                {/* 2. Review Content Section */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Stars & Quote Icon */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#f2efe9]">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center text-[#d99026]">
                          {[...Array(t.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#d99026]" />
                          ))}
                        </div>
                        <span className="font-mono text-xs font-bold text-[#141414]">5.0</span>
                        <span className="text-[10px] text-[#8c887b] font-sans font-medium uppercase tracking-wider">
                          • Exceptional
                        </span>
                      </div>

                      <Quote className="w-5 h-5 text-[#d99026]/30 group-hover:text-[#d99026]/60 transition-colors" />
                    </div>

                    {/* Headline */}
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#141414] mb-2 leading-snug group-hover:text-[#b87414] transition-colors">
                      “{t.headline}”
                    </h3>

                    {/* Comment Body */}
                    <p className="font-sans text-xs sm:text-sm text-[#55524c] leading-relaxed line-clamp-4 mb-4">
                      {t.comment}
                    </p>

                    {/* Specification / Delivery Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-5">
                      {t.specs.split('•').map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium text-[#6b6b6b] bg-[#faf8f5] border border-[#eae7e2] px-2.5 py-1 rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 3. Patron Identity & Like Action */}
                  <div className="pt-4 border-t border-[#f2efe9] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Monogram Seal */}
                      <div className="w-10 h-10 rounded-full bg-[#141414] text-[#d99026] flex items-center justify-center font-serif font-bold text-xs shadow-xs border border-[#d99026]/30 shrink-0">
                        {t.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-sans font-bold text-xs sm:text-sm text-[#141414]">
                            {t.author}
                          </span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#d99026] fill-[#d99026]/10" />
                        </div>
                        <span className="text-[11px] text-[#8c887b] block">
                          {t.location} • <span className="text-[#a39f95] font-mono text-[10px]">{t.date}</span>
                        </span>
                      </div>
                    </div>

                    {/* Helpful Like Button */}
                    <button
                      onClick={() => toggleLike(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                        likedReviews[t.id]
                          ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                          : 'bg-[#faf8f5] text-[#8c887b] hover:text-[#141414] hover:bg-neutral-100 border border-[#eae7e2]'
                      }`}
                      title="Mark as helpful"
                    >
                      <Heart className={`w-3.5 h-3.5 transition-transform ${likedReviews[t.id] ? 'fill-rose-500 text-rose-500 scale-110' : 'group-hover:scale-105'}`} />
                      <span className="font-mono text-[11px]">{likesCount[t.id]}</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Bottom Pagination Dots */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {displayedReviews.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === activeIndex
                  ? 'w-8 bg-[#d99026]'
                  : 'w-2 bg-[#eae7e2] hover:bg-[#c2beb4]'
              }`}
              aria-label={`Jump to review ${i + 1}`}
            />
          ))}
        </div>

      </div>

      {/* Interactive Write a Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#eae7e2] shadow-2xl relative">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 cursor-pointer transition"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-[#b87414] bg-[#d99026]/10 px-3 py-1 rounded-full mb-2">
                <Sparkles className="w-3 h-3 text-[#d99026]" />
                <span>Patron Feedback</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#141414]">
                Share Your Couture Experience
              </h3>
              <p className="text-xs text-[#6b6b6b] mt-1 font-sans">
                Your feedback helps our Lahore atelier maintain the highest standard of handcrafted luxury.
              </p>
            </div>

            {reviewSubmitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-xl font-bold text-[#141414]">
                  Thank You, Patron!
                </h4>
                <p className="text-xs text-[#6b6b6b] max-w-xs mx-auto">
                  Your review has been successfully submitted and will appear after quick verification.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 font-sans text-xs">
                {/* Rating selection */}
                <div>
                  <label className="block font-bold text-[#141414] mb-1.5">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="cursor-pointer transition transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newRating ? 'fill-[#d99026] text-[#d99026]' : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="font-mono font-bold text-sm text-[#141414] ml-2">
                      {newRating}.0 Stars
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#141414] mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ayesha Malik"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e2] focus:border-[#d99026] focus:outline-hidden text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#141414] mb-1">City & Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Lahore, Gulberg"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e2] focus:border-[#d99026] focus:outline-hidden text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#141414] mb-1">Ensemble Purchased</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Velvet Festive 3-Piece"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e2] focus:border-[#d99026] focus:outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#141414] mb-1">Your Review</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share your thoughts on the fabric quality, embroidery finish, fitting, and delivery speed..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e2] focus:border-[#d99026] focus:outline-hidden text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-[#eae7e2] text-neutral-600 hover:bg-neutral-50 font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#141414] hover:bg-[#d99026] text-white hover:text-[#141414] font-bold transition shadow-sm"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
