'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalImage } from '@/components/media/ExternalImage';
import { isValidUrl } from '@/lib/utils';
import { 
  Package, DollarSign, Layers, Image as ImageIcon, 
  FileText, Sliders, Truck, Eye, Search, Plus, 
  Trash2, AlertCircle, CheckCircle2, ArrowLeft 
} from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();

  // SECTION 1: Basic Information
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('brand-1');
  const [category, setCategory] = useState('cat-1');
  const [tags, setTags] = useState('lawn, luxury, summer');

  // SECTION 2: Pricing
  const [costPrice, setCostPrice] = useState('5000');
  const [regularPrice, setRegularPrice] = useState('12500');
  const [salePrice, setSalePrice] = useState('9999');

  // SECTION 3: Inventory
  const [stockQuantity, setStockQuantity] = useState('25');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [stockStatus, setStockStatus] = useState('in_stock');
  const [backorders, setBackorders] = useState('no');

  // SECTION 4: Images (External URLs ONLY - No Supabase Storage)
  const [mainImageUrl, setMainImageUrl] = useState('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop');
  const [mainAltText, setMainAltText] = useState('Luxury Suit Front View');
  const [galleryUrls, setGalleryUrls] = useState<Array<{ url: string; alt: string }>>([
    { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop', alt: 'Fabric Detail' }
  ]);

  // SECTION 5: Description
  const [shortDescription, setShortDescription] = useState('Fine luxury unstitched suit with intricate embroidery.');
  const [fullDescription, setFullDescription] = useState('Detailed fabric breakdown, washing instructions, and styling notes.');

  // SECTION 6: Attributes
  const [attributes, setAttributes] = useState('Fabric: Micro Velvet, Work: Tilla Zari, Pieces: 3 Piece');

  // SECTION 7: Variations
  const [variations, setVariations] = useState('Small, Medium, Large, XL');

  // SECTION 8: Shipping
  const [weight, setWeight] = useState('1.2');
  const [dimensions, setDimensions] = useState('35x25x6 cm');

  // SECTION 9: Visibility
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);
  const [isBestDeal, setIsBestDeal] = useState(true);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isPopular, setIsPopular] = useState(false);

  // SECTION 10: SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-generate slug and SKU from title
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setSlug(generatedSlug);
    if (!sku) {
      setSku(`MFE-${Math.floor(100 + Math.random() * 900)}`);
    }
    if (!seoTitle) {
      setSeoTitle(`${val} | MFE BRAND`);
    }
  };

  const addGalleryImage = () => {
    setGalleryUrls([...galleryUrls, { url: '', alt: '' }]);
  };

  const updateGalleryImage = (idx: number, field: 'url' | 'alt', val: string) => {
    const updated = [...galleryUrls];
    updated[idx][field] = val;
    setGalleryUrls(updated);
  };

  const removeGalleryImage = (idx: number) => {
    setGalleryUrls(galleryUrls.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !regularPrice || !mainImageUrl) {
      setErrorMsg('Product name, regular price, and main image URL are required.');
      setIsSubmitting(false);
      return;
    }

    if (!isValidUrl(mainImageUrl)) {
      setErrorMsg('Main product image URL is not a valid web URL.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate/save product creation via API or repository
      setSuccessMsg(`Product "${name}" has been created successfully!`);
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch {
      setErrorMsg('Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Create New Product
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              10-Section Catalog Creator (Zero Supabase Storage • External URLs Only)
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: Basic Information */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Package className="w-4 h-4 text-amber-600" />
            <span>SECTION 1: Basic Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Royal Micro Velvet Embellished Kurta"
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Product Slug (URL identifier)</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">SKU (Stock Keeping Unit) *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand / Label Line</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              >
                <option value="brand-1">MFE Signature</option>
                <option value="brand-2">MFE Heritage</option>
                <option value="brand-3">MFE Pret</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              >
                <option value="cat-1">Unstitched Luxury</option>
                <option value="cat-2">Ready to Wear Pret</option>
                <option value="cat-3">Festive & Formals</option>
                <option value="cat-4">Menswear Royal</option>
                <option value="cat-5">Accessories & Shawls</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="velvet, festive, embroidered, 3piece"
              className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
            />
          </div>
        </div>

        {/* SECTION 2: Pricing */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <span>SECTION 2: Pricing (PKR)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Cost Price (for internal profit margin)</label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Regular Price (List Price) *</label>
              <input
                type="number"
                required
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Sale Price (Discounted Price)</label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="Leave blank if not on sale"
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-emerald-700 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Inventory */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>SECTION 3: Inventory & Stock Control</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Stock Quantity *</label>
              <input
                type="number"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Low Stock Threshold</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Stock Status</label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              >
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Allow Backorders?</label>
              <select
                value={backorders}
                onChange={(e) => setBackorders(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              >
                <option value="no">Do not allow</option>
                <option value="notify">Allow, but notify customer</option>
                <option value="yes">Allow freely</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: Images (IMPORTANT — STRICT EXTERNAL URLS ONLY) */}
        <div className="p-6 rounded-2xl bg-white border border-amber-300/80 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>SECTION 4: Product Images (Strict External URLs Only)</span>
            </h2>
            <p className="text-xs text-amber-800 mt-1 font-mono font-semibold">
              ★ NO SUPABASE STORAGE: Enter externally hosted image URLs (CDN, Cloudflare, S3, Unsplash). Only URLs and metadata are stored in PostgreSQL.
            </p>
          </div>

          {/* Main Product Image Input */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Main Primary Image URL *
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 w-full space-y-2">
                <input
                  type="url"
                  required
                  placeholder="https://example.com/images/product-main.webp"
                  value={mainImageUrl}
                  onChange={(e) => setMainImageUrl(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
                />
                <input
                  type="text"
                  placeholder="Alt text for main image (e.g. Royal Velvet Front)"
                  value={mainAltText}
                  onChange={(e) => setMainAltText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
                />
              </div>

              {/* Main Image Live Preview */}
              <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                <ExternalImage src={mainImageUrl} alt={mainAltText} fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* Gallery Images */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Additional Gallery Image URLs
              </span>
              <button
                type="button"
                onClick={addGalleryImage}
                className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-900 font-bold px-3 py-1.5 rounded-xl transition shadow-2xs cursor-pointer"
              >
                <Plus className="w-3 h-3 text-amber-600" />
                <span>Add Gallery Image</span>
              </button>
            </div>

            <div className="space-y-3">
              {galleryUrls.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                  
                  <input
                    type="url"
                    placeholder="https://example.com/images/gallery-01.webp"
                    value={item.url}
                    onChange={(e) => updateGalleryImage(idx, 'url', e.target.value)}
                    className="flex-1 text-xs p-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
                  />

                  <input
                    type="text"
                    placeholder="Alt text"
                    value={item.alt}
                    onChange={(e) => updateGalleryImage(idx, 'alt', e.target.value)}
                    className="w-full sm:w-44 text-xs p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
                  />

                  {/* Thumbnail Preview */}
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                    <ExternalImage src={item.url} alt={item.alt} fill className="object-cover" />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="text-slate-400 hover:text-rose-600 p-2 transition cursor-pointer"
                    title="Remove gallery image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 5: Description */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-amber-600" />
            <span>SECTION 5: Product Description</span>
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Short Summary</label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Detailed Description</label>
            <textarea
              rows={4}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
            />
          </div>
        </div>

        {/* SECTION 6 & 7: Attributes & Variations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              SECTION 6: Attributes
            </h2>
            <textarea
              rows={3}
              value={attributes}
              onChange={(e) => setAttributes(e.target.value)}
              placeholder="e.g. Fabric: Silk, Color: Maroon, Pieces: 3"
              className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
            />
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              SECTION 7: Variations
            </h2>
            <textarea
              rows={3}
              value={variations}
              onChange={(e) => setVariations(e.target.value)}
              placeholder="e.g. Small, Medium, Large, XL"
              className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
            />
          </div>
        </div>

        {/* SECTION 8: Shipping */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Truck className="w-4 h-4 text-amber-600" />
            <span>SECTION 8: Shipping & Dimensions</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Weight (in kg)</label>
              <input
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 1.2"
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Dimensions (LxWxH)</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 35x25x8 cm"
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 9: Visibility & Featured Badges */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Eye className="w-4 h-4 text-amber-600" />
            <span>SECTION 9: Visibility & Badges</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-bold">
            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Published</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Featured</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={isBestDeal}
                onChange={(e) => setIsBestDeal(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-rose-700">Best Deal</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-emerald-700">New Arrival</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Popular</span>
            </label>
          </div>
        </div>

        {/* SECTION 10: SEO Optimization */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Search className="w-4 h-4 text-amber-600" />
            <span>SECTION 10: Search Engine Optimization (SEO)</span>
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">SEO Title Tag</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="e.g. Royal Micro Velvet Suit | MFE Brand"
              className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">SEO Meta Description</label>
            <textarea
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Compelling description for Google and search engines..."
              className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href="/admin/products"
            className="text-xs px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-2xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 px-8 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Saving Product...' : 'Publish Product to Store'}
          </button>
        </div>

      </form>
    </div>
  );
}
