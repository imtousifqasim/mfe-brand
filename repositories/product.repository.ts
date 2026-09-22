import { createAdminClient, queryAcrossAllShards, findAcrossAllShards, getActiveWriteAdmin, getAllAdminClients } from '@/lib/supabase/admin';
import { Product, Category, Brand } from '@/types/database';
import { SEED_PRODUCTS, SEED_CATEGORIES, SEED_BRANDS } from '@/lib/data/seed-data';
import { resolveHighResImageUrl } from '@/lib/image-resolver';

function normalizeProductImages(p: Product): Product {
  if (!p) return p;
  if (p.images && Array.isArray(p.images) && p.images.length > 0) {
    const updatedImages = p.images.map(img => ({
      ...img,
      image_url: resolveHighResImageUrl(img.image_url) || img.image_url,
    }));
    updatedImages.sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
    return {
      ...p,
      images: updatedImages,
    };
  }
  return p;
}

export interface ProductFilterOptions {
  categorySlug?: string;
  brandSlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isBestDeal?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';
  limit?: number;
  offset?: number;
}

export const CATEGORY_ALIASES: Record<string, string> = {
  'pret': 'womens-unstitched-stitched-suits',
  'ready-to-wear-pret': 'womens-unstitched-stitched-suits',
  'festive': 'womens-unstitched-stitched-suits',
  'festive-formals': 'womens-unstitched-stitched-suits',
  'unstitched-luxury': 'womens-unstitched-stitched-suits',
  'suits': 'womens-unstitched-stitched-suits',
  'winter': 'winter-wear-shawls',
  'shawls': 'winter-wear-shawls',
  'menswear': 'mens-clothing',
  'mens-wear': 'mens-clothing',
  'wallets': 'mens-accessories-wallets',
  'bags': 'womens-accessories-bags',
  'fragrance': 'fragrance-perfumes',
  'perfumes': 'fragrance-perfumes',
  'wellness': 'health-fitness-wellness',
  'bath': 'bath-personal-care',
  'home': 'home-living',
  'watches': 'luxury-watches',
  'watch': 'luxury-watches',
  'luxury-watches': 'luxury-watches',
};

export class ProductRepository {
  private static mockProducts: Product[] = SEED_PRODUCTS.map(normalizeProductImages);

  static async getProducts(filters: ProductFilterOptions = {}): Promise<{ products: Product[]; total: number }> {
    const cleanCategorySlug = filters.categorySlug?.toLowerCase().trim();
    const resolvedCategorySlug = cleanCategorySlug ? (CATEGORY_ALIASES[cleanCategorySlug] || cleanCategorySlug) : undefined;
    
    // Resolve target category if slug is provided
    let targetCategory: Category | undefined = undefined;
    if (resolvedCategorySlug || cleanCategorySlug) {
      try {
        const categories = await this.getCategories();
        targetCategory = categories.find(c => 
          c.slug.toLowerCase() === resolvedCategorySlug ||
          c.slug.toLowerCase() === cleanCategorySlug ||
          c.id === cleanCategorySlug
        );
      } catch {}
    }

    // Resolve target brand if slug is provided
    let targetBrand: Brand | undefined = undefined;
    if (filters.brandSlug) {
      try {
        const cleanBrand = filters.brandSlug.toLowerCase().trim();
        const brands = await this.getBrands();
        targetBrand = brands.find(b => b.slug.toLowerCase() === cleanBrand || b.id === cleanBrand);
      } catch {}
    }

    try {
      const shardProducts = await queryAcrossAllShards<Product>(async (supabase) => {
        let query = supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            brand:brands(*),
            images:product_images(*)
          `, { count: 'exact' })
          .eq('is_published', true);

        if (targetCategory) {
          query = query.eq('category_id', targetCategory.id);
        } else if (resolvedCategorySlug) {
          query = query.eq('category_id', resolvedCategorySlug);
        }

        if (targetBrand) {
          query = query.eq('brand_id', targetBrand.id);
        }

        if (filters.isBestDeal) query = query.eq('is_best_deal', true);
        if (filters.isNewArrival) query = query.eq('is_new_arrival', true);
        if (filters.isFeatured) query = query.eq('is_featured', true);
        if (filters.isPopular) query = query.eq('is_popular', true);

        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
        }

        if (filters.minPrice !== undefined) query = query.gte('regular_price', filters.minPrice);
        if (filters.maxPrice !== undefined) query = query.lte('regular_price', filters.maxPrice);

        if (filters.sortBy === 'price_asc') query = query.order('regular_price', { ascending: true });
        else if (filters.sortBy === 'price_desc') query = query.order('regular_price', { ascending: false });
        else query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error || !data) return [];
        return data as Product[];
      }, (items) => {
        // Deduplicate across shards by slug or id and normalize images
        const map = new Map<string, Product>();
        items.forEach(p => map.set(p.slug || p.id, normalizeProductImages(p)));
        let list = Array.from(map.values());

        // Client-side category partition filter to guarantee zero leakage
        if (targetCategory || resolvedCategorySlug || cleanCategorySlug) {
          list = list.filter(p => 
            (targetCategory && (p.category_id === targetCategory.id || p.category?.id === targetCategory.id)) ||
            (resolvedCategorySlug && p.category?.slug?.toLowerCase() === resolvedCategorySlug) ||
            (cleanCategorySlug && p.category?.slug?.toLowerCase() === cleanCategorySlug)
          );
        }

        if (targetBrand || filters.brandSlug) {
          const bSlug = filters.brandSlug?.toLowerCase();
          list = list.filter(p =>
            (targetBrand && (p.brand_id === targetBrand.id || p.brand?.id === targetBrand.id)) ||
            (bSlug && p.brand?.slug?.toLowerCase() === bSlug)
          );
        }

        return list;
      });

      if (Array.isArray(shardProducts)) {
        const offset = filters.offset || 0;
        const limit = filters.limit || 50;
        return {
          products: shardProducts.slice(offset, offset + limit),
          total: shardProducts.length,
        };
      }
    } catch {
      // Fallback to in-memory/seed data
    }

    // Fallback filter logic
    let result = [...this.mockProducts];

    if (targetCategory || resolvedCategorySlug || cleanCategorySlug) {
      result = result.filter(p => 
        (targetCategory && (p.category_id === targetCategory.id || p.category?.id === targetCategory.id)) ||
        (resolvedCategorySlug && p.category?.slug?.toLowerCase() === resolvedCategorySlug) ||
        (cleanCategorySlug && p.category?.slug?.toLowerCase() === cleanCategorySlug)
      );
    }
    if (targetBrand || filters.brandSlug) {
      const bSlug = filters.brandSlug?.toLowerCase();
      result = result.filter(p => 
        (targetBrand && (p.brand_id === targetBrand.id || p.brand?.id === targetBrand.id)) ||
        (bSlug && p.brand?.slug?.toLowerCase() === bSlug)
      );
    }
    if (filters.isBestDeal) {
      result = result.filter(p => p.is_best_deal);
    }
    if (filters.isNewArrival) {
      result = result.filter(p => p.is_new_arrival);
    }
    if (filters.isFeatured) {
      result = result.filter(p => p.is_featured);
    }
    if (filters.isPopular) {
      result = result.filter(p => p.is_popular);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q)
      );
    }
    if (filters.minPrice !== undefined) {
      result = result.filter(p => (p.sale_price ?? p.regular_price) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(p => (p.sale_price ?? p.regular_price) <= filters.maxPrice!);
    }

    if (filters.sortBy === 'price_asc') {
      result.sort((a, b) => (a.sale_price ?? a.regular_price) - (b.sale_price ?? b.regular_price));
    } else if (filters.sortBy === 'price_desc') {
      result.sort((a, b) => (b.sale_price ?? b.regular_price) - (a.sale_price ?? a.regular_price));
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
    }

    const total = result.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;

    return {
      products: result.slice(offset, offset + limit),
      total,
    };
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const cleanSlug = slug.trim();
      const { data: foundProduct } = await findAcrossAllShards<Product>(async (supabase) => {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            brand:brands(*),
            images:product_images(*)
          `)
          .eq('slug', cleanSlug)
          .maybeSingle();

        if (!error && data) return data as Product;
        return null;
      });

      if (foundProduct) return normalizeProductImages(foundProduct);
    } catch {
      // Fallback
    }

    const p = this.mockProducts.find(item => item.slug === slug || item.id === slug);
    return p ? normalizeProductImages(p) : null;
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const cleanId = id.trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
      
      if (isUuid) {
        const { data: foundProduct } = await findAcrossAllShards<Product>(async (supabase) => {
          const { data, error } = await supabase
            .from('products')
            .select(`
              *,
              category:categories(*),
              brand:brands(*),
              images:product_images(*)
            `)
            .eq('id', cleanId)
            .maybeSingle();

          if (!error && data) return data as Product;
          return null;
        });

        if (foundProduct) return normalizeProductImages(foundProduct);
      }
    } catch {
      // Fallback
    }

    const fallbackProduct = this.mockProducts.find(item => item.id === id || item.slug === id || item.sku === id);
    return fallbackProduct ? normalizeProductImages(fallbackProduct) : null;
  }


  static async createProduct(product: Partial<Product>, imageUrls: string[] = []): Promise<Product> {
    const newProduct: Product = {
      id: product.id || `prod-${Date.now()}`,
      name: product.name || 'Untitled Product',
      slug: product.slug || `product-${Date.now()}`,
      sku: product.sku || `SKU-${Date.now()}`,
      short_description: product.short_description || '',
      full_description: product.full_description || '',
      regular_price: Number(product.regular_price) || 0,
      sale_price: product.sale_price ? Number(product.sale_price) : null,
      cost_price: Number(product.cost_price) || 0,
      stock_quantity: Number(product.stock_quantity) || 0,
      stock_status: (product.stock_quantity || 0) > 0 ? 'in_stock' : 'out_of_stock',
      low_stock_threshold: product.low_stock_threshold || 5,
      category_id: product.category_id || null,
      brand_id: product.brand_id || null,
      weight: product.weight || null,
      dimensions: product.dimensions || null,
      is_featured: !!product.is_featured,
      is_best_deal: !!product.is_best_deal,
      is_new_arrival: !!product.is_new_arrival,
      is_popular: !!product.is_popular,
      is_published: product.is_published !== false,
      view_count: 0,
      seo_title: product.seo_title || null,
      seo_description: product.seo_description || null,
      created_at: new Date().toISOString(),
      images: imageUrls.map((url, idx) => ({
        id: `img-${Date.now()}-${idx}`,
        image_url: url,
        sort_order: idx + 1,
        is_primary: idx === 0,
        alt_text: product.name,
      })),
    };

    try {
      const supabase = createAdminClient();
      const { data: dbProduct, error } = await supabase
        .from('products')
        .insert({
          name: newProduct.name,
          slug: newProduct.slug,
          sku: newProduct.sku,
          short_description: newProduct.short_description,
          full_description: newProduct.full_description,
          regular_price: newProduct.regular_price,
          sale_price: newProduct.sale_price,
          cost_price: newProduct.cost_price,
          stock_quantity: newProduct.stock_quantity,
          stock_status: newProduct.stock_status,
          category_id: newProduct.category_id,
          brand_id: newProduct.brand_id,
          is_featured: newProduct.is_featured,
          is_best_deal: newProduct.is_best_deal,
          is_new_arrival: newProduct.is_new_arrival,
          is_published: newProduct.is_published,
        })
        .select()
        .single();

      if (!error && dbProduct) {
        if (imageUrls.length > 0) {
          const imgInserts = imageUrls.map((url, idx) => ({
            product_id: dbProduct.id,
            image_url: url,
            sort_order: idx + 1,
            is_primary: idx === 0,
          }));
          await supabase.from('product_images').insert(imgInserts);
        }
        return dbProduct as Product;
      }
    } catch {
      // Fallback
    }

    this.mockProducts.unshift(newProduct);
    return newProduct;
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.slug !== undefined) updateData.slug = updates.slug;
      if (updates.sku !== undefined) updateData.sku = updates.sku;
      if (updates.regular_price !== undefined) updateData.regular_price = Number(updates.regular_price);
      if (updates.sale_price !== undefined) updateData.sale_price = updates.sale_price === null ? null : Number(updates.sale_price);
      if (updates.stock_quantity !== undefined) updateData.stock_quantity = Number(updates.stock_quantity);
      if (updates.short_description !== undefined) updateData.short_description = updates.short_description;
      if (updates.full_description !== undefined) updateData.full_description = updates.full_description;
      if (updates.is_featured !== undefined) updateData.is_featured = updates.is_featured;
      if (updates.is_best_deal !== undefined) updateData.is_best_deal = updates.is_best_deal;
      if (updates.is_new_arrival !== undefined) updateData.is_new_arrival = updates.is_new_arrival;
      if (updates.has_sizes !== undefined) updateData.has_sizes = updates.has_sizes;
      if (updates.available_sizes !== undefined) updateData.available_sizes = updates.available_sizes;
      if (updates.size_chart !== undefined) updateData.size_chart = updates.size_chart;
      if (updates.size_stock !== undefined) updateData.size_stock = updates.size_stock;

      const shards = getAllAdminClients();
      let lastUpdatedProduct: Product | null = null;

      for (const { client } of shards) {
        // Find product by id, sku, or slug
        const targetIdentifier = updates.sku || updates.slug || id;
        const { data: dbProduct, error } = await client
          .from('products')
          .update(updateData)
          .or(`id.eq.${id},sku.eq.${targetIdentifier},slug.eq.${targetIdentifier}`)
          .select(`
            *,
            category:categories(*),
            brand:brands(*),
            images:product_images(*)
          `)
          .maybeSingle();

        if (!error && dbProduct) {
          lastUpdatedProduct = dbProduct as Product;
        }
      }

      if (lastUpdatedProduct) {
        const idx = this.mockProducts.findIndex(p => p.id === id || p.slug === updates.slug || p.sku === updates.sku);
        if (idx > -1) {
          this.mockProducts[idx] = { ...this.mockProducts[idx], ...lastUpdatedProduct };
        }
        return lastUpdatedProduct;
      }
    } catch (err) {
      console.error('Failed to update product in shards:', err);
    }

    const idx = this.mockProducts.findIndex(p => p.id === id || p.slug === id || p.sku === id);
    if (idx > -1) {
      this.mockProducts[idx] = {
        ...this.mockProducts[idx],
        ...updates,
        regular_price: updates.regular_price !== undefined ? Number(updates.regular_price) : this.mockProducts[idx].regular_price,
        sale_price: updates.sale_price !== undefined ? (updates.sale_price === null ? null : Number(updates.sale_price)) : this.mockProducts[idx].sale_price,
        has_sizes: updates.has_sizes !== undefined ? updates.has_sizes : this.mockProducts[idx].has_sizes,
        available_sizes: updates.available_sizes !== undefined ? updates.available_sizes : this.mockProducts[idx].available_sizes,
        size_chart: updates.size_chart !== undefined ? updates.size_chart : this.mockProducts[idx].size_chart,
        size_stock: updates.size_stock !== undefined ? updates.size_stock : this.mockProducts[idx].size_stock,
        updated_at: new Date().toISOString(),
      };
      return this.mockProducts[idx];
    }
    return null;
  }

  static async getCategories(): Promise<Category[]> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) return data as Category[];
    } catch {
      // Fallback
    }

    return SEED_CATEGORIES;
  }

  static async getBrands(): Promise<Brand[]> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) return data as Brand[];
    } catch {
      // Fallback
    }

    return SEED_BRANDS;
  }
}
