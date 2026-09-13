import { ProductRepository } from '@/repositories/product.repository';
import { OrderRepository } from '@/repositories/order.repository';
import { CouponRepository } from '@/repositories/coupon.repository';
import { EmailService } from '@/services/email.service';
import { getAllAdminClients, getActiveWriteAdmin } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';
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
  createAccount?: boolean;
  password?: string;
  username?: string;
}

export class CheckoutService {
  static async processCheckout(req: CheckoutRequest): Promise<{ 
    success: boolean; 
    order?: Order; 
    error?: string; 
    customerId?: string | null;
    customer?: any;
  }> {
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

    // 4. Handle Account Creation or Existing Customer Detection
    let finalCustomerId = req.customerId || null;
    let customerObj: any = null;

    try {
      const cleanEmail = req.customerEmail.toLowerCase().trim();
      const cleanName = req.customerName.trim();
      const cleanPhone = (req.customerPhone || '').trim();
      const cleanUsername = (req.username || '').trim() || cleanEmail;
      const supabase = getActiveWriteAdmin();

      // Check if customer exists in DB
      const { data: existing } = await supabase
        .from('customers')
        .select('id, email, full_name, phone, tier')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existing) {
        finalCustomerId = existing.id;
        customerObj = existing;
      } else if (req.createAccount && req.password) {
        const password_hash = await bcrypt.hash(req.password, 10);
        const shards = getAllAdminClients();

        for (const { client } of shards) {
          const { data, error } = await client
            .from('customers')
            .insert({
              email: cleanEmail,
              password_hash,
              full_name: cleanName,
              phone: cleanPhone || null,
              username: cleanUsername,
              tier: 'Patron Member',
            })
            .select('id, email, full_name, phone, username, tier')
            .maybeSingle();

          if (!error && data) {
            customerObj = data;
            finalCustomerId = data.id;
          }
        }

        if (customerObj) {
          // Dispatch Branded Haute Couture Welcome & Credentials Email
          await EmailService.sendAccountCreated({
            full_name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            username: cleanUsername,
          }, req.password);
        }
      }
    } catch (accErr) {
      console.error('Error during checkout customer resolution:', accErr);
    }

    // 5. Create Order Atomically
    const order = await OrderRepository.createOrder({
      customerId: finalCustomerId,
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

    // 6. Send Email Confirmation
    await EmailService.sendOrderConfirmation(order);

    return { 
      success: true, 
      order, 
      customerId: finalCustomerId,
      customer: customerObj,
    };
  }
}
