'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationProgressBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2.5px] bg-neutral-900 overflow-hidden pointer-events-none">
      <div className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 animate-[progress_0.35s_ease-in-out_forwards] shadow-[0_0_12px_rgba(245,215,127,0.8)]" />
    </div>
  );
}
