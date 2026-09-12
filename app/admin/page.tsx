import React from 'react';
import Link from 'next/link';
import { OrderRepository } from '@/repositories/order.repository';
import { ProductRepository } from '@/repositories/product.repository';
import { formatPrice, formatDate } from '@/lib/utils';
import { 
  DollarSign, ShoppingBag, Users, AlertTriangle, 
  TrendingUp, ArrowUpRight, Clock, CheckCircle2, 
  Package, Plus 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [orders, { products, total: totalProducts }] = await Promise.all([
    OrderRepository.getOrders(),
    ProductRepository.getProducts(),
  ]);

  const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.grand_total : 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
  const lowStockCount = products.filter(p => p.stock_quantity <= p.low_stock_threshold).length;

  return (
    <div className="space-y-8">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Executive Performance Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time store performance, fulfillment metrics, and stock alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white block">
            {formatPrice(totalSales)}
          </span>
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% vs last month</span>
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white block">
            {orders.length}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block mt-2">
            {pendingOrders} awaiting fulfillment
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Catalog</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white block">
            {totalProducts} SKUs
          </span>
          <span className="text-[11px] text-slate-400 font-medium block mt-2">
            All stored via external URLs only
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Stock Attention</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-rose-400 block">
            {lowStockCount} Items
          </span>
          <span className="text-[11px] text-rose-400 font-bold block mt-2">
            Low stock threshold reached
          </span>
        </div>

      </div>

      {/* Two Column Layout: Orders & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Recent Orders
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Dispatches and payments awaiting review.</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-2.5">Order #</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Total</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {orders.slice(0, 6).map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 font-mono font-bold text-amber-400">
                      {ord.order_number}
                    </td>
                    <td className="py-3 text-slate-300">
                      <div>{ord.customer_name}</div>
                      <div className="text-[10px] text-slate-500">{ord.customer_phone}</div>
                    </td>
                    <td className="py-3">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {ord.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-white">
                      {formatPrice(ord.grand_total)}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="text-xs font-bold text-amber-500 hover:underline"
                      >
                        Edit / Courier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts & System Health (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Low Inventory Watch</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Restock needed to prevent overselling.</p>
            </div>

            <div className="space-y-3">
              {products
                .filter(p => p.stock_quantity <= p.low_stock_threshold)
                .slice(0, 4)
                .map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-200 block truncate max-w-[200px]">{p.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">SKU: {p.sku}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-rose-400 font-bold block">{p.stock_quantity} in stock</span>
                      <span className="text-[10px] text-slate-500">Alert at {p.low_stock_threshold}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Storage Policy Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm text-xs space-y-2">
            <span className="text-amber-500 font-bold uppercase tracking-wider block">
              🛡️ Zero Supabase Storage Policy Active
            </span>
            <p className="text-slate-400 leading-relaxed">
              Product images, category banners, and hero slides store only external HTTPS URLs in PostgreSQL. Database storage footprint remains ultra-low.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
