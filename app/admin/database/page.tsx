import React from 'react';
import { DatabaseRepository } from '@/repositories/database.repository';
import { Database, Layers } from 'lucide-react';
import { DualShardConsole } from '@/components/admin/DualShardConsole';

export const dynamic = 'force-dynamic';

export default async function AdminDatabaseMonitoringPage() {
  const report = await DatabaseRepository.getHealthReport();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <Database className="w-6 h-6 text-amber-600" />
          <span>Multi-Supabase Sharding & Storage Monitoring</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time dual Supabase metrics, automatic 490 MB overflow routing, and unified cross-shard data aggregation.
        </p>
      </div>

      {/* Interactive Dual Shard Console */}
      <DualShardConsole initialHealth={report.sharding} />

      {/* Normalized Table Sizes Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs space-y-4 p-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
          Active Database Table Metrics (Cross-Shard Aggregated)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-2.5">Table Name</th>
                <th className="py-2.5">Combined Row Count</th>
                <th className="py-2.5">Estimated Size</th>
                <th className="py-2.5">Storage Footprint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.tables.map((t) => (
                <tr key={t.name} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 font-mono font-bold text-slate-900">
                    public.{t.name}
                  </td>
                  <td className="py-3 text-slate-700">
                    {t.rowCount} rows
                  </td>
                  <td className="py-3 font-mono font-bold text-amber-700">
                    {t.estimatedSizeKb} KB
                  </td>
                  <td className="py-3 text-slate-500 text-[11px]">
                    Optimized (URLs only, zero binary blobs)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Database & Sharding Architecture Details */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" />
          <span>How Multi-Supabase Sharding Works in MFE Brand</span>
        </h3>
        <p className="text-slate-600 leading-relaxed">
          Both Supabase projects are connected concurrently:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>
            <strong className="text-slate-900">Automatic 490 MB Write Switch:</strong> As long as Shard 1 storage is under 490 MB, all new checkouts, products, and customer orders are written to Shard 1. When Shard 1 reaches 490 MB, writes automatically switch to Shard 2.
          </li>
          <li>
            <strong className="text-slate-900">Seamless Parallel Reads:</strong> All read queries (storefront product catalog, customer order history, admin orders, reviews) run across Shard 1 and Shard 2 in parallel. The results are unified and deduplicated so that past records continue to show up with zero data loss or disruption.
          </li>
          <li>
            <strong className="text-slate-900">High Availability:</strong> If either Supabase instance experiences network degradation, the repository layer gracefully serves data from the surviving shard and local resilient cache.
          </li>
        </ul>
      </div>

    </div>
  );
}
