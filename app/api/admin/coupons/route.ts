import { NextRequest, NextResponse } from 'next/server';
import { queryAcrossAllShards, getAllAdminClients } from '@/lib/supabase/admin';
import { Coupon } from '@/types/database';

export async function GET() {
  try {
    const coupons = await queryAcrossAllShards<Coupon>(async (supabase) => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data as Coupon[];
    }, (items) => {
      const map = new Map<string, Coupon>();
      items.forEach(c => map.set(c.code.toUpperCase(), c));
      return Array.from(map.values());
    });

    return NextResponse.json({
      success: true,
      coupons: coupons || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, description, discount_type, discount_value, minimum_spend, maximum_discount, is_active } = body;

    if (!code || !discount_value) {
      return NextResponse.json({ success: false, error: 'Coupon code and discount value are required' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const shards = getAllAdminClients();
    let createdCoupon: any = null;

    for (const { client } of shards) {
      const { data, error } = await client
        .from('coupons')
        .upsert({
          code: cleanCode,
          description: description || '',
          discount_type: discount_type || 'percentage',
          discount_value: Number(discount_value),
          minimum_spend: Number(minimum_spend) || 0,
          maximum_discount: maximum_discount ? Number(maximum_discount) : null,
          is_active: is_active ?? true,
          created_at: new Date().toISOString(),
        }, { onConflict: 'code' })
        .select()
        .maybeSingle();

      if (!error && data) {
        createdCoupon = data;
      }
    }

    return NextResponse.json({
      success: true,
      coupon: createdCoupon,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const code = searchParams.get('code');

    if (!id && !code) {
      return NextResponse.json({ success: false, error: 'Coupon id or code is required' }, { status: 400 });
    }

    const shards = getAllAdminClients();
    let anyDeleted = false;

    for (const { client } of shards) {
      if (id) {
        const { error } = await client.from('coupons').delete().eq('id', id);
        if (!error) anyDeleted = true;
      }
      if (code) {
        const { error } = await client.from('coupons').delete().eq('code', code.toUpperCase());
        if (!error) anyDeleted = true;
      }
    }

    return NextResponse.json({ success: anyDeleted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
