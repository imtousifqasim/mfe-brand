import { getDualShardHealth, DualShardHealth, setSimulatedShard1Size, setManualActiveShardOverride } from '@/lib/supabase/sharding';

export interface TableMetric {
  name: string;
  rowCount: number;
  estimatedSizeKb: number;
}

export interface DatabaseHealthReport {
  connected: boolean;
  totalTables: number;
  totalRows: number;
  databaseSizeMb: number;
  quotaReport: string;
  tables: TableMetric[];
  status: 'healthy' | 'warning' | 'critical';
  sharding: DualShardHealth;
}

export class DatabaseRepository {
  static async getHealthReport(): Promise<DatabaseHealthReport> {
    const sharding = await getDualShardHealth();

    const isConnected = sharding.shards.some(s => s.status === 'online' || s.status === 'standby');
    const status: DatabaseHealthReport['status'] = 
      sharding.shards[0].status === 'overflow' ? 'warning' : 'healthy';

    return {
      connected: isConnected,
      totalTables: 28,
      totalRows: sharding.totalAggregatedRows,
      databaseSizeMb: sharding.totalCombinedSizeMb,
      quotaReport: `Dynamic Sharding Active. Shard 1: ${sharding.shards[0].storageUsedMb} MB / 490 MB threshold. Active Write Target: Shard ${sharding.activeWriteShard}.`,
      status,
      sharding,
      tables: [
        { name: 'products', rowCount: 12, estimatedSizeKb: 128 },
        { name: 'product_images', rowCount: 28, estimatedSizeKb: 64 },
        { name: 'orders', rowCount: sharding.totalAggregatedRows || 8, estimatedSizeKb: 32 },
        { name: 'order_items', rowCount: 16, estimatedSizeKb: 24 },
        { name: 'order_addresses', rowCount: 8, estimatedSizeKb: 16 },
        { name: 'categories', rowCount: 6, estimatedSizeKb: 16 },
        { name: 'brands', rowCount: 4, estimatedSizeKb: 12 },
        { name: 'coupons', rowCount: 3, estimatedSizeKb: 8 },
        { name: 'reviews', rowCount: 6, estimatedSizeKb: 14 },
        { name: 'hero_slides', rowCount: 3, estimatedSizeKb: 12 },
        { name: 'audit_logs', rowCount: 14, estimatedSizeKb: 28 },
      ]
    };
  }

  static simulateShard1Limit(mb: number) {
    setSimulatedShard1Size(mb);
  }

  static setShardOverride(shardId: 1 | 2 | null) {
    setManualActiveShardOverride(shardId);
  }
}
