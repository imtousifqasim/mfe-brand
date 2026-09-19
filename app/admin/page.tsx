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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Executive Performance Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time store performance, fulfillment metrics, and stock alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Revenue</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block tracking-tight">
            {formatPrice(totalSales)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block mt-2">
            {orders.length === 0 ? 'No customer orders yet' : `Calculated across ${orders.length} real order${orders.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-200/60">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block tracking-tight">
            {orders.length}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block mt-2">
            {pendingOrders} awaiting fulfillment
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Catalog</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block tracking-tight">
            {totalProducts} SKUs
          </span>
          <span className="text-[11px] text-slate-500 font-medium block mt-2">
            All stored via external URLs only
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Stock Attention</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-rose-600 block tracking-tight">
            {lowStockCount} Items
          </span>
          <span className="text-[11px] text-rose-600 font-semibold block mt-2">
            Low stock threshold reached
          </span>
        </div>

      </div>

      {/* Two Column Layout: Orders & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Recent Orders
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Dispatches and payments awaiting review.</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-2.5">Order #</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Total</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500 text-xs">
                      No customer orders placed yet. New real orders will appear here automatically.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 6).map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 font-mono font-bold text-slate-900">
                        {ord.order_number}
                      </td>
                      <td className="py-3 text-slate-700">
                        <div className="font-semibold">{ord.customer_name}</div>
                        <div className="text-[10px] text-slate-400">{ord.customer_phone}</div>
                      </td>
                      <td className="py-3">
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          {ord.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-slate-900">
                        {formatPrice(ord.grand_total)}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="text-xs font-bold text-slate-900 hover:text-amber-600 transition"
                        >
                          Edit / Courier →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts & System Health (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Low Inventory Watch</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Restock needed to prevent overselling.</p>
            </div>

            <div className="space-y-2.5">
              {products
                .filter(p => p.stock_quantity <= p.low_stock_threshold)
                .slice(0, 4)
                .map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block truncate max-w-[200px]">{p.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">SKU: {p.sku}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-rose-600 font-bold block">{p.stock_quantity} in stock</span>
                      <span className="text-[10px] text-slate-400">Alert at {p.low_stock_threshold}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Storage Policy Card */}
          <div className="bg-amber-50/50 border border-amber-200/70 rounded-2xl p-6 shadow-xs text-xs space-y-2">
            <span className="text-amber-800 font-bold uppercase tracking-wider block">
              🛡️ Zero Supabase Storage Policy Active
            </span>
            <p className="text-slate-600 leading-relaxed">
              Product images, category banners, and hero slides store only external HTTPS URLs in PostgreSQL. Database storage footprint remains ultra-low.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
