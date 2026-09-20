import { NextRequest, NextResponse } from 'next/server';
import { SettingsRepository } from '@/repositories/settings.repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await SettingsRepository.getShippingSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Failed to get admin shipping settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve shipping settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const deliveryCharge = Number(body.deliveryCharge);

    if (isNaN(deliveryCharge) || deliveryCharge < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid delivery charge value. Must be a positive number.' },
        { status: 400 }
      );
    }

    const freeDeliveryThreshold = body.freeDeliveryThreshold !== undefined && body.freeDeliveryThreshold !== null && body.freeDeliveryThreshold !== ''
      ? Number(body.freeDeliveryThreshold)
      : null;

    const updated = await SettingsRepository.updateShippingSettings({
      deliveryCharge,
      freeDeliveryThreshold: isNaN(freeDeliveryThreshold as number) ? null : freeDeliveryThreshold,
    });

    await SettingsRepository.logAudit(
      'UPDATE_SHIPPING_SETTINGS',
      'settings',
      'shipping',
      { deliveryCharge, freeDeliveryThreshold }
    );

    return NextResponse.json({
      success: true,
      message: 'Delivery charges successfully updated across all stores and checkout.',
      settings: updated,
    });
  } catch (error) {
    console.error('Failed to update shipping settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update delivery charges' },
      { status: 500 }
    );
  }
}
