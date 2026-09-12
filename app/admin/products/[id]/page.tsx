import React from 'react';
import { notFound } from 'next/navigation';
import { ProductRepository } from '@/repositories/product.repository';
import { ProductEditForm } from './ProductEditForm';

interface ProductEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = await params;
  const product = await ProductRepository.getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProductEditForm initialProduct={product} />
    </div>
  );
}
