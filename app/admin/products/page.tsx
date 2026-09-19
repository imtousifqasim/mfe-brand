import React from 'react';
import Link from 'next/link';
import { ProductRepository } from '@/repositories/product.repository';
import { ExternalImage } from '@/components/media/ExternalImage';
import { formatPrice } from '@/lib/utils';
import { Plus, Package, Edit, Trash2, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const { products, total } = await ProductRepository.getProducts({ limit: 100 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Products Catalog ({total})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your store inventory, pricing, and external image URLs.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Add New Product (10-Section Form)</span>
        </Link>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] bg-slate-50/80">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Regular Price</th>
                <th className="py-3 px-4">Sale Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const imgUrl = p.images?.[0]?.image_url || null;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                        <ExternalImage src={imgUrl} alt={p.name} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">
                      <Link href={`/products/${p.slug}`} target="_blank" className="hover:text-amber-700 flex items-center gap-1 transition">
                        <span>{p.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                        Brand: {p.brand?.name || 'MFE'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">
                      {p.sku}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {p.category?.name || 'Uncategorized'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {formatPrice(p.regular_price)}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {p.sale_price ? formatPrice(p.sale_price) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${p.stock_quantity <= p.low_stock_threshold ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {p.stock_quantity} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        Published
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs text-slate-900 hover:text-amber-700 font-bold transition"
                        title="Edit Price & Variants"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </Link>
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 transition"
                        title="View Live"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
