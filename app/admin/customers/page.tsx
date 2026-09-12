import React from 'react';
import { formatPrice, formatDate } from '@/lib/utils';
import { Users, ShoppingBag, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminCustomersPage() {
  const sampleCustomers = [
    {
      id: 'cust-1',
      name: 'Tousif Qasim',
      email: 'tousif@example.com',
      phone: '+92 300 9876543',
      city: 'Lahore, Pakistan',
      registeredAt: '2026-09-01T10:00:00Z',
      totalOrders: 3,
      totalSpent: 48999,
      status: 'active',
    },
    {
      id: 'cust-2',
      name: 'Ayesha Khan',
      email: 'ayesha.k@example.com',
      phone: '+92 321 5554321',
      city: 'Karachi, Pakistan',
      registeredAt: '2026-09-05T14:30:00Z',
      totalOrders: 2,
      totalSpent: 31500,
      status: 'active',
    },
    {
      id: 'cust-3',
      name: 'Hamza Tariq',
      email: 'hamza.t@example.com',
      phone: '+92 345 8887766',
      city: 'Islamabad, Pakistan',
      registeredAt: '2026-09-08T09:15:00Z',
      totalOrders: 1,
      totalSpent: 13500,
      status: 'active',
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Customer Directory ({sampleCustomers.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered customer profiles, cumulative order totals, and verified contacts.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] bg-slate-900/80">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Lifetime Value</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sampleCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.email}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono">
                    {c.phone}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {c.city}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {formatDate(c.registeredAt)}
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-400">
                    {c.totalOrders} orders
                  </td>
                  <td className="py-3 px-4 font-black text-white">
                    {formatPrice(c.totalSpent)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
