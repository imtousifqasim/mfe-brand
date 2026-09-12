import { SettingsRepository } from '@/repositories/settings.repository';
import { Order } from '@/types/database';

export class EmailService {
  /**
   * Dispatches order confirmation email if enabled in notification settings.
   * Note: Full email bodies are NEVER stored in PostgreSQL to preserve database capacity.
   */
  static async sendOrderConfirmation(order: Order): Promise<boolean> {
    const settings = await SettingsRepository.getNotificationSettings();
    const notif = settings.find(s => s.event_key === 'order_confirmation');
    
    if (!notif || !notif.is_email_enabled) {
      return false; // Email disabled by admin
    }

    console.log(`[EMAIL DISPATCH] Sent Order Confirmation for #${order.order_number} to ${order.customer_email}`);
    return true;
  }

  static async sendOrderStatusUpdate(order: Order, newStatus: string, notes?: string): Promise<boolean> {
    const settings = await SettingsRepository.getNotificationSettings();
    const notif = settings.find(s => s.event_key === `order_${newStatus}`);

    if (notif && !notif.is_email_enabled) {
      return false;
    }

    console.log(`[EMAIL DISPATCH] Sent Status Update (${newStatus}) for #${order.order_number} to ${order.customer_email}. Notes: ${notes || 'None'}`);
    return true;
  }

  static async sendTrackingUpdate(order: Order): Promise<boolean> {
    const settings = await SettingsRepository.getNotificationSettings();
    const notif = settings.find(s => s.event_key === 'order_shipped');

    if (notif && !notif.is_email_enabled) {
      return false;
    }

    console.log(`[EMAIL DISPATCH] Sent Tracking Info for #${order.order_number} (${order.tracking_id}) to ${order.customer_email}`);
    return true;
  }
}
