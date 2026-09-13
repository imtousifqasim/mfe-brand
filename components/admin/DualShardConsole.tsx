'use client';

import React, { useState } from 'react';
import { Database, Server, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { DualShardHealth } from '@/lib/supabase/sharding';

export function DualShardConsole({ initialHealth }: { initialHealth: DualShardHealth }) {
  const [health, setHealth] = useState<DualShardHealth>(initialHealth);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const shard1 = health.shards[0];
  const shard2 = health.shards[1];

  async function refreshMetrics() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shard');
      const data = await res.json();
      if (data.success) {
        setHealth(data.health);
      }
    } catch {}
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Multi-Supabase Sharding Engine</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE WRITE: SHARD {health.activeWriteShard}
              </span>
            </div>
            <h2 className="text-base font-black text-white mt-0.5">
              Auto-Overflow Policy: 490 MB Threshold
            </h2>
            <p className="text-[11px] text-slate-400">
              When Shard 1 reaches 490 MB, new writes instantly route to Shard 2. All storefront & admin queries seamlessly read and merge both databases in parallel.
            </p>
          </div>
        </div>

        <button
          onClick={refreshMetrics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium leading-relaxed">
          {msg}
        </div>
      )}

      {/* Dual Shard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SHARD 1 */}
        <div className={`p-6 rounded-2xl border transition-all ${
          shard1.isWriteTarget
            ? 'bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  SHARD 1 (PRIMARY)
                </span>
                {shard1.isWriteTarget && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    🟢 Receiving Writes
                  </span>
                )}
                {shard1.status === 'overflow' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    ⚠️ 490 MB Reached (Read-Only)
                  </span>
                )}
              </div>
              <h3 className="text-sm font-black text-white mt-2">
                xniwqtjzngpxnmktnxvi
              </h3>
              <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs mt-0.5">
                {shard1.url}
              </p>
            </div>
            <Server className={`w-6 h-6 ${shard1.isWriteTarget ? 'text-amber-400' : 'text-slate-600'}`} />
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Storage Used</span>
              <span className={`font-mono ${shard1.storagePercent > 95 ? 'text-rose-400' : 'text-amber-400'}`}>
                {shard1.storageUsedMb} MB / 490 MB ({shard1.storagePercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  shard1.storagePercent > 95 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                }`}
                style={{ width: `${Math.min(100, shard1.storagePercent)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
              <span className="text-slate-200 font-medium capitalize">{shard1.status}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Row Count</span>
              <span className="text-slate-200 font-mono font-medium">{shard1.totalRows} records</span>
            </div>
          </div>
        </div>

        {/* SHARD 2 */}
        <div className={`p-6 rounded-2xl border transition-all ${
          shard2.isWriteTarget
            ? 'bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  SHARD 2 (SECONDARY / OVERFLOW)
                </span>
                {shard2.isWriteTarget ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    🟢 Receiving Writes (Failover Active)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Standby (Waits for Shard 1 @ 490 MB)
                  </span>
                )}
              </div>
              <h3 className="text-sm font-black text-white mt-2">
                aimrsvjfaeccfxskiqrt
              </h3>
              <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs mt-0.5">
                {shard2.url}
              </p>
            </div>
            <Server className={`w-6 h-6 ${shard2.isWriteTarget ? 'text-amber-400' : 'text-slate-600'}`} />
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Storage Used</span>
              <span className="font-mono text-amber-400">
                {shard2.storageUsedMb} MB / 490 MB ({shard2.storagePercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.max(1, Math.min(100, shard2.storagePercent))}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
              <span className="text-slate-200 font-medium capitalize">{shard2.status}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Row Count</span>
              <span className="text-slate-200 font-mono font-medium">{shard2.totalRows} records</span>
            </div>
          </div>
        </div>
      </div>

      {/* Production Safety & High Availability Panel */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/20 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Production Safety Lock & Dual-Shard High Availability</span>
            </h3>
            <p className="text-xs text-slate-300">
              Safe Operation Active: Destructive simulation and wipe controls are permanently locked in production.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Data Safe
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Automatic Overflow</span>
            <p className="text-slate-200">
              Shard 1 writes transition seamlessly to Shard 2 when capacity approaches 490 MB threshold.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Parallel Read Aggregation</span>
            <p className="text-slate-200">
              Storefront and admin queries query both database instances in parallel for unified data integrity.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Zero-Downtime Guarantee</span>
            <p className="text-slate-200">
              Orders, customers, reviews, and subscriptions are safeguarded with dual-shard persistence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
