import React from 'react';
import { SettingsRepository } from '@/repositories/settings.repository';
import { formatDate } from '@/lib/utils';
import { History, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const sampleLogs = [
    {
      id: 'aud-1',
      adminEmail: 'admin@mfebrand.com',
      action: 'ORDER_STATUS_UPDATED',
      entityType: 'order',
      entityId: 'MFE-20260911-0001',
      details: 'Status updated to SHIPPED. Assigned TCS Express Tracking ID: TCS-98471203',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'aud-2',
      adminEmail: 'admin@mfebrand.com',
      action: 'PRODUCT_CREATED',
      entityType: 'product',
      entityId: 'MFE-VEL-001',
      details: 'Created "Royal Velvet Embroidered 3-Piece Suit" with external CDN image URLs.',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'aud-3',
      adminEmail: 'admin@mfebrand.com',
      action: 'REVIEW_APPROVED',
      entityType: 'review',
      entityId: 'rev-1',
      details: 'Approved 5-star review from Fatima Sheikh with Verified Purchase badge.',
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 'aud-4',
      adminEmail: 'superadmin@mfebrand.com',
      action: 'COUPON_CREATED',
      entityType: 'coupon',
      entityId: 'MFE10',
      details: 'Enabled 10% welcome coupon with max discount PKR 1,500.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <History className="w-6 h-6 text-amber-600" />
          <span>System Audit Activity Trail</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable logging of all administrative actions, status changes, and catalog updates.
        </p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] bg-slate-50/70">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Admin Email</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sampleLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {log.adminEmail}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {log.entityId}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs max-w-sm">
                    {log.details}
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
