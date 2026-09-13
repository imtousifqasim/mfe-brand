'use client';

import React, { useState, useEffect } from 'react';
import { Star, Check, X, ShieldCheck, MessageSquare, RefreshCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';

interface ReviewItem {
  id: string;
  product_id: string;
  product_name?: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  is_verified: boolean;
  created_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; reviewId: string; author: string }>({
    isOpen: false,
    reviewId: '',
    author: '',
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        setBannerMsg({
          type: 'success',
          text: newStatus === 'approved' 
            ? 'Review approved! It is now visible to all shoppers on the product page.'
            : 'Review rejected and hidden from the storefront.',
        });
      } else {
        setBannerMsg({ type: 'error', text: 'Failed to update review status.' });
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Network error updating review.' });
    } finally {
      setTimeout(() => setBannerMsg(null), 4000);
    }
  };

  const confirmDelete = async () => {
    const { reviewId } = deleteModal;
    setDeleteModal({ isOpen: false, reviewId: '', author: '' });

    try {
      const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(reviewId)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        setBannerMsg({ type: 'success', text: 'Review permanently removed.' });
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Error deleting review.' });
    } finally {
      setTimeout(() => setBannerMsg(null), 4000);
    }
  };

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;

  const filteredReviews = reviews.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-6 font-sans pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-amber-500" />
            <span>Customer Reviews Moderation ({reviews.length})</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Moderate and approve clientele reviews. Approved reviews instantly appear on the product page.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReviews}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition self-start sm:self-auto"
          title="Refresh Reviews"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Global Status Banner */}
      {bannerMsg && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border shadow-md animate-in fade-in duration-200 ${
          bannerMsg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {bannerMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{bannerMsg.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filter === 'all' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          All ({reviews.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filter === 'pending' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <span>Pending Moderation</span>
          {pendingCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter('approved')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filter === 'approved' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Approved Live ({approvedCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter('rejected')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filter === 'rejected' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Rejected ({reviews.filter(r => r.status === 'rejected').length})
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-500 mx-auto mb-2" />
            <span>Loading reviews from database...</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400">
            No customer reviews found matching filter &quot;{filter}&quot;.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{r.customer_name}</span>
                  {r.is_verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" /> Verified Patron
                    </span>
                  )}
                  <span className="text-xs text-slate-500">• {formatDate(r.created_at)}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-2 ${
                    r.status === 'approved' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : r.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {r.status}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-slate-700'}`} />
                  ))}
                  <span className="font-bold text-xs text-white ml-2">{r.title}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  &quot;{r.content}&quot;
                </p>

                {r.product_name && (
                  <p className="text-[11px] text-slate-400 pt-1">
                    <span className="text-slate-500">Product:</span> <strong className="text-slate-300">{r.product_name}</strong>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {r.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(r.id, 'approved')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Review</span>
                  </button>
                )}

                {r.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(r.id, 'rejected')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: true, reviewId: r.id, author: r.customer_name })}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AdminConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Review"
        message={`Are you sure you want to permanently delete this review by ${deleteModal.author}?`}
        confirmText="Delete Review"
        variant="danger"
        onConfirm={confirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, reviewId: '', author: '' })}
      />

    </div>
  );
}
