'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/database';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  unitPrice?: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mfe_cart');
      if (saved) setItems(JSON.parse(saved));
      const savedCoupon = localStorage.getItem('mfe_coupon');
      if (savedCoupon) setCouponCode(savedCoupon);
    } catch {}
    setIsLoaded(true);
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('mfe_cart', JSON.stringify(newItems));
    } catch {}
  };

  const addToCart = (
    product: Product, 
    quantity = 1,
    variant?: { size?: string; color?: string; price?: number }
  ) => {
    const existingIndex = items.findIndex(i => 
      i.product.id === product.id &&
      i.selectedSize === variant?.size &&
      i.selectedColor === variant?.color
    );
    let updated = [...items];
    const unitPrice = variant?.price ?? (product.sale_price ?? product.regular_price);
    if (existingIndex > -1) {
      updated[existingIndex].quantity += quantity;
    } else {
      updated.push({ 
        product, 
        quantity,
        selectedSize: variant?.size,
        selectedColor: variant?.color,
        unitPrice,
      });
    }
    saveCart(updated);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = items.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = items.filter(item => item.product.id !== productId);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    setCouponCode('');
    setCouponDiscount(0);
    try {
      localStorage.removeItem('mfe_cart');
      localStorage.removeItem('mfe_coupon');
    } catch {}
  };

  const subtotal = items.reduce((sum, item) => {
    const price = item.unitPrice ?? (item.product.sale_price ?? item.product.regular_price);
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal >= 5000 || subtotal === 0 ? 0 : 250;
  const grandTotal = Math.max(0, subtotal - couponDiscount + shipping);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, message: 'Please enter a coupon code.' };

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean, subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponCode(clean);
        setCouponDiscount(data.discountAmount);
        localStorage.setItem('mfe_coupon', clean);
        return { success: true, message: `Coupon ${clean} applied! You saved Rs. ${data.discountAmount}` };
      }
      return { success: false, message: data.error || 'Invalid or expired coupon.' };
    } catch {
      // Fallback
      if (clean === 'MFE10') {
        const disc = Math.round(subtotal * 0.1);
        setCouponCode('MFE10');
        setCouponDiscount(disc);
        return { success: true, message: `Coupon MFE10 applied! 10% discount added.` };
      }
      return { success: false, message: 'Invalid coupon code.' };
    }
  };

  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    isLoaded,
    subtotal,
    shipping,
    grandTotal,
    couponCode,
    couponDiscount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
  };
}
