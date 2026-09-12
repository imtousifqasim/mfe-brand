'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/database';

export function useWishlist() {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mfe_wishlist');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setIsLoaded(true);
  }, []);

  const saveWishlist = (newItems: Product[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('mfe_wishlist', JSON.stringify(newItems));
    } catch {}
  };

  const toggleWishlist = (product: Product) => {
    const exists = items.some(p => p.id === product.id);
    let updated: Product[];
    if (exists) {
      updated = items.filter(p => p.id !== product.id);
    } else {
      updated = [...items, product];
    }
    saveWishlist(updated);
    return !exists;
  };

  const isInWishlist = (productId: string) => {
    return items.some(p => p.id === productId);
  };

  const removeFromWishlist = (productId: string) => {
    saveWishlist(items.filter(p => p.id !== productId));
  };

  return {
    items,
    itemCount: items.length,
    isLoaded,
    toggleWishlist,
    isInWishlist,
    removeFromWishlist,
  };
}
