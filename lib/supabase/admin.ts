import { SupabaseClient } from '@supabase/supabase-js';
import { 
  getActiveWriteAdmin, 
  getShard1Admin, 
  getShard2Admin, 
  getAllAdminClients,
  queryAcrossAllShards,
  findAcrossAllShards,
  getDualShardHealth,
  getActiveWriteShardId
} from './sharding';

export function createAdminClient(): SupabaseClient {
  return getActiveWriteAdmin();
}

export {
  getActiveWriteAdmin,
  getShard1Admin,
  getShard2Admin,
  getAllAdminClients,
  queryAcrossAllShards,
  findAcrossAllShards,
  getDualShardHealth,
  getActiveWriteShardId
};
