'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/database';

export interface CartItem {
  cartItemId: string; // Unique cart item identifier
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  unitPrice?: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  isLoaded: boolean;
  subtotal: number;
  shipping: number;
  grandTotal: number;
  couponCode: string;
  couponDiscount: number;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addToCart: (
    product: Product, 
    quantity?: number, 
    variant?: { size?: string; color?: string; price?: number },
    showDrawer?: boolean
  ) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Helper to generate a unique stable key for a variant
  const getCartItemId = (productId: string, size?: string, color?: string): string => {
    return `${productId}_${size || 'std'}_${color || 'std'}`;
  };

  // Load cart from localStorage on mount & normalize cartItemId
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mfe_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const normalized: CartItem[] = parsed.map((item: any) => ({
            ...item,
            cartItemId: item.cartItemId || getCartItemId(item.product.id, item.selectedSize, item.selectedColor),
          }));
          setItems(normalized);
        }
      }
      const savedCoupon = localStorage.getItem('mfe_coupon');
      if (savedCoupon) {
        setCouponCode(savedCoupon);
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  const openCartDrawer = useCallback(() => {
    setIsCartDrawerOpen(true);
  }, []);

  const closeCartDrawer = useCallback(() => {
    setIsCartDrawerOpen(false);
  }, []);

  const addToCart = useCallback((
    product: Product, 
    quantity = 1,
    variant?: { size?: string; color?: string; price?: number },
    showDrawer = true
  ) => {
    const itemKey = getCartItemId(product.id, variant?.size, variant?.color);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(i => 
        (i.cartItemId && i.cartItemId === itemKey) ||
        (i.product.id === product.id &&
         i.selectedSize === variant?.size &&
         i.selectedColor === variant?.color)
      );
      
      let updated = [...prevItems];
      const unitPrice = variant?.price ?? (product.sale_price ?? product.regular_price);
      
      if (existingIndex > -1) {
        updated[existingIndex] = {
          ...updated[existingIndex],
          cartItemId: itemKey,
          quantity: updated[existingIndex].quantity + quantity,
        };
      } else {
        updated.push({ 
          cartItemId: itemKey,
          product, 
          quantity,
          selectedSize: variant?.size,
          selectedColor: variant?.color,
          unitPrice,
        });
      }
      
      try {
        localStorage.setItem('mfe_cart', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (showDrawer) {
      setIsCartDrawerOpen(true);
    }
  }, []);

  const updateQuantity = useCallback((cartItemIdOrProductId: string, quantity: number) => {
    setItems((prevItems) => {
      if (quantity <= 0) {
        const updated = prevItems.filter(item => {
          const key = item.cartItemId || getCartItemId(item.product.id, item.selectedSize, item.selectedColor);
          return key !== cartItemIdOrProductId && item.product.id !== cartItemIdOrProductId;
        });
        try {
          localStorage.setItem('mfe_cart', JSON.stringify(updated));
        } catch {}
        return updated;
      }
      
      const updated = prevItems.map(item => {
        const key = item.cartItemId || getCartItemId(item.product.id, item.selectedSize, item.selectedColor);
        if (key === cartItemIdOrProductId || item.product.id === cartItemIdOrProductId) {
          return { ...item, quantity };
        }
        return item;
      });
      
      try {
        localStorage.setItem('mfe_cart', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Remove ONLY the targeted cart item (fixing the dual deletion bug)
  const removeFromCart = useCallback((cartItemIdOrProductId: string) => {
    setItems((prevItems) => {
      // If we find an item with exact cartItemId, remove only that one!
      const hasExactMatch = prevItems.some(i => i.cartItemId === cartItemIdOrProductId);
      
      let updated: CartItem[];
      if (hasExactMatch) {
        updated = prevItems.filter(item => item.cartItemId !== cartItemIdOrProductId);
      } else {
        // Fallback: Remove only the first matching item by product.id to never delete multiple items at once
        let removed = false;
        updated = prevItems.filter(item => {
          if (!removed && (item.product.id === cartItemIdOrProductId || item.cartItemId === cartItemIdOrProductId)) {
            removed = true;
            return false;
          }
          return true;
        });
      }

      try {
        localStorage.setItem('mfe_cart', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponCode('');
    setCouponDiscount(0);
    try {
      localStorage.removeItem('mfe_cart');
      localStorage.removeItem('mfe_coupon');
    } catch {}
  }, []);

  const subtotal = items.reduce((sum, item) => {
    const price = item.unitPrice ?? (item.product.sale_price ?? item.product.regular_price);
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal >= 5000 || subtotal === 0 ? 0 : 250;
  const grandTotal = Math.max(0, subtotal - couponDiscount + shipping);

  const applyCoupon = useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
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
      if (clean === 'MFE10') {
        const disc = Math.round(subtotal * 0.1);
        setCouponCode('MFE10');
        setCouponDiscount(disc);
        return { success: true, message: 'Coupon MFE10 applied! 10% discount added.' };
      }
      return { success: false, message: 'Invalid coupon code.' };
    }
  }, [subtotal]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        isLoaded,
        subtotal,
        shipping,
        grandTotal,
        couponCode,
        couponDiscount,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
