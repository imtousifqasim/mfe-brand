'use client';

import React, { useState, useEffect } from 'react';
import { SEED_HERO_SLIDES, SEED_ANNOUNCEMENT } from '@/lib/data/seed-data';
import { HeroSlide } from '@/types/database';
import { ExternalImage } from '@/components/media/ExternalImage';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Megaphone, 
  MessageCircle, 
  Tag, 
  ListPlus,
  Sparkles
} from 'lucide-react';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';

export default function AdminHomepageCMSPage() {
  const [slides, setSlides] = useState<HeroSlide[]>(SEED_HERO_SLIDES);
  const [announcement, setAnnouncement] = useState(SEED_ANNOUNCEMENT.message);
  const [couponCode, setCouponCode] = useState(SEED_ANNOUNCEMENT.coupon_code || 'MFE10');
  const [whatsappNumber, setWhatsappNumber] = useState(SEED_ANNOUNCEMENT.whatsapp_number || '+92 300 1234567');
  const [isActive, setIsActive] = useState(true);
  const [tickerMessages, setTickerMessages] = useState<string[]>([
    'Complimentary Express Nationwide Delivery on orders over PKR 5,000',
    'Haute Couture 2026: Pure Handcrafted Lawn, Silk & Chiffon Heirlooms',
    '100% Genuine Designer Fabrics & 7-Day Seamless Return Privilege',
    'First Order Privilege: Unlock 10% Off with Code MFE10',
    'VIP Atelier Assistance via Official WhatsApp Concierge',
  ]);
  const [newTickerInput, setNewTickerInput] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Add slide state
  const [showAddSlide, setShowAddSlide] = useState(false);
  const [newHeading, setNewHeading] = useState('');
  const [newSub, setNewSub] = useState('');
  const [newImg, setNewImg] = useState('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop');
  const [newBtnText, setNewBtnText] = useState('Shop Collection');
  const [newBtnUrl, setNewBtnUrl] = useState('/products');

  // Modern Confirmation Modals
  const [deleteSlideModal, setDeleteSlideModal] = useState<{ isOpen: boolean; slideId: string; heading: string }>({
    isOpen: false,
    slideId: '',
    heading: '',
  });

  // Load from API on mount
  useEffect(() => {
    fetch('/api/admin/announcement')
      .then(res => res.json())
      .then(data => {
        if (data.announcement) {
          if (data.announcement.message) setAnnouncement(data.announcement.message);
          if (data.announcement.coupon_code) setCouponCode(data.announcement.coupon_code);
          if (data.announcement.whatsapp_number) setWhatsappNumber(data.announcement.whatsapp_number);
          if (data.announcement.is_active !== undefined) setIsActive(data.announcement.is_active);
          if (data.announcement.ticker_messages && data.announcement.ticker_messages.length > 0) {
            setTickerMessages(data.announcement.ticker_messages);
          }
        }
      })
      .catch(err => console.error('Failed to load announcement config:', err));
  }, []);

  const handleAddSlide = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      image_url: newImg,
      heading: newHeading,
      subtitle: newSub,
      button_text: newBtnText,
      button_url: newBtnUrl,
      sort_order: slides.length + 1,
      is_active: true,
    };
    setSlides([...slides, newSlide]);
    setShowAddSlide(false);
    setNewHeading('');
    setNewSub('');
    setSavedMsg('New hero banner slide added successfully!');
    setTimeout(() => setSavedMsg(''), 3500);
  };

  const confirmDeleteSlide = () => {
    const id = deleteSlideModal.slideId;
    setSlides(slides.filter(s => s.id !== id));
    setDeleteSlideModal({ isOpen: false, slideId: '', heading: '' });
    setSavedMsg('Hero banner slide removed.');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleAddTickerMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTickerInput.trim()) return;
    setTickerMessages([...tickerMessages, newTickerInput.trim()]);
    setNewTickerInput('');
  };

  const removeTickerMessage = (index: number) => {
    setTickerMessages(tickerMessages.filter((_, idx) => idx !== index));
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAnnouncement(true);
    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: announcement,
          couponCode: couponCode.trim().toUpperCase(),
          whatsappNumber: whatsappNumber.trim(),
          tickerMessages,
          isActive,
        }),
      });
      if (res.ok) {
        setSavedMsg('Top Announcement Bar & VIP Coupon settings saved live to storefront!');
      } else {
        setSavedMsg('Error updating announcement settings.');
      }
    } catch {
      setSavedMsg('Error updating announcement settings.');
    } finally {
      setSavingAnnouncement(false);
      setTimeout(() => setSavedMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 font-sans">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-amber-600" />
          <span>Homepage CMS & Announcement Manager</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage the top announcement bar ticker, VIP promotional coupon code, official WhatsApp hotline, and hero carousel banners.
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs animate-in fade-in duration-200 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* TOP ANNOUNCEMENT BAR & VIP COUPON CONFIG (Admin-controlled data) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Announcement Bar & VIP Coupon Settings
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-bold">Bar Status:</label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1 rounded-full text-[10.5px] font-bold uppercase transition cursor-pointer ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {isActive ? 'Live & Active' : 'Hidden'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveAnnouncement} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Primary Delivery/Announcement Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary Announcement Message
              </label>
              <input
                type="text"
                required
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                placeholder="Complimentary Express Delivery..."
              />
            </div>

            {/* Single Active Highlighted Coupon Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Single Active VIP Coupon Code</span>
              </label>
              <input
                type="text"
                required
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-amber-700 font-mono font-bold uppercase placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                placeholder="e.g. MFE10"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                This exact code is displayed in the announcement VIP pill.
              </span>
            </div>

            {/* Official WhatsApp Concierge Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Helpline Number</span>
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                placeholder="e.g. +92 300 1234567"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Direct WhatsApp link in the announcement bar.
              </span>
            </div>
          </div>

          {/* Scrolling Ticker Messages List */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Scrolling Marquee Ticker Messages ({tickerMessages.length})
            </label>
            
            <div className="space-y-2">
              {tickerMessages.map((msg, index) => (
                <div key={index} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="flex-1 truncate font-medium">{msg}</span>
                  <button
                    type="button"
                    onClick={() => removeTickerMessage(index)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Remove message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add another highlight for the scrolling ticker..."
                value={newTickerInput}
                onChange={(e) => setNewTickerInput(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
              />
              <button
                type="button"
                onClick={handleAddTickerMessage}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingAnnouncement}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {savingAnnouncement ? 'Updating Live Storefront...' : 'Save Announcement & Coupon Live'}
            </button>
          </div>
        </form>
      </div>

      {/* Hero Carousel Slides Manager */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Hero Slider Carousel ({slides.length} Slides)
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Auto-rotates on the homepage hero banner.
            </p>
          </div>
          <button
            onClick={() => setShowAddSlide(!showAddSlide)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slide</span>
          </button>
        </div>

        {showAddSlide && (
          <form onSubmit={handleAddSlide} className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Create New Carousel Slide
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luxury Lawn & Chiffon 2026"
                  value={newHeading}
                  onChange={(e) => setNewHeading(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted elegance across every season"
                  value={newSub}
                  onChange={(e) => setNewSub(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">External Banner Image URL (CDN / Hosting) *</label>
              <input
                type="url"
                required
                value={newImg}
                onChange={(e) => setNewImg(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Button Text</label>
                <input
                  type="text"
                  value={newBtnText}
                  onChange={(e) => setNewBtnText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Button Link URL</label>
                <input
                  type="text"
                  value={newBtnUrl}
                  onChange={(e) => setNewBtnUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddSlide(false)}
                className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-white transition cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
              >
                Save Slide
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((s) => (
            <div key={s.id} className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3 relative group hover:border-slate-300 transition">
              <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <ExternalImage src={s.image_url} alt={s.heading} fill className="object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{s.heading}</h4>
                {s.subtitle && <p className="text-[11px] text-slate-500 line-clamp-1">{s.subtitle}</p>}
              </div>

              {/* Modern Delete Button */}
              <button
                type="button"
                onClick={() => {
                  setDeleteSlideModal({
                    isOpen: true,
                    slideId: s.id,
                    heading: s.heading,
                  });
                }}
                className="absolute top-6 right-6 p-2 rounded-lg bg-white/90 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 shadow-xs transition cursor-pointer opacity-90 group-hover:opacity-100"
                title="Delete Slide"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Confirmation Modal (No browser alert/confirm!) */}
      <AdminConfirmModal
        isOpen={deleteSlideModal.isOpen}
        title="Delete Carousel Slide"
        message={`Are you sure you want to permanently remove "${deleteSlideModal.heading}" from the homepage hero carousel?`}
        confirmText="Delete Slide"
        cancelText="Cancel"
        variant="danger"
        iconType="delete"
        onConfirm={confirmDeleteSlide}
        onClose={() => setDeleteSlideModal({ isOpen: false, slideId: '', heading: '' })}
      />

    </div>
  );
}
