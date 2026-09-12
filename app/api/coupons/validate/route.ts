import { NextResponse } from 'next/server';
import { CouponRepository } from '@/repositories/coupon.repository';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required.' }, { status: 400 });
    }

    const coupon = await CouponRepository.getCouponByCode(code);
    if (!coupon || !coupon.is_active) {
      return NextResponse.json({ success: false, error: 'Invalid or inactive coupon code.' }, { status: 400 });
    }

    const total = Number(subtotal) || 0;
    if (coupon.minimum_spend && total < coupon.minimum_spend) {
      return NextResponse.json({
        success: false,
        error: `Coupon requires a minimum order of Rs. ${coupon.minimum_spend}.`,
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((total * coupon.discount_value) / 100);
      if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
        discountAmount = coupon.maximum_discount;
      }
    } else {
      discountAmount = Math.min(coupon.discount_value, total);
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
      },
      discountAmount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Error validating coupon.' }, { status: 500 });
  }
}
