import { NextRequest, NextResponse } from 'next/server';
import { getDualShardHealth, setSimulatedShard1Size, setManualActiveShardOverride } from '@/lib/supabase/sharding';

export async function GET() {
  const health = await getDualShardHealth();
  return NextResponse.json({ success: true, health });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (typeof body.simulatedShard1Mb === 'number') {
      setSimulatedShard1Size(body.simulatedShard1Mb);
    }

    if (body.manualOverride !== undefined) {
      setManualActiveShardOverride(body.manualOverride === null ? null : (body.manualOverride as 1 | 2));
    }

    const updated = await getDualShardHealth();
    return NextResponse.json({ success: true, health: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 400 });
  }
}
