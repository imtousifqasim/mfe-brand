import { ProductRepository } from '@/repositories/product.repository';
import { OrderRepository } from '@/repositories/order.repository';
import { CouponRepository } from '@/repositories/coupon.repository';
import { EmailService } from '@/services/email.service';
import { Order, OrderAddress, PaymentMethodCode } from '@/types/database';

export interface CheckoutItemRequest {
  productId: string;
  quantity: number;
}

export interface CheckoutRequest {
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CheckoutItemRequest[];
  couponCode?: string;
  paymentMethod: PaymentMethodCode;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  notes?: string;
}

export class CheckoutService {
  static async processCheckout(req: CheckoutRequest): Promise<{ success: boolean; order?: Order; error?: string }> {
    if (!req.items || req.items.length === 0) {
      return { success: false, error: 'Your cart is empty.' };
    }

    if (!req.customerName || !req.customerEmail || !req.customerPhone) {
      return { success: false, error: 'Customer contact information is incomplete.' };
    }

    if (!req.shippingAddress?.address_line1 || !req.shippingAddress?.city) {
      return { success: false, error: 'Shipping address is incomplete.' };
    }

    // 1. Fetch live products from database (NEVER TRUST CLIENT PRICES)
    let subtotal = 0;
    const validatedItems = [];

    for (const item of req.items) {
      const product = await ProductRepository.getProductById(item.productId);
      if (!product) {
        return { success: false, error: `Product not found or unavailable.` };
      }

      if (product.stock_quantity < item.quantity) {
        return { success: false, error: `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}.` };
      }

      const activePrice = product.sale_price !== null && product.sale_price !== undefined 
        ? product.sale_price 
        : product.regular_price;

      const itemSubtotal = activePrice * item.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: activePrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        imageUrl: product.images?.[0]?.image_url || null,
      });
    }

    // 2. Validate Coupon Server-side
    let discountAmount = 0;
    if (req.couponCode) {
      const coupon = await CouponRepository.getCouponByCode(req.couponCode);
      if (coupon && coupon.is_active) {
        if (!coupon.minimum_spend || subtotal >= coupon.minimum_spend) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = (subtotal * coupon.discount_value) / 100;
            if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
              discountAmount = coupon.maximum_discount;
            }
          } else {
            discountAmount = Math.min(coupon.discount_value, subtotal);
          }
        }
      }
    }

    // 3. Calculate Shipping (Free above PKR 5,000; otherwise PKR 250 standard courier delivery)
    const shippingAmount = subtotal >= 5000 ? 0 : 250;
    const grandTotal = Math.max(0, subtotal - discountAmount + shippingAmount);

    // 4. Create Order Atomically
    const order = await OrderRepository.createOrder({
      customerId: req.customerId,
      customerEmail: req.customerEmail.trim(),
      customerPhone: req.customerPhone.trim(),
      customerName: req.customerName.trim(),
      subtotal,
      discountAmount,
      shippingAmount,
      grandTotal,
      couponCode: req.couponCode || null,
      paymentMethod: req.paymentMethod,
      items: validatedItems,
      shippingAddress: req.shippingAddress,
      billingAddress: req.billingAddress || req.shippingAddress,
      notes: req.notes,
    });

    // 5. Send Email Confirmation
    await EmailService.sendOrderConfirmation(order);

    return { success: true, order };
  }
}
