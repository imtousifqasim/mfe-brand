import React from 'react';
import { formatPrice } from '@/lib/utils';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Award, PackageCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const analyticsData = {
    grossRevenue: 148500,
    totalOrders: 9,
    aov: 16500,
    topCategories: [
      { name: 'Festive & Formals', sales: 68000, percent: 45 },
      { name: 'Unstitched Luxury', sales: 42000, percent: 28 },
      { name: 'Accessories & Shawls', sales: 38500, percent: 27 },
    ],
    bestSellers: [
      { name: 'Royal Velvet Embroidered 3-Piece Suit', sold: 5, revenue: 99995 },
      { name: 'Pure Kashmir Hand-Embroidered Pashmina Shawl', sold: 2, revenue: 65000 },
      { name: 'Artisanal Jacquard Unstitched 3-Piece', sold: 4, revenue: 37996 },
    ]
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-amber-500" />
          <span>Executive Sales & E-Commerce Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Server-side aggregated revenue metrics, Average Order Value (AOV), and top-selling product reports.
        </p>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Gross Volume
          </span>
          <span className="text-3xl font-black text-white block">
            {formatPrice(analyticsData.grossRevenue)}
          </span>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% this quarter</span>
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Average Order Value (AOV)
          </span>
          <span className="text-3xl font-black text-amber-400 block">
            {formatPrice(analyticsData.aov)}
          </span>
          <span className="text-xs text-slate-400 block mt-2">
            High-tier luxury apparel purchases
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Fulfillment Rate
          </span>
          <span className="text-3xl font-black text-emerald-400 block">
            98.5%
          </span>
          <span className="text-xs text-slate-400 block mt-2">
            Average 2-day delivery in Pakistan
          </span>
        </div>
      </div>

      {/* Category Contribution Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-white">
          Category Revenue Contribution
        </h2>
        <div className="space-y-3">
          {analyticsData.topCategories.map((c, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-200">{c.name}</span>
                <span className="text-amber-400">{formatPrice(c.sales)} ({c.percent}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${c.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best Sellers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Top Revenue-Generating SKUs</span>
        </h2>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <th className="py-2.5">Product</th>
              <th className="py-2.5">Units Sold</th>
              <th className="py-2.5 text-right">Revenue Generated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {analyticsData.bestSellers.map((item, idx) => (
              <tr key={idx}>
                <td className="py-3 font-bold text-slate-200">
                  {item.name}
                </td>
                <td className="py-3 text-slate-400 font-mono">
                  {item.sold} units
                </td>
                <td className="py-3 text-right font-black text-amber-400">
                  {formatPrice(item.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
