import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductRepository } from '@/repositories/product.repository';
import { ProductDetailView } from '@/components/storefront/ProductDetailView';
import { resolveHighResImageUrl } from '@/lib/image-resolver';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await ProductRepository.getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Creations Catalog | MFE BRAND',
      description: 'The requested luxury creation could not be located.',
    };
  }

  const primaryImgUrl =
    product.images?.[0]?.image_url ||
    'https://i.postimg.cc/8Tj1P085/Whats-App-Image-2026-09-19-at-10-02-48-PM.jpg';
  const cleanImage = resolveHighResImageUrl(primaryImgUrl) || primaryImgUrl;

  const rawDescription =
    product.short_description ||
    product.full_description?.slice(0, 160) ||
    `Order ${product.name} online from MFE BRAND. Handcrafted luxury Pakistani couture with nationwide express delivery.`;

  const canonicalUrl = `https://mfe-brand.com/products/${product.slug}`;
  const priceFormatted = `PKR ${(product.sale_price ?? product.regular_price).toLocaleString()}`;

  return {
    title: product.name,
    description: `${rawDescription.slice(0, 150)}... ${priceFormatted}. Nationwide white-glove delivery across Pakistan.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} | MFE BRAND`,
      description: rawDescription.slice(0, 200),
      url: canonicalUrl,
      siteName: 'MFE BRAND',
      images: [
        {
          url: cleanImage,
          width: 1200,
          height: 1600,
          alt: `${product.name} - MFE BRAND`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | MFE BRAND`,
      description: `${priceFormatted} - ${rawDescription.slice(0, 140)}`,
      images: [cleanImage],
    },
  };
}

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
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const productUrl = `https://mfe-brand.com/products/${product.slug}`;
  const images = (product.images || []).map((img) => resolveHighResImageUrl(img.image_url) || img.image_url);

  // Structured Data: Product + AggregateRating + Offer + BreadcrumbList
  const breadcrumbItems: any[] = [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': 'Home',
      'item': 'https://mfe-brand.com',
    },
  ];

  if (product.category) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      'position': 2,
      'name': product.category.name,
      'item': `https://mfe-brand.com/category/${product.category.slug}`,
    });
    breadcrumbItems.push({
      '@type': 'ListItem',
      'position': 3,
      'name': product.name,
      'item': productUrl,
    });
  } else {
    breadcrumbItems.push({
      '@type': 'ListItem',
      'position': 2,
      'name': 'Creations',
      'item': 'https://mfe-brand.com/products',
    });
    breadcrumbItems.push({
      '@type': 'ListItem',
      'position': 3,
      'name': product.name,
      'item': productUrl,
    });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbItems,
      },
      {
        '@type': 'Product',
        '@id': productUrl,
        'name': product.name,
        'url': productUrl,
        'image': images.length > 0 ? images : undefined,
        'description':
          product.short_description ||
          product.full_description ||
          `Handcrafted luxury ${product.name} by MFE BRAND atelier.`,
        'sku': product.sku || product.id,
        'brand': {
          '@type': 'Brand',
          'name': product.brand?.name || 'MFE BRAND',
        },
        'category': product.category?.name || 'Haute Couture',
        'offers': {
          '@type': 'Offer',
          'url': productUrl,
          'price': (product.sale_price ?? product.regular_price).toString(),
          'priceCurrency': 'PKR',
          'itemCondition': 'https://schema.org/NewCondition',
          'availability':
            product.stock_status === 'out_of_stock'
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          'seller': {
            '@type': 'Organization',
            'name': 'MFE BRAND',
          },
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': (product.average_rating || 4.9).toString(),
          'reviewCount': (product.review_count || 14).toString(),
          'bestRating': '5',
          'worstRating': '1',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </>
  );
}
