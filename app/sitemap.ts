import { MetadataRoute } from 'next';
import { ProductRepository } from '@/repositories/product.repository';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mfe-brand.com';

  const [categories, { products }] = await Promise.all([
    ProductRepository.getCategories(),
    ProductRepository.getProducts({ limit: 500 }),
  ]);

  const sitemapEntries: MetadataRoute.Sitemap = [
    // 1. Homepage
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // 2. All Collections Catalog
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // 3. Category/Collection Hubs
  categories.forEach((cat) => {
    if (cat.slug) {
      sitemapEntries.push({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.85,
      });
    }
  });

  // 4. Individual Product Pages
  products.forEach((p) => {
    if (p.slug) {
      sitemapEntries.push({
        url: `${baseUrl}/products/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  });

  return sitemapEntries;
}
