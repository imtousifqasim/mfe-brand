'use client';

import React, { useState } from 'react';
import { SEED_HERO_SLIDES, SEED_ANNOUNCEMENT } from '@/lib/data/seed-data';
import { HeroSlide } from '@/types/database';
import { ExternalImage } from '@/components/media/ExternalImage';
import { Sliders, Plus, Trash2, CheckCircle2, Megaphone } from 'lucide-react';

export default function AdminHomepageCMSPage() {
  const [slides, setSlides] = useState<HeroSlide[]>(SEED_HERO_SLIDES);
  const [announcement, setAnnouncement] = useState(SEED_ANNOUNCEMENT.message);
  const [couponCode, setCouponCode] = useState(SEED_ANNOUNCEMENT.coupon_code || 'MFE10');
  const [savedMsg, setSavedMsg] = useState('');

  // Add slide state
  const [showAddSlide, setShowAddSlide] = useState(false);
  const [newHeading, setNewHeading] = useState('');
  const [newSub, setNewSub] = useState('');
  const [newImg, setNewImg] = useState('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop');
  const [newBtnText, setNewBtnText] = useState('Shop Collection');
  const [newBtnUrl, setNewBtnUrl] = useState('/products');

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
    setSavedMsg('New hero banner slide added!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const removeSlide = (id: string) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg('Top Announcement Bar updated!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      <div>
        <h1 className="text-2xl font-black text-white">
          Homepage CMS & Hero Slider Manager
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage carousel slides and top promotional announcement. (Zero Supabase Storage • External URLs Only)
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Top Announcement Bar Config */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-wider text-amber-500 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Megaphone className="w-4 h-4" />
          <span>Top Announcement Bar Promo</span>
        </h2>

        <form onSubmit={handleSaveAnnouncement} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Announcement Message
              </label>
              <input
                type="text"
                required
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Highlighted Coupon Code
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition"
          >
            Update Announcement
          </button>
        </form>
      </div>

      {/* Hero Carousel Slides */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Hero Slider Carousel ({slides.length} Slides)
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Auto-rotates every 3.5 seconds. Only external image URLs are saved.
            </p>
          </div>
          <button
            onClick={() => setShowAddSlide(!showAddSlide)}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs px-3.5 py-2 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slide</span>
          </button>
        </div>

        {showAddSlide && (
          <form onSubmit={handleAddSlide} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Create New Carousel Slide
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luxury Lawn & Chiffon 2026"
                  value={newHeading}
                  onChange={(e) => setNewHeading(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted with gold tilla weaves"
                  value={newSub}
                  onChange={(e) => setNewSub(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">External Slide Image URL (CDN / Hosting) *</label>
              <input
                type="url"
                required
                value={newImg}
                onChange={(e) => setNewImg(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Button Text"
                value={newBtnText}
                onChange={(e) => setNewBtnText(e.target.value)}
                className="text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
              />
              <input
                type="text"
                placeholder="Button Destination URL"
                value={newBtnUrl}
                onChange={(e) => setNewBtnUrl(e.target.value)}
                className="text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddSlide(false)}
                className="text-xs px-4 py-2 rounded-lg border border-slate-800 text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Save Slide
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className="relative w-full sm:w-40 h-24 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                <ExternalImage src={s.image_url} alt={s.heading} fill className="object-cover" />
              </div>

              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-mono text-amber-500 uppercase">Slide #{idx + 1}</span>
                <h3 className="font-bold text-sm text-white">{s.heading}</h3>
                <p className="text-xs text-slate-400 line-clamp-1">{s.subtitle}</p>
                <div className="text-[10px] text-slate-500 font-mono truncate max-w-md">
                  URL: {s.image_url}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeSlide(s.id)}
                className="text-slate-400 hover:text-rose-500 p-2 transition self-end sm:self-center"
                title="Remove slide"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
