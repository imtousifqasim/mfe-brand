import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/database';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';

interface DealsSectionProps {
  products: Product[];
}

export function DealsSection({ products }: DealsSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#eae7e2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4 pb-6 border-b border-[#eae7e2]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-[0.28em] text-[#b87414] bg-[#d99026]/10 border border-[#d99026]/30 px-3.5 py-1.5 rounded-full mb-3 shadow-sm">
              <Sparkles className="w-3 h-3 text-[#d99026]" />
              <span>New Arrivals • Capsule 2026</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414]">
              New Arrivals & Luxury Pret
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#6b6b6b] mt-2 max-w-xl leading-relaxed">
              Explore our newest handcrafted couture drops, unstitched luxury lawn, and contemporary pret wear fresh from the atelier.
            </p>
          </div>
          <Link
            href="/products"
            className="font-sans inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6b6b6b] hover:text-[#b87414] transition self-start sm:self-auto"
          >
            <span>Explore All Collections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom View More Action linking to shop */}
        <div className="mt-12 sm:mt-14 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2.5 bg-[#d99026] hover:bg-[#c67d18] text-[#141414] font-sans font-bold text-xs uppercase tracking-[0.16em] px-10 py-4 rounded-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span>View More</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
