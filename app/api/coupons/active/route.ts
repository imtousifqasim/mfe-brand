import { NextResponse } from 'next/server';
import { queryAcrossAllShards } from '@/lib/supabase/admin';
import { Coupon } from '@/types/database';

export async function GET() {
  try {
    const activeCoupons = await queryAcrossAllShards<Coupon>(async (supabase) => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
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
      coupons: activeCoupons || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch active coupons' },
      { status: 500 }
    );
  }
}
