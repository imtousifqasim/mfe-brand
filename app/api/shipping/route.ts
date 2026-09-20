import { NextResponse } from 'next/server';
import { SettingsRepository } from '@/repositories/settings.repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await SettingsRepository.getShippingSettings();
    return NextResponse.json({
      success: true,
      deliveryCharge: settings.deliveryCharge,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
    });
  } catch (error) {
    console.error('Failed to get shipping settings:', error);
    return NextResponse.json({
      success: true,
      deliveryCharge: 100,
      freeDeliveryThreshold: null,
    });
  }
}
