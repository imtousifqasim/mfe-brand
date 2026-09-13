import { createAdminClient, queryAcrossAllShards, findAcrossAllShards, getActiveWriteAdmin } from '@/lib/supabase/admin';
import { Product, Category, Brand } from '@/types/database';
import { SEED_PRODUCTS, SEED_CATEGORIES, SEED_BRANDS } from '@/lib/data/seed-data';

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

export class ProductRepository {
  private static mockProducts: Product[] = [...SEED_PRODUCTS];

  static async getProducts(filters: ProductFilterOptions = {}): Promise<{ products: Product[]; total: number }> {
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
        // Deduplicate across shards by slug or id
        const map = new Map<string, Product>();
        items.forEach(p => map.set(p.slug || p.id, p));
        return Array.from(map.values());
      });

      if (shardProducts && shardProducts.length > 0) {
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

    if (filters.categorySlug) {
      result = result.filter(p => p.category?.slug === filters.categorySlug);
    }
    if (filters.brandSlug) {
      result = result.filter(p => p.brand?.slug === filters.brandSlug);
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

      if (foundProduct) return foundProduct;
    } catch {
      // Fallback
    }

    const p = this.mockProducts.find(item => item.slug === slug || item.id === slug);
    return p || null;
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

        if (foundProduct) return foundProduct;
      }
    } catch {
      // Fallback
    }

    return this.mockProducts.find(item => item.id === id || item.slug === id || item.sku === id) || null;
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
      const supabase = createAdminClient();
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

      const { data: dbProduct, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          category:categories(*),
          brand:brands(*),
          images:product_images(*)
        `)
        .single();

      if (!error && dbProduct) {
        const idx = this.mockProducts.findIndex(p => p.id === id);
        if (idx > -1) this.mockProducts[idx] = { ...this.mockProducts[idx], ...(dbProduct as Product) };
        return dbProduct as Product;
      }
    } catch {
      // Fallback
    }

    const idx = this.mockProducts.findIndex(p => p.id === id);
    if (idx > -1) {
      this.mockProducts[idx] = {
        ...this.mockProducts[idx],
        ...updates,
        regular_price: updates.regular_price !== undefined ? Number(updates.regular_price) : this.mockProducts[idx].regular_price,
        sale_price: updates.sale_price !== undefined ? (updates.sale_price === null ? null : Number(updates.sale_price)) : this.mockProducts[idx].sale_price,
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
