import React from 'react';
import { notFound } from 'next/navigation';
import { ProductRepository } from '@/repositories/product.repository';
import { ProductDetailView } from '@/components/storefront/ProductDetailView';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  const product = await ProductRepository.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Related products query (excluding current product)
  const { products: allRelated } = await ProductRepository.getProducts({
    categorySlug: product.category?.slug,
    limit: 5,
  });

  const relatedProducts = allRelated
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  return <ProductDetailView product={product} relatedProducts={relatedProducts} />;
}
