import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('>>> [MOBILE_CLIENT_LOG]', JSON.stringify(data));
  } catch {}
  return NextResponse.json({ ok: true });
}
