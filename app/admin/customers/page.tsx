'use client';

import React, { useState, useEffect } from 'react';
import { formatPrice, formatDate } from '@/lib/utils';
import { 
  Users, ShoppingBag, DollarSign, X, ExternalLink, 
  Calendar, Phone, Mail, MapPin, Package, ShieldCheck, 
  ChevronRight, RefreshCw, Eye, Sparkles 
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  sku?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  grandTotal: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  notes?: string;
  shippingCity: string;
  shippingAddress: string;
  items: OrderItem[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  registeredAt: string;
  status: string;
  totalOrders: number;
  totalSpent: number;
  orders: CustomerOrder[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.customers)) {
          setCustomers(data.customers);
        }
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 font-sans pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-500" />
            <span>Customer Directory ({customers.length})</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered clientele, guest patrons, lifetime luxury spend metrics, and complete order history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-64"
          />
          <button
            type="button"
            onClick={fetchCustomers}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-500 mx-auto mb-2" />
            <span>Aggregating customer records and order histories...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-1">
            <p>No customers match your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] bg-slate-900/80">
                  <th className="py-3 px-4">Patron</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Tier Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Lifetime Value</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCustomers.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-slate-800/40 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white group-hover:text-amber-400 transition truncate">{c.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {c.phone}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {c.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {formatDate(c.registeredAt)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-400">
                      {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                    </td>
                    <td className="py-3.5 px-4 font-black text-white">
                      {formatPrice(c.totalSpent)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(c);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition group-hover:border-amber-500/40 border border-transparent"
                      >
                        <Eye className="w-3 h-3 text-amber-400" />
                        <span>View Dossier</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Profile & Order History Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl h-full bg-slate-950 border-l border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto">
            
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-base flex items-center justify-center">
                    {selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{selectedCustomer.name}</span>
                      <span className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {selectedCustomer.tier}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{selectedCustomer.email}</span>
                      <span>•</span>
                      <span className="font-mono">{selectedCustomer.phone}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Patron Metrics Overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Lifetime Spend</span>
                  <span className="text-lg font-black text-white mt-1 block">{formatPrice(selectedCustomer.totalSpent)}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Orders</span>
                  <span className="text-lg font-black text-amber-400 mt-1 block">{selectedCustomer.totalOrders}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Order</span>
                  <span className="text-lg font-black text-slate-200 mt-1 block">
                    {formatPrice(selectedCustomer.totalOrders > 0 ? selectedCustomer.totalSpent / selectedCustomer.totalOrders : 0)}
                  </span>
                </div>
              </div>

              {/* Detailed Orders History */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Placed Orders History ({selectedCustomer.orders.length})</span>
                </h3>

                {selectedCustomer.orders.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
                    No registered orders recorded yet for this profile.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomer.orders.map((ord) => (
                      <div 
                        key={ord.id} 
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                          <div>
                            <span className="font-mono text-xs font-bold text-amber-400">{ord.orderNumber}</span>
                            <span className="text-[10px] text-slate-400 ml-2">• {formatDate(ord.createdAt)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              ord.status === 'delivered' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : ord.status === 'shipped'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}>
                              {ord.status}
                            </span>
                            <span className="text-xs font-black text-white">{formatPrice(ord.grandTotal)}</span>
                          </div>
                        </div>

                        {/* Order Metadata */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                          <div>
                            <span className="text-slate-500">Payment:</span> <strong className="text-slate-200 uppercase">{ord.paymentMethod}</strong> ({ord.paymentStatus})
                          </div>
                          <div>
                            <span className="text-slate-500">Destination:</span> <strong className="text-slate-200">{ord.shippingCity}</strong>
                          </div>
                        </div>

                        {/* Items Purchased List */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Purchased Garments:</span>
                          <div className="space-y-1">
                            {ord.items.map((it) => (
                              <div key={it.id} className="flex items-center justify-between text-xs bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Package className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span className="font-medium text-slate-200 truncate">{it.productName}</span>
                                </div>
                                <span className="text-[11px] text-slate-400 shrink-0 ml-2 font-mono">
                                  {it.quantity} × {formatPrice(it.unitPrice)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="pt-6 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white border border-slate-800 transition"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
