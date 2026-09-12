'use client';

import React, { useState } from 'react';
import { Star, Check, X, ShieldCheck, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ReviewItem {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
  date: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      productName: 'Royal Velvet Embroidered 3-Piece Suit',
      customerName: 'Fatima Sheikh',
      rating: 5,
      title: 'Stunning Embroidery & Luxurious Feel',
      content: 'Ordered this for wedding festivities. The fabric drape is royal and exactly as described.',
      status: 'approved',
      isVerified: true,
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'rev-2',
      productName: 'Artisanal Jacquard Unstitched 3-Piece',
      customerName: 'Amina Tariq',
      rating: 5,
      title: 'Lovely color combination',
      content: 'The jacquard fabric feels very soft, and the digital chiffon dupatta is featherlight.',
      status: 'pending',
      isVerified: true,
      date: new Date().toISOString(),
    },
    {
      id: 'rev-3',
      productName: 'Royal Men Egyptian Cotton Kurta Set',
      customerName: 'Usman Ali',
      rating: 4,
      title: 'Good cotton quality',
      content: 'Slightly long sleeves for my height, but tailor fixed it easily. Fabric is top notch.',
      status: 'pending',
      isVerified: false,
      date: new Date().toISOString(),
    }
  ]);

  const updateStatus = (id: string, newStatus: 'approved' | 'rejected') => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Customer Reviews Moderation ({reviews.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review and approve customer ratings. Only APPROVED reviews appear publicly on product pages.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{r.customerName}</span>
                {r.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3" /> Verified Purchase
                  </span>
                )}
                <span className="text-xs text-slate-500">• {formatDate(r.date)}</span>
              </div>

              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-slate-700'}`} />
                ))}
                <span className="font-bold text-xs text-white ml-2">{r.title}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                "{r.content}"
              </p>

              <div className="text-[11px] text-slate-400">
                Product: <span className="font-bold text-slate-300">{r.productName}</span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                r.status === 'approved'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : r.status === 'rejected'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {r.status}
              </span>

              <div className="flex items-center gap-2">
                {r.status !== 'approved' && (
                  <button
                    onClick={() => updateStatus(r.id, 'approved')}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                    title="Approve Review"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button
                    onClick={() => updateStatus(r.id, 'rejected')}
                    className="inline-flex items-center gap-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs px-3 py-1.5 rounded-lg transition"
                    title="Reject Review"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
