import { NextRequest, NextResponse } from 'next/server';
import { SettingsRepository } from '@/repositories/settings.repository';
import { PaymentMethodConfig } from '@/types/database';

export async function GET() {
  try {
    const methods = await SettingsRepository.getPaymentMethods();
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // If an array of payment methods is provided, update all
    if (Array.isArray(body.paymentMethods)) {
      const updated = await SettingsRepository.updatePaymentMethods(body.paymentMethods);
      await SettingsRepository.logAudit(
        'payment_methods_bulk_updated',
        'payment_gateway',
        'all',
        { count: updated.length }
      );
      return NextResponse.json({
        success: true,
        paymentMethods: updated,
      });
    }

    // If a single method is provided with id/code
    const { id, updates } = body;
    if (!id || !updates) {
      return NextResponse.json(
        { success: false, error: 'Payment method ID and updates are required' },
        { status: 400 }
      );
    }

    const updated = await SettingsRepository.updatePaymentMethod(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Payment method not found' },
        { status: 404 }
      );
    }

    await SettingsRepository.logAudit(
      'payment_method_updated',
      'payment_gateway',
      id,
      updates
    );

    return NextResponse.json({
      success: true,
      paymentMethod: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update payment method' },
      { status: 500 }
    );
  }
}
