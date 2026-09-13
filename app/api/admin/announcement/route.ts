import { NextRequest, NextResponse } from 'next/server';
import { SettingsRepository } from '@/repositories/settings.repository';

export async function GET() {
  try {
    const announcement = await SettingsRepository.getAnnouncement();
    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Failed to get announcement:', error);
    return NextResponse.json({ error: 'Failed to fetch announcement' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await SettingsRepository.updateAnnouncement({
      message: body.message,
      couponCode: body.couponCode,
      whatsappNumber: body.whatsappNumber,
      tickerMessages: body.tickerMessages,
      isActive: body.isActive,
    });
    return NextResponse.json({ success: true, announcement: updated });
  } catch (error) {
    console.error('Failed to update announcement:', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}
