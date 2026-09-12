import { createAdminClient } from '@/lib/supabase/admin';
import { Coupon } from '@/types/database';

export class CouponRepository {
  private static mockCoupons: Coupon[] = [
    {
      id: 'cp-1',
      code: 'MFE10',
      description: '10% Welcome Discount for MFE Brand Shoppers',
      discount_type: 'percentage',
      discount_value: 10,
      minimum_spend: 3000,
      maximum_discount: 1500,
      is_active: true,
    },
    {
      id: 'cp-2',
      code: 'FLAT500',
      description: 'Flat PKR 500 discount on orders above PKR 5,000',
      discount_type: 'fixed_amount',
      discount_value: 500,
      minimum_spend: 5000,
      maximum_discount: 500,
      is_active: true,
    }
  ];

  static async getCouponByCode(code: string): Promise<Coupon | null> {
    const cleanCode = code.trim().toUpperCase();
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (!error && data) return data as Coupon;
    } catch {
      // Fallback
    }

    const c = this.mockCoupons.find(item => item.code.toUpperCase() === cleanCode && item.is_active);
    return c || null;
  }

  static async listCoupons(): Promise<Coupon[]> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Coupon[];
    } catch {
      // Fallback
    }
    return this.mockCoupons;
  }

  static async createCoupon(couponData: Partial<Coupon>): Promise<Coupon> {
    const newCoupon: Coupon = {
      id: `cp-${Date.now()}`,
      code: (couponData.code || 'COUPON').trim().toUpperCase(),
      description: couponData.description || '',
      discount_type: couponData.discount_type || 'percentage',
      discount_value: Number(couponData.discount_value) || 10,
      minimum_spend: Number(couponData.minimum_spend) || 0,
      maximum_discount: couponData.maximum_discount ? Number(couponData.maximum_discount) : null,
      is_active: couponData.is_active !== false,
    };

    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('coupons').insert(newCoupon).select().single();
      if (!error && data) return data as Coupon;
    } catch {
      // Fallback
    }

    this.mockCoupons.unshift(newCoupon);
    return newCoupon;
  }
}
