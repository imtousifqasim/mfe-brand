import { NextRequest, NextResponse } from 'next/server';
import { queryAcrossAllShards, getAllAdminClients } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    const reviews = await queryAcrossAllShards<any>(async (supabase) => {
      let q = supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (productId) {
        q = q.eq('product_id', productId);
      }

      const { data, error } = await q;
      if (error || !data) return [];
      return data;
    }, (items) => {
      const map = new Map<string, any>();
      items.forEach(r => map.set(r.id, r));
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return NextResponse.json({
      success: true,
      reviews: reviews || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, productName, customerName, customerEmail, rating, title, content } = body;

    if (!productId || !customerName || !rating || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Please complete all review fields and rating.' },
        { status: 400 }
      );
    }

    const shards = getAllAdminClients();
    let createdReview: any = null;

    for (const { client } of shards) {
      const { data, error } = await client
        .from('reviews')
        .insert({
          product_id: productId,
          product_name: productName || 'Atelier Product',
          customer_name: customerName.trim(),
          customer_email: customerEmail ? customerEmail.trim().toLowerCase() : null,
          rating: Math.min(5, Math.max(1, Number(rating))),
          title: title.trim(),
          content: content.trim(),
          status: 'pending',
          is_verified: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (!error && data) {
        createdReview = data;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your patronage review has been submitted for verification.',
      review: createdReview,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}
