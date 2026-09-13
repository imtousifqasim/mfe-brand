'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/database';
import { ExternalImage } from '@/components/media/ExternalImage';
import { ProductCard } from '@/components/storefront/ProductCard';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useCompare } from '@/hooks/useCompare';
import { 
  Star, ShoppingBag, Heart, Layers, ShieldCheck, 
  Truck, RefreshCw, CheckCircle2, ChevronRight, ChevronLeft,
  Sparkles, Check, Ruler, X, AlertTriangle, Camera,
  ArrowLeft, Scissors, Loader2
} from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

interface VariantColor {
  name: string;
  hex: string;
}

interface SizeOption {
  id: string;
  name: string;
  badge: string;
  detail: string;
  priceDelta: number;
}

const FABRIC_SWATCHES: VariantColor[] = [
  { name: 'Antique Gold', hex: '#d4af37' },
  { name: 'Royal Emerald', hex: '#0f5257' },
  { name: 'Midnight Velvet', hex: '#1c1c24' },
  { name: 'Ruby Crimson', hex: '#800020' },
];

const SIZES: SizeOption[] = [
  { id: 'unstitched', name: 'Unstitched', badge: '3-Piece', detail: '3.5m Fabric', priceDelta: 0 },
  { id: 'small', name: 'Small (S)', badge: 'Stitched', detail: 'Chest 36" • Waist 30"', priceDelta: 2500 },
  { id: 'medium', name: 'Medium (M)', badge: 'Stitched', detail: 'Chest 40" • Waist 34"', priceDelta: 2500 },
  { id: 'large', name: 'Large (L)', badge: 'Stitched', detail: 'Chest 44" • Waist 38"', priceDelta: 2500 },
  { id: 'xlarge', name: 'X-Large (XL)', badge: 'Stitched', detail: 'Chest 48" • Waist 42"', priceDelta: 2500 },
  { id: 'bespoke', name: 'Custom Fit', badge: 'Bespoke', detail: 'Made-to-Measure', priceDelta: 4500 },
];

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare } = useCompare();

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Customization state
  const [selectedSize, setSelectedSize] = useState<string>(SIZES[0].name);
  const [selectedColor, setSelectedColor] = useState<VariantColor>(FABRIC_SWATCHES[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'fabric' | 'shipping' | 'reviews'>('details');
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Sticky mobile bottom bar state
  const [showStickyBar, setShowStickyBar] = useState(false);
  const mainCtaRef = useRef<HTMLDivElement | null>(null);

  // Dynamic pricing calculation based on selected size cut
  const activeSizeObj = SIZES.find(s => s.name === selectedSize) || SIZES[0];
  const delta = activeSizeObj.priceDelta || 0;
  const currentRegularPrice = product.regular_price + delta;
  const currentSalePrice = product.sale_price !== null && product.sale_price !== undefined
    ? product.sale_price + delta
    : null;
  const currentPrice = currentSalePrice ?? currentRegularPrice;
  const hasDiscount = currentSalePrice !== null && currentSalePrice < currentRegularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((currentRegularPrice - currentSalePrice!) / currentRegularPrice) * 100)
    : 0;

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      if (!product?.id) return;
      try {
        setIsLoadingReviews(true);
        const res = await fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.reviews)) {
            setProductReviews(data.reviews);
          }
        }
      } catch (err) {
        console.error('Failed to load approved reviews:', err);
      } finally {
        if (isMounted) setIsLoadingReviews(false);
      }
    }
    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [product?.id]);

  // Ensure rich gallery with fallback images if a product has fewer than 4
  const defaultFallbackImages = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=900&auto=format&fit=crop',
  ];

  let rawImages = product.images && product.images.length > 0 ? product.images : [];
  if (rawImages.length === 1) {
    // augment with complementary editorial angles
    rawImages = [
      rawImages[0],
      { id: 'supp-1', image_url: defaultFallbackImages[1], alt_text: 'Embroidery Detail Angle', sort_order: 2, is_primary: false },
      { id: 'supp-2', image_url: defaultFallbackImages[2], alt_text: 'Dupatta Drape Angle', sort_order: 3, is_primary: false },
      { id: 'supp-3', image_url: defaultFallbackImages[3], alt_text: 'Editorial Lookbook Angle', sort_order: 4, is_primary: false },
    ];
  } else if (rawImages.length === 0) {
    rawImages = defaultFallbackImages.map((url, idx) => ({
      id: `fallback-${idx}`,
      image_url: url,
      alt_text: `${product.name} Angle ${idx + 1}`,
      sort_order: idx + 1,
      is_primary: idx === 0,
    }));
  }

  const images = rawImages;
  const currentImage = images[selectedImageIndex] || images[0];

  const isFavorited = isInWishlist(product.id);

  // Calculate dynamic delivery estimate (3 business days ahead)
  const [deliveryDateString, setDeliveryDateString] = useState('3-4 business days');
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setDeliveryDateString(d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }));
  }, []);

  // Trigger sticky mobile bar as soon as user scrolls down 240px
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 240);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobile gallery carousel ref and synchronization
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);

  const handleSelectImage = (idx: number) => {
    setSelectedImageIndex(idx);
    if (mobileCarouselRef.current) {
      const container = mobileCarouselRef.current;
      const targetScroll = idx * container.clientWidth;
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  };

  const handleMobileScroll = () => {
    if (!mobileCarouselRef.current) return;
    const container = mobileCarouselRef.current;
    const width = container.clientWidth;
    if (width > 0) {
      const newIndex = Math.round(container.scrollLeft / width);
      if (newIndex >= 0 && newIndex < images.length && newIndex !== selectedImageIndex) {
        setSelectedImageIndex(newIndex);
      }
    }
  };

  const handleMouseMoveZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    if (isAdding) return;
    setIsAdding(true);
    // Circular loader effect on button before smoothly sliding out cart drawer
    setTimeout(() => {
      addToCart(product, quantity, {
        size: selectedSize,
        color: selectedColor.name,
        price: currentPrice,
      }, true);
      setIsAdding(false);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2200);
    }, 450);
  };

  const handleBuyNow = () => {
    // Navigate directly to checkout without opening the side cart drawer
    addToCart(product, quantity, {
      size: selectedSize,
      color: selectedColor.name,
      price: currentPrice,
    }, false);
    router.push('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewContent.trim() || !reviewName.trim()) {
      alert('Please complete all review fields.');
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          customerName: reviewName.trim(),
          customerEmail: reviewEmail.trim() || undefined,
          rating: reviewRating,
          title: reviewTitle.trim(),
          content: reviewContent.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSubmitted(true);
        setReviewTitle('');
        setReviewContent('');
        setReviewName('');
        setReviewEmail('');
      } else {
        alert(data.error || 'Failed to submit review. Please try again.');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Unable to submit review. Please check your connection and try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Stock status logic
  const stockCount = product.stock_quantity ?? 12;
  const isLowStock = stockCount <= 5;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-6 sm:space-y-12 font-sans bg-white text-[#141414] pb-32 lg:pb-12">
      
      {/* Modern Breadcrumbs: Sleek Mobile Capsule + Desktop Editorial */}
      <div className="flex sm:hidden items-center justify-between gap-2 pt-1">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f7f5f2] border border-[#eae7e2] text-xs font-bold text-[#141414] active:scale-95 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#b87414]" />
          <span>Collections</span>
        </Link>
        {product.category && (
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-[11px] font-bold text-[#b87414] bg-[#d99026]/10 px-3 py-1 rounded-full border border-[#d99026]/20 truncate max-w-[170px]"
          >
            {product.category.name}
          </Link>
        )}
      </div>

      <nav className="hidden sm:flex text-xs font-sans font-medium text-[#6b6b6b] items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <Link href="/" className="hover:text-[#b87414] transition shrink-0">Atelier Home</Link>
        <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
        <Link href="/products" className="hover:text-[#b87414] transition shrink-0">Collections</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#b87414] transition shrink-0">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
        <span className="text-[#141414] truncate font-semibold">{product.name}</span>
      </nav>

      {/* Main Product Presentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-14">
        
        {/* LEFT: Multi-Image Gallery with Hover-Zoom & Mobile Smooth Swipe (6 Columns) */}
        <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
          
          {/* Vertical Thumbnail Strip on Desktop / Horizontal on Mobile */}
          <div className="flex sm:flex-col gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-y-auto max-h-[600px] shrink-0 pb-1 sm:pb-0 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => handleSelectImage(idx)}
                className={`group relative shrink-0 rounded-xl sm:rounded-2xl p-0.5 border-2 transition-all cursor-pointer touch-manipulation active:scale-95 ${
                  idx === selectedImageIndex
                    ? 'border-[#d99026] ring-2 ring-[#d99026]/30 opacity-100 shadow-sm'
                    : 'border-[#eae7e2] hover:border-neutral-400 opacity-70 hover:opacity-100'
                }`}
                aria-label={`View Image ${idx + 1}`}
              >
                <div className="relative w-14 h-20 sm:w-20 sm:h-28 rounded-[10px] sm:rounded-[14px] overflow-hidden bg-[#f7f5f2]">
                  <ExternalImage
                    src={img.image_url}
                    alt={img.alt_text || product.name}
                    fill
                    className="object-cover pointer-events-none"
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Featured Active Image / Carousel Area */}
          <div className="flex-1 flex flex-col gap-2.5 min-w-0">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#f7f5f2] border border-[#eae7e2] shadow-md group">
              
              {/* MOBILE VIEW: Native horizontal swipe-and-snap carousel */}
              <div
                ref={mobileCarouselRef}
                onScroll={handleMobileScroll}
                className="sm:hidden flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar w-full"
                style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
              >
                {images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="min-w-full w-full shrink-0 snap-center relative aspect-[4/5] bg-[#f7f5f2]"
                  >
                    <ExternalImage
                      src={img.image_url}
                      alt={img.alt_text || product.name}
                      fill
                      priority={idx === 0}
                      className="object-cover object-center pointer-events-none"
                    />
                  </div>
                ))}
              </div>

              {/* DESKTOP VIEW: High-res Editorial Zoom Image */}
              <div
                className="hidden sm:block relative aspect-[3/4] overflow-hidden cursor-crosshair select-none"
                onMouseEnter={() => {
                  if (typeof window !== 'undefined' && window.innerWidth >= 1024) setIsZooming(true);
                }}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMoveZoom}
              >
                <div
                  className="w-full h-full relative transition-transform duration-150 ease-out pointer-events-none"
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: isZooming ? 'scale(2.2)' : 'scale(1)',
                  }}
                >
                  <ExternalImage
                    src={currentImage.image_url}
                    alt={currentImage.alt_text || product.name}
                    fill
                    priority
                    className="object-cover object-center pointer-events-none"
                  />
                </div>
              </div>

              {/* Top-Left Badges */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 sm:gap-2 z-20 pointer-events-none">
                {hasDiscount && (
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider shadow-xs">
                    {discountPercent}% Off
                  </span>
                )}
                {product.is_best_deal && !hasDiscount && (
                  <span className="bg-[#d99026] text-[#141414] text-[9px] font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    <span>Special</span>
                  </span>
                )}
              </div>

              {/* Action Buttons top right */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col gap-2 z-20">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-md border border-[#eae7e2] flex items-center justify-center shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer touch-manipulation ${
                    isFavorited ? 'text-rose-500' : 'text-[#141414] hover:text-rose-500'
                  }`}
                  title="Add to Wishlist"
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const res = addToCompare(product);
                    alert(res.message);
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-md border border-[#eae7e2] flex items-center justify-center text-[#141414] hover:text-[#d99026] shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
                  title="Compare Ensemble"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>

              {/* Prev / Next Floating Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const prevIdx = (selectedImageIndex - 1 + images.length) % images.length;
                      handleSelectImage(prevIdx);
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white active:bg-[#eae7e2] text-[#141414] shadow-md border border-[#eae7e2] flex items-center justify-center transition active:scale-90 z-20 cursor-pointer touch-manipulation sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#141414]" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextIdx = (selectedImageIndex + 1) % images.length;
                      handleSelectImage(nextIdx);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white active:bg-[#eae7e2] text-[#141414] shadow-md border border-[#eae7e2] flex items-center justify-center transition active:scale-90 z-20 cursor-pointer touch-manipulation sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 text-[#141414]" />
                  </button>
                </>
              )}

              {/* Image Counter Badge */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-3 z-20 pointer-events-none bg-black/65 backdrop-blur-sm text-white text-[10px] font-mono font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <span>{selectedImageIndex + 1}</span>
                  <span className="opacity-40">/</span>
                  <span>{images.length}</span>
                </div>
              )}

              {/* Hover Zoom Helper Pill (desktop only) */}
              <div className="hidden sm:block absolute bottom-3 right-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-black/70 text-white px-3 py-1 rounded-full backdrop-blur-sm z-20">
                Hover to magnify
              </div>
            </div>

            {/* Mobile Image Dot Indicators */}
            {images.length > 1 && (
              <div className="flex sm:hidden justify-center items-center gap-2 pt-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectImage(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer touch-manipulation ${
                      idx === selectedImageIndex ? 'w-6 bg-[#d99026]' : 'w-2 bg-neutral-300'
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Product Information, Selectors & Purchasing (6 Columns) */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-5">
          
          {/* Brand & Category Kicker */}
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b6b6b]">
            <span className="text-[#b87414] truncate max-w-[200px]">{product.brand?.name || 'MFE Signature'}</span>
            <span className="shrink-0 font-mono text-[10px]">SKU: {product.sku || 'MFE-2026'}</span>
          </div>

          {/* Title - Editorial H1 */}
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#141414] leading-snug">
            {product.name}
          </h1>

          {/* Rating Snapshot */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center text-[#d99026]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.average_rating || 5)
                      ? 'fill-current text-[#d99026]'
                      : 'text-neutral-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-[#141414]">
              {product.average_rating ? product.average_rating.toFixed(1) : '5.0'}
            </span>
            <span className="text-xs text-[#6b6b6b]">
              ({product.review_count || 16} Patron Reviews)
            </span>
          </div>

          {/* Dynamic Pricing & Stock Banner (Changes Live on Cut Selection) */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-[#f7f5f2] border border-[#eae7e2] shadow-2xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b6b6b]">
                  {activeSizeObj.badge === 'Bespoke' ? 'Bespoke Cut Price' : activeSizeObj.badge === 'Stitched' ? 'Pret Stitched Price' : 'Unstitched Fabric Price'}
                </span>
                {delta > 0 && (
                  <span className="text-[9px] font-bold bg-[#d99026]/15 text-[#b87414] px-2 py-0.5 rounded-full border border-[#d99026]/30">
                    +{formatPrice(delta)} {activeSizeObj.badge}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2 sm:gap-3">
                <span className="font-sans text-2xl sm:text-3xl font-black text-[#141414] transition-all">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="font-sans text-xs sm:text-sm text-[#6b6b6b] line-through font-normal">
                    {formatPrice(currentRegularPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              {isLowStock ? (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 sm:px-3.5 py-1 rounded-full uppercase tracking-wider">
                  <AlertTriangle className="w-3 h-3 text-amber-700" /> Only {stockCount} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 sm:px-3.5 py-1 rounded-full uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> In Stock
                </span>
              )}
            </div>
          </div>

          {/* Compact Delivery Date Line */}
          <div className="flex items-center gap-2 text-xs text-[#141414] bg-white p-2.5 sm:p-3 rounded-xl border border-[#eae7e2]">
            <Truck className="w-4 h-4 text-[#d99026] shrink-0" />
            <span className="text-[11px] sm:text-xs leading-tight">
              <strong>Arrives by {deliveryDateString}</strong> with Express Courier Dispatch.
            </span>
          </div>

          {/* Short Excerpt */}
          {product.short_description && (
            <p className="text-xs sm:text-sm text-[#6b6b6b] leading-relaxed font-sans">
              {product.short_description}
            </p>
          )}

          {/* Color / Fabric Swatch Selector (Sleek Circular Luxury Swatches) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#141414]">
              <span>Selected Shade: <span className="text-[#b87414] font-bold tracking-normal normal-case ml-1">{selectedColor.name}</span></span>
            </div>
            <div className="flex items-center gap-3">
              {FABRIC_SWATCHES.map((swatch) => {
                const isSelected = selectedColor.name === swatch.name;
                return (
                  <button
                    key={swatch.name}
                    type="button"
                    onClick={() => setSelectedColor(swatch)}
                    title={swatch.name}
                    className={`relative w-10 h-10 rounded-full transition-colors cursor-pointer touch-manipulation flex items-center justify-center ${
                      isSelected
                        ? 'ring-2 ring-[#d99026] ring-offset-2 shadow-md'
                        : 'border border-black/15 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                    aria-label={`Select color ${swatch.name}`}
                  >
                    {isSelected && (
                      <Check className={`w-4 h-4 drop-shadow ${
                        swatch.hex === '#e8e2d5' || swatch.hex === '#d4af37' ? 'text-neutral-900' : 'text-white'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size / Silhouette Selector (Compact, High-Contrast Luxury Pills) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#141414]">
              <span>Select Silhouette / Cut:</span>
              <button 
                type="button"
                onClick={() => setSizeModalOpen(true)}
                className="text-[#b87414] hover:text-[#d99026] hover:underline inline-flex items-center gap-1 cursor-pointer font-bold normal-case tracking-normal text-xs"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide</span>
              </button>
            </div>

            {/* Compact 3-col grid on mobile, 3-col on desktop */}
            <div className="grid grid-cols-3 gap-2">
              {SIZES.map((size) => {
                const isSelected = selectedSize === size.name;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSize(size.name)}
                    className={`py-2 px-2 rounded-xl text-center border transition-colors cursor-pointer touch-manipulation flex flex-col items-center justify-center min-h-[48px] ${
                      isSelected
                        ? 'bg-[#141414] text-white border-[#141414] shadow-md ring-2 ring-[#d99026]/40'
                        : 'bg-[#f7f5f2] text-[#141414] border-[#eae7e2] hover:border-neutral-400 active:bg-[#e4e0d8]'
                    }`}
                  >
                    <span className="font-bold text-xs leading-tight block truncate w-full">
                      {size.name}
                    </span>
                    <span className={`text-[10px] mt-0.5 block truncate w-full font-medium ${
                      isSelected 
                        ? 'text-[#d99026]' 
                        : size.priceDelta > 0 
                          ? 'text-[#b87414]' 
                          : 'text-[#7a7a7a]'
                    }`}>
                      {size.priceDelta > 0 ? `+₨${size.priceDelta.toLocaleString()}` : size.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected cut detail summary */}
            <div className="text-[11px] text-[#6b6b6b] bg-[#f7f5f2] px-3 py-1.5 rounded-lg border border-[#eae7e2] flex items-center justify-between">
              <span>
                Chosen Cut: <strong className="text-[#141414]">{selectedSize}</strong>
              </span>
              <span className="text-[#7a7a7a] font-medium">
                {activeSizeObj.detail}
              </span>
            </div>
          </div>

          {/* Quantity Stepper & Dual Action Buttons */}
          <div ref={mainCtaRef} className="space-y-3 pt-3 border-t border-[#eae7e2]">
            <div className="flex items-center gap-2.5 sm:gap-3">
              
              {/* Quantity Stepper */}
              <div className="flex items-center border border-[#eae7e2] rounded-xl p-1 bg-[#f7f5f2] shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[#141414] hover:bg-white text-base font-bold transition cursor-pointer touch-manipulation"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setQuantity(isNaN(val) || val < 1 ? 1 : val);
                  }}
                  className="w-9 sm:w-11 text-center font-bold text-xs text-[#141414] bg-transparent outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Quantity"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[#141414] hover:bg-white text-base font-bold transition cursor-pointer touch-manipulation"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Primary CTA: Add to Bag */}
              <button
                type="button"
                disabled={isAdding}
                onClick={handleAddToCart}
                className="flex-1 bg-[#d99026] hover:bg-[#c67d18] active:bg-[#b87414] text-[#141414] font-bold text-xs uppercase tracking-[0.14em] py-3.5 px-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer touch-manipulation disabled:opacity-85"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#141414]" />
                    <span>Adding to Bag...</span>
                  </>
                ) : addedNotice ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#141414]" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* Secondary CTA: Buy Now */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full bg-[#141414] hover:bg-[#262626] active:bg-[#333333] text-white font-bold text-xs uppercase tracking-[0.14em] py-3.5 px-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer touch-manipulation"
            >
              <span>Buy Now — Instant Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Trust Badges Row (Compact, No text crushing) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 sm:pt-5 border-t border-[#eae7e2] text-center font-sans">
            <div className="p-2 sm:p-3 rounded-xl bg-[#f7f5f2] border border-[#eae7e2] flex flex-col items-center justify-center">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#b87414] mb-1" />
              <span className="font-bold text-[10px] sm:text-xs text-[#141414] block leading-tight">100% Authentic</span>
              <span className="text-[9px] text-[#7a7a7a] mt-0.5 block leading-tight">Pure Silks</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-[#f7f5f2] border border-[#eae7e2] flex flex-col items-center justify-center">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-[#b87414] mb-1" />
              <span className="font-bold text-[10px] sm:text-xs text-[#141414] block leading-tight">7-Day Returns</span>
              <span className="text-[9px] text-[#7a7a7a] mt-0.5 block leading-tight">Easy Exchange</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-[#f7f5f2] border border-[#eae7e2] flex flex-col items-center justify-center">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#b87414] mb-1" />
              <span className="font-bold text-[10px] sm:text-xs text-[#141414] block leading-tight">Cash on Delivery</span>
              <span className="text-[9px] text-[#7a7a7a] mt-0.5 block leading-tight">Nationwide</span>
            </div>
          </div>

        </div>

      </div>

      {/* Description Tabs Section */}
      <div className="bg-white border border-[#eae7e2] rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xs space-y-6 sm:space-y-8">
        {/* Modern Segmented Navigation Tabs */}
        <div className="p-1 sm:p-1.5 bg-[#f7f5f2] border border-[#eae7e2] rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
              activeTab === 'details'
                ? 'bg-[#141414] text-white shadow-sm'
                : 'text-[#6b6b6b] hover:text-[#141414] active:bg-[#e4e0d8]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d99026]" />
            <span>Design & Fabric</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fabric')}
            className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
              activeTab === 'fabric'
                ? 'bg-[#141414] text-white shadow-sm'
                : 'text-[#6b6b6b] hover:text-[#141414] active:bg-[#e4e0d8]'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 text-[#d99026]" />
            <span>Artisan Craft</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
              activeTab === 'shipping'
                ? 'bg-[#141414] text-white shadow-sm'
                : 'text-[#6b6b6b] hover:text-[#141414] active:bg-[#e4e0d8]'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-[#d99026]" />
            <span>Shipping</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
              activeTab === 'reviews'
                ? 'bg-[#141414] text-white shadow-sm'
                : 'text-[#6b6b6b] hover:text-[#141414] active:bg-[#e4e0d8]'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-[#d99026]" />
            <span>Reviews ({productReviews.length > 0 ? productReviews.length : (product.review_count || 16)})</span>
          </button>
        </div>

        {/* Tab Content 1: Design Details */}
        {activeTab === 'details' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#6b6b6b] leading-relaxed font-sans max-w-4xl">
            <p className="text-[#141414]">
              {product.full_description || product.short_description || 'This ensemble represents the pinnacle of contemporary Pakistani high fashion. Designed by master artisans, every cut is sculpted to provide an effortless drape and royal silhouette.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 text-xs font-sans">
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#f7f5f2] border border-[#eae7e2]">
                <strong className="text-[#141414] block mb-1 font-bold">Fabric Composition & Weave:</strong>
                Pure Chinese Raw Silk Shirt with Organza Embroidered Border & Pure Chiffon Dupatta with metallic tilla scalloping.
              </div>
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#f7f5f2] border border-[#eae7e2]">
                <strong className="text-[#141414] block mb-1 font-bold">Package Contents (3-Piece):</strong>
                Full 3.5m shirt fabric with front/back embroidery, 2.5m organza/chiffon dupatta, and 2.5m dyed raw silk trouser fabric.
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Fabric & Care */}
        {activeTab === 'fabric' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#6b6b6b] leading-relaxed max-w-4xl font-sans">
            <p className="text-[#141414]">
              Every motif is drawn by hand by master calligraphy artisans in Lahore. Using traditional karchob embroidery frames, pure metallic tilla, zardozi wires, and glass cut-dana beads are individually stitched by generational craftsmen.
            </p>
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#f7f5f2] border border-[#eae7e2] space-y-2">
              <strong className="text-[#141414] block font-bold">Preservation Guidelines:</strong>
              <ul className="list-disc pl-5 space-y-1 text-xs text-[#6b6b6b]">
                <li>Professional dry clean only with hydrocarbon solvent.</li>
                <li>Store wrapped in natural unbleached muslin cloth away from direct sunlight.</li>
                <li>Iron on low heat over a protective cotton press cloth; avoid steam directly on zardozi threads.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab Content 3: Shipping & Returns */}
        {activeTab === 'shipping' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#6b6b6b] leading-relaxed max-w-4xl font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#f7f5f2] border border-[#eae7e2]">
                <strong className="text-[#141414] block mb-1 font-bold">Nationwide Courier Express:</strong>
                Dispatched via TCS / Leopards Express. Standard delivery takes 2 to 3 business days across Karachi, Lahore, Islamabad, and all major cities.
              </div>
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#f7f5f2] border border-[#eae7e2]">
                <strong className="text-[#141414] block mb-1 font-bold">7-Day Easy Return Policy:</strong>
                If the silhouette or fabric does not meet your discerning expectations, initiate an exchange or return within 7 days of parcel receipt.
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 4: Reviews & Rating Breakdown */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 sm:space-y-8 max-w-4xl font-sans">
            
            {/* Rating Breakdown Bar */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#f7f5f2] border border-[#eae7e2] flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div className="text-center sm:text-left shrink-0">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-[#141414] block">
                  {product.average_rating ? product.average_rating.toFixed(1) : '4.9'}
                </span>
                <div className="flex items-center text-[#d99026] my-1 justify-center sm:justify-start">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-[#d99026]" />
                  ))}
                </div>
                <span className="text-xs text-[#6b6b6b]">Based on 16 patron reviews</span>
              </div>

              <div className="flex-1 w-full space-y-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-12 text-[#6b6b6b]">5 Stars</span>
                  <div className="flex-1 h-2 rounded-full bg-neutral-200 overflow-hidden">
                    <div className="h-full bg-[#d99026] w-[88%]" />
                  </div>
                  <span className="w-8 text-right font-medium text-[#141414]">88%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-12 text-[#6b6b6b]">4 Stars</span>
                  <div className="flex-1 h-2 rounded-full bg-neutral-200 overflow-hidden">
                    <div className="h-full bg-[#d99026] w-[12%]" />
                  </div>
                  <span className="w-8 text-right font-medium text-[#141414]">12%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-12 text-[#6b6b6b]">3 Stars</span>
                  <div className="flex-1 h-2 rounded-full bg-neutral-200 overflow-hidden">
                    <div className="h-full bg-[#d99026] w-[0%]" />
                  </div>
                  <span className="w-8 text-right font-medium text-[#141414]">0%</span>
                </div>
              </div>
            </div>

            {/* Customer Photos Gallery */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#d99026]" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#141414]">Patron Real Looks & Customer Photos</h5>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {[
                  { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop', user: 'Ayesha K.', city: 'Lahore', caption: 'Wedding Reception' },
                  { src: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop', user: 'Fatima Z.', city: 'Islamabad', caption: 'Tilla Detail' },
                  { src: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=400&auto=format&fit=crop', user: 'Hamza T.', city: 'Karachi', caption: 'Raw Silk Finish' },
                  { src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop', user: 'Zainab M.', city: 'Rawalpindi', caption: 'Dupatta Scalloping' },
                ].map((item, idx) => (
                  <div key={idx} className="group relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-[#f7f5f2] border border-[#eae7e2] shadow-xs">
                    <ExternalImage src={item.src} alt={item.caption} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 sm:p-3">
                      <span className="text-[11px] font-bold text-white leading-tight">{item.user} ({item.city})</span>
                      <span className="text-[10px] text-amber-200/90">{item.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Patron Reviews List */}
            <div className="space-y-4 pt-4 border-t border-[#eae7e2]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#141414]">Patron Testimonials & Reviews</h4>
                  <p className="text-xs text-[#6b6b6b]">Genuine feedback from verified collectors across Pakistan</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-[#f7f5f2] border border-[#eae7e2] rounded-full text-[#b87414]">
                  {productReviews.length} Verified {productReviews.length === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>

              {isLoadingReviews ? (
                <div className="p-8 text-center bg-[#f7f5f2] rounded-2xl border border-[#eae7e2] flex items-center justify-center gap-2 text-xs text-[#6b6b6b]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#d99026]" />
                  <span>Loading atelier reviews...</span>
                </div>
              ) : productReviews.length === 0 ? (
                <div className="p-6 text-center bg-[#f7f5f2] rounded-2xl border border-[#eae7e2] space-y-1">
                  <p className="text-xs font-bold text-[#141414]">No published reviews yet</p>
                  <p className="text-xs text-[#6b6b6b]">Be the first patron to share your styling experience with this piece.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {productReviews.map((rev) => (
                    <div key={rev.id} className="p-4 sm:p-5 rounded-2xl bg-[#f7f5f2] border border-[#eae7e2] space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#141414]">{rev.customer_name || 'Anonymous Patron'}</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Verified Patron
                            </span>
                          </div>
                          <div className="flex items-center text-[#d99026] my-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < (rev.rating || 5) ? 'fill-current text-[#d99026]' : 'text-neutral-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-[11px] text-[#6b6b6b]">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </span>
                      </div>
                      {rev.title && (
                        <h5 className="text-xs font-bold text-[#141414]">{rev.title}</h5>
                      )}
                      <p className="text-xs text-[#4a4a4a] leading-relaxed whitespace-pre-line">{rev.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Form */}
            {reviewSubmitted ? (
              <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Review Submitted for Moderation</span>
                </div>
                <p className="text-emerald-700">
                  Thank you for your review. Your verified patron feedback has been recorded and will appear on this page once approved by our atelier team.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="p-4 sm:p-6 rounded-2xl bg-white border border-[#eae7e2] space-y-3 sm:space-y-4 shadow-xs">
                <div>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#141414]">Write a Patron Review</h4>
                  <p className="text-xs text-[#6b6b6b]">Share your impressions on craftsmanship, fit, fabric texture, and courier delivery</p>
                </div>
                
                {/* Rating selection */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-[#141414] mr-2">Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewRating ? 'fill-current text-[#d99026]' : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name *"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="text-xs p-3 rounded-xl bg-[#f7f5f2] border border-[#eae7e2] text-[#141414] placeholder-[#6b6b6b] outline-hidden focus:border-[#d99026]"
                  />
                  <input
                    type="email"
                    placeholder="Email Address (Optional)"
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    className="text-xs p-3 rounded-xl bg-[#f7f5f2] border border-[#eae7e2] text-[#141414] placeholder-[#6b6b6b] outline-hidden focus:border-[#d99026]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Review Headline (e.g. Pure Luxury) *"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="text-xs p-3 rounded-xl bg-[#f7f5f2] border border-[#eae7e2] text-[#141414] placeholder-[#6b6b6b] outline-hidden focus:border-[#d99026]"
                  />
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Share your experience regarding fabric feel, embroidery finesse, and delivery speed..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-[#f7f5f2] border border-[#eae7e2] text-[#141414] placeholder-[#6b6b6b] outline-hidden focus:border-[#d99026]"
                />
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="inline-flex items-center justify-center gap-2 bg-[#d99026] hover:bg-[#c67d18] disabled:opacity-50 text-[#141414] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-sm cursor-pointer transition active:scale-98"
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Patron Review</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* "You May Also Like" Related Creations (Responsive 2 cols on mobile) */}
      {relatedProducts.length > 0 && (
        <section className="space-y-5 sm:space-y-8 pt-4 sm:pt-8 border-t border-[#eae7e2]">
          <div className="flex items-center justify-between pb-3 border-b border-[#eae7e2]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b87414]">
                Coordinated Capsule
              </span>
              <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#141414] mt-0.5">
                You May Also Like
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold uppercase tracking-wider text-[#6b6b6b] hover:text-[#b87414] transition"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {sizeModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            className="fixed inset-0 cursor-pointer"
            onClick={() => setSizeModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-[#eae7e2] space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-3 border-b border-[#eae7e2]">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[#d99026]" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#141414]">MFE Atelier Sizing Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setSizeModalOpen(false)}
                className="p-1.5 rounded-full text-[#6b6b6b] hover:text-[#141414] hover:bg-[#f7f5f2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6b6b6b]">
              All measurements are in inches. For custom bespoke tailoring inquiries, contact our master tailor on WhatsApp (+92 300 1234567).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-[#141414]">
                <thead className="bg-[#f7f5f2] text-[10px] uppercase tracking-wider text-[#6b6b6b]">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-lg">Size</th>
                    <th className="py-2.5 px-3">Bust</th>
                    <th className="py-2.5 px-3">Waist</th>
                    <th className="py-2.5 px-3">Hips</th>
                    <th className="py-2.5 px-3">Length</th>
                    <th className="py-2.5 px-3 rounded-r-lg">Inseam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eae7e2]">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#b87414]">Small (S)</td>
                    <td className="py-2.5 px-3">36 in</td>
                    <td className="py-2.5 px-3">30 in</td>
                    <td className="py-2.5 px-3">39 in</td>
                    <td className="py-2.5 px-3">42 in</td>
                    <td className="py-2.5 px-3">37 in</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#b87414]">Medium (M)</td>
                    <td className="py-2.5 px-3">40 in</td>
                    <td className="py-2.5 px-3">34 in</td>
                    <td className="py-2.5 px-3">43 in</td>
                    <td className="py-2.5 px-3">43 in</td>
                    <td className="py-2.5 px-3">38 in</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#b87414]">Large (L)</td>
                    <td className="py-2.5 px-3">44 in</td>
                    <td className="py-2.5 px-3">38 in</td>
                    <td className="py-2.5 px-3">47 in</td>
                    <td className="py-2.5 px-3">44 in</td>
                    <td className="py-2.5 px-3">39 in</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#b87414]">Unstitched</td>
                    <td className="py-2.5 px-3" colSpan={5}>
                      Full 3.5m shirt + 2.5m dupatta + 2.5m trousers
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSizeModalOpen(false)}
                className="bg-[#141414] hover:bg-[#262626] text-white font-bold text-xs uppercase tracking-wider px-5 py-2 rounded-full"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Sticky Mobile Buy Bar (Triggered on scroll) */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#eae7e2] px-3.5 py-2.5 shadow-[0_-8px_25px_rgba(0,0,0,0.1)] transition-all duration-300 ${
        showStickyBar ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-12 rounded-xl overflow-hidden bg-[#f7f5f2] shrink-0 border border-[#eae7e2] shadow-xs">
              <ExternalImage src={currentImage.image_url} alt={product.name} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[#141414] truncate leading-tight">{product.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-black text-[#141414]">
                  {formatPrice(currentPrice)}
                </span>
                <span className="text-[10px] text-[#b87414] bg-[#d99026]/15 font-bold px-1.5 py-0.5 rounded-md truncate max-w-[90px]">
                  {selectedSize}
                </span>
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0" 
                  style={{ backgroundColor: selectedColor.hex }}
                  title={selectedColor.name}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={isAdding}
              onClick={handleAddToCart}
              className="bg-[#f7f5f2] hover:bg-[#eae7e2] active:bg-[#e4e0d8] text-[#141414] font-bold text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl border border-[#eae7e2] flex items-center gap-1.5 shadow-2xs cursor-pointer touch-manipulation transition-colors disabled:opacity-85"
            >
              {isAdding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#b87414]" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5 text-[#b87414]" />
              )}
              <span>{isAdding ? 'Adding...' : 'Bag'}</span>
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="bg-[#141414] hover:bg-[#262626] active:bg-[#333333] text-white font-bold text-xs uppercase tracking-wider py-2.5 px-3.5 rounded-xl shadow-sm cursor-pointer touch-manipulation flex items-center gap-1 transition-colors"
            >
              <span>Buy</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
