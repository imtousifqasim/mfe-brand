import { NextRequest, NextResponse } from 'next/server';
import { ProductRepository } from '@/repositories/product.repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '8', 10), 20);

    if (!query.trim()) {
      return NextResponse.json({ products: [], total: 0 });
    }

    const { products, total } = await ProductRepository.getProducts({
      search: query.trim(),
      limit,
    });

    const mapped = products.map((p) => {
      const primaryImage =
        p.images?.find((img) => img.is_primary)?.image_url ||
        p.images?.[0]?.image_url ||
        null;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        regular_price: p.regular_price,
        sale_price: p.sale_price,
        image: primaryImage,
        category: p.category?.name || null,
        category_slug: p.category?.slug || null,
        stock_status: p.stock_status || 'in_stock',
        is_best_deal: p.is_best_deal || false,
      };
    });

    return NextResponse.json({ products: mapped, total });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search products', products: [], total: 0 },
      { status: 500 }
    );
  }
}
