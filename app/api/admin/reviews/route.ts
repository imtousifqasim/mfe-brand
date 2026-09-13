import { NextRequest, NextResponse } from 'next/server';
import { queryAcrossAllShards, getAllAdminClients } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const reviews = await queryAcrossAllShards<any>(async (supabase) => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data;
    }, (items) => {
      const map = new Map<string, any>();
      items.forEach(r => map.set(r.id, r));
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return NextResponse.json({
      success: true,
      reviews: reviews || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid review ID or status' }, { status: 400 });
    }

    const shards = getAllAdminClients();
    let anyUpdated = false;

    for (const { client } of shards) {
      const { error } = await client
        .from('reviews')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (!error) anyUpdated = true;
    }

    return NextResponse.json({
      success: anyUpdated,
      message: `Review status updated to ${status}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    const shards = getAllAdminClients();
    let anyDeleted = false;

    for (const { client } of shards) {
      const { error } = await client.from('reviews').delete().eq('id', id);
      if (!error) anyDeleted = true;
    }

    return NextResponse.json({ success: anyDeleted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete review' },
      { status: 500 }
    );
  }
}
