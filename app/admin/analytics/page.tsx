import React from 'react';
import { formatPrice } from '@/lib/utils';
import { OrderRepository } from '@/repositories/order.repository';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Award, PackageCheck, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const orders = await OrderRepository.getOrders();
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const grossRevenue = validOrders.reduce((sum, o) => sum + (Number(o.grand_total) || 0), 0);
  const totalOrders = orders.length;
  const aov = validOrders.length > 0 ? Math.round(grossRevenue / validOrders.length) : 0;
  const deliveredCount = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
  const fulfillmentRate = orders.length > 0 
    ? Math.round((deliveredCount / orders.length) * 100) 
    : 100;

  // Aggregate item sales from real orders
  const productSalesMap = new Map<string, { name: string; sold: number; revenue: number }>();
  orders.forEach(ord => {
    (ord.items || []).forEach((it: any) => {
      const name = it.product_name || 'Product';
      const existing = productSalesMap.get(name) || { name, sold: 0, revenue: 0 };
      existing.sold += (it.quantity || 1);
      existing.revenue += (it.subtotal || (it.unit_price || 0) * (it.quantity || 1));
      productSalesMap.set(name, existing);
    });
  });

  const bestSellers = Array.from(productSalesMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-amber-600" />
          <span>Executive Sales & E-Commerce Analytics</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Server-side aggregated revenue metrics, Average Order Value (AOV), and top-selling product reports.
        </p>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Total Gross Volume
          </span>
          <span className="text-3xl font-black text-slate-900 block tracking-tight">
            {formatPrice(grossRevenue)}
          </span>
          <span className="text-xs text-slate-500 font-medium block mt-2">
            {totalOrders === 0 ? 'No customer orders recorded' : `${validOrders.length} confirmed orders in database`}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Average Order Value (AOV)
          </span>
          <span className="text-3xl font-black text-amber-600 block tracking-tight">
            {formatPrice(aov)}
          </span>
          <span className="text-xs text-slate-500 block mt-2">
            {totalOrders === 0 ? 'Calculated on live checkout data' : `Based on ${validOrders.length} processed order(s)`}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Fulfillment Rate
          </span>
          <span className="text-3xl font-black text-emerald-700 block tracking-tight">
            {fulfillmentRate}%
          </span>
          <span className="text-xs text-slate-500 block mt-2">
            {deliveredCount} delivered out of {totalOrders} total
          </span>
        </div>
      </div>

      {/* Best Sellers Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs p-6 space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-600" />
          <span>Top Revenue-Generating SKUs</span>
        </h2>

        {bestSellers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No product sales recorded yet. Real top-selling items will display here automatically as customer orders are placed.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-2.5">Product</th>
                <th className="py-2.5">Units Sold</th>
                <th className="py-2.5 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bestSellers.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 font-bold text-slate-900">
                    {item.name}
                  </td>
                  <td className="py-3 text-slate-600 font-mono">
                    {item.sold} units
                  </td>
                  <td className="py-3 text-right font-black text-amber-700">
                    {formatPrice(item.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
