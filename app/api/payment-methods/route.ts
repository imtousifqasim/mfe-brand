import { NextResponse } from 'next/server';
import { SettingsRepository } from '@/repositories/settings.repository';

export async function GET() {
  try {
    const methods = await SettingsRepository.getActivePaymentMethods();
    return NextResponse.json({
      success: true,
      paymentMethods: methods,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}
