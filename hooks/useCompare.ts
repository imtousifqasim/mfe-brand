'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/database';

export function useCompare() {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mfe_compare');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setIsLoaded(true);
  }, []);

  const saveCompare = (newItems: Product[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('mfe_compare', JSON.stringify(newItems));
    } catch {}
  };

  const addToCompare = (product: Product): { success: boolean; message: string } => {
    if (items.some(p => p.id === product.id)) {
      return { success: false, message: 'Product is already in comparison list.' };
    }
    if (items.length >= 4) {
      return { success: false, message: 'You can compare a maximum of 4 products at a time.' };
    }
    const updated = [...items, product];
    saveCompare(updated);
    return { success: true, message: `Added "${product.name}" to comparison.` };
  };

  const removeFromCompare = (productId: string) => {
    saveCompare(items.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    saveCompare([]);
  };

  return {
    items,
    itemCount: items.length,
    isLoaded,
    addToCompare,
    removeFromCompare,
    clearCompare,
  };
}
