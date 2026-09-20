import { createAdminClient, getAllAdminClients, queryAcrossAllShards } from '@/lib/supabase/admin';
import { HeroSlide, Advantage, Announcement, Courier, PaymentMethodConfig, NotificationSetting, AuditLog } from '@/types/database';
import { SEED_HERO_SLIDES, SEED_ADVANTAGES, SEED_ANNOUNCEMENT, SEED_COURIERS, SEED_PAYMENT_METHODS } from '@/lib/data/seed-data';

export interface ShippingSettings {
  deliveryCharge: number;
  freeDeliveryThreshold: number | null;
}

export class SettingsRepository {
  private static mockSlides = [...SEED_HERO_SLIDES];
  private static mockAdvantages = [...SEED_ADVANTAGES];
  private static mockAnnouncement = { ...SEED_ANNOUNCEMENT };
  private static mockPaymentMethods = [...SEED_PAYMENT_METHODS];
  private static mockCouriers = [...SEED_COURIERS];
  private static mockShippingSettings: ShippingSettings = { deliveryCharge: 100, freeDeliveryThreshold: null };
  private static mockNotifications: NotificationSetting[] = [
    { id: 'notif-1', event_key: 'order_confirmation', event_name: 'Order Confirmation Email', is_email_enabled: true, description: 'Sent immediately upon successful checkout.' },
    { id: 'notif-2', event_key: 'order_processing', event_name: 'Order Processing Email', is_email_enabled: true, description: 'Sent when warehouse starts preparing parcel.' },
    { id: 'notif-3', event_key: 'order_shipped', event_name: 'Order Shipped with Tracking ID', is_email_enabled: true, description: 'Sent with tracking URL and courier.' },
    { id: 'notif-4', event_key: 'order_delivered', event_name: 'Order Delivered Email', is_email_enabled: true, description: 'Sent upon successful doorstep delivery.' },
    { id: 'notif-5', event_key: 'order_cancelled', event_name: 'Order Cancellation Alert', is_email_enabled: true, description: 'Sent if order is cancelled.' },
  ];
  private static mockAuditLogs: AuditLog[] = [
    { id: 'aud-1', admin_email: 'admin@mfebrand.com', action: 'STORE_INITIALIZED', entity_type: 'system', created_at: new Date().toISOString() }
  ];

  static async getHeroSlides(): Promise<HeroSlide[]> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('hero_slides').select('*').eq('is_active', true).order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data as HeroSlide[];
    } catch {}
    return this.mockSlides;
  }

  static async addHeroSlide(slide: Partial<HeroSlide>): Promise<HeroSlide> {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      image_url: slide.image_url || '',
      mobile_image_url: slide.mobile_image_url || null,
      heading: slide.heading || 'New Collection',
      subtitle: slide.subtitle || null,
      button_text: slide.button_text || 'Shop Now',
      button_url: slide.button_url || '/products',
      sort_order: slide.sort_order || this.mockSlides.length + 1,
      is_active: true,
    };
    this.mockSlides.push(newSlide);
    return newSlide;
  }

  static async getAdvantages(): Promise<Advantage[]> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('advantages').select('*').eq('is_active', true).order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data as Advantage[];
    } catch {}
    return this.mockAdvantages;
  }

  static async getAnnouncement(): Promise<Announcement> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('announcements').select('*').eq('is_active', true).limit(1).single();
      if (!error && data) return data as Announcement;
    } catch {}
    return this.mockAnnouncement;
  }

  static async updateAnnouncement(params: {
    message?: string;
    couponCode?: string | null;
    whatsappNumber?: string | null;
    tickerMessages?: string[] | null;
    isActive?: boolean;
  }): Promise<Announcement> {
    if (params.message !== undefined) this.mockAnnouncement.message = params.message;
    if (params.couponCode !== undefined) this.mockAnnouncement.coupon_code = params.couponCode;
    if (params.whatsappNumber !== undefined) this.mockAnnouncement.whatsapp_number = params.whatsappNumber;
    if (params.tickerMessages !== undefined) this.mockAnnouncement.ticker_messages = params.tickerMessages;
    if (params.isActive !== undefined) this.mockAnnouncement.is_active = params.isActive;
    return this.mockAnnouncement;
  }

  static async getShippingSettings(): Promise<ShippingSettings> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'general')
        .maybeSingle();

      if (!error && data?.value) {
        const val = data.value as any;
        const deliveryCharge = typeof val.default_shipping_fee === 'number' ? val.default_shipping_fee : 100;
        const freeDeliveryThreshold = val.free_shipping_threshold ? Number(val.free_shipping_threshold) : null;
        this.mockShippingSettings = { deliveryCharge, freeDeliveryThreshold };
        return this.mockShippingSettings;
      }
    } catch {}
    return this.mockShippingSettings;
  }

  static async updateShippingSettings(settings: {
    deliveryCharge: number;
    freeDeliveryThreshold?: number | null;
  }): Promise<ShippingSettings> {
    const deliveryCharge = Number(settings.deliveryCharge) || 100;
    const freeDeliveryThreshold = settings.freeDeliveryThreshold ? Number(settings.freeDeliveryThreshold) : null;
    this.mockShippingSettings = { deliveryCharge, freeDeliveryThreshold };

    try {
      const shards = getAllAdminClients();
      for (const { client } of shards) {
        const { data: existing } = await client
          .from('site_settings')
          .select('value')
          .eq('key', 'general')
          .maybeSingle();

        const currentVal = existing?.value || {};
        const updatedVal = {
          ...currentVal,
          default_shipping_fee: deliveryCharge,
          free_shipping_threshold: freeDeliveryThreshold,
        };

        await client
          .from('site_settings')
          .upsert({
            key: 'general',
            value: updatedVal,
            updated_at: new Date().toISOString(),
          });
      }
    } catch (e) {
      console.error('Failed to sync shipping settings across shards:', e);
    }

    return this.mockShippingSettings;
  }

  static async getPaymentMethods(): Promise<PaymentMethodConfig[]> {
    try {
      const data = await queryAcrossAllShards<PaymentMethodConfig>(async (supabase) => {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .order('sort_order', { ascending: true });
        if (error || !data) return [];
        return data as PaymentMethodConfig[];
      }, (items) => {
        const map = new Map<string, PaymentMethodConfig>();
        items.forEach(p => map.set(p.code || p.id, p));
        return Array.from(map.values()).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      });

      if (data && data.length > 0) {
        this.mockPaymentMethods = data;
        return data;
      }
    } catch (e) {
      console.error('Failed to fetch payment methods from DB, using fallback:', e);
    }
    return this.mockPaymentMethods;
  }

  static async getActivePaymentMethods(): Promise<PaymentMethodConfig[]> {
    const methods = await this.getPaymentMethods();
    return methods.filter(pm => pm.is_active).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }

  static async updatePaymentMethod(id: string, updates: Partial<PaymentMethodConfig>): Promise<PaymentMethodConfig | null> {
    try {
      const shards = getAllAdminClients();
      let updatedRow: PaymentMethodConfig | null = null;

      for (const { client } of shards) {
        const { data, error } = await client
          .from('payment_methods')
          .update(updates)
          .or(`id.eq.${id},code.eq.${id}`)
          .select()
          .maybeSingle();

        if (!error && data) {
          updatedRow = data as PaymentMethodConfig;
        }
      }

      if (updatedRow) {
        const idx = this.mockPaymentMethods.findIndex(p => p.id === id || p.code === id);
        if (idx !== -1) {
          this.mockPaymentMethods[idx] = { ...this.mockPaymentMethods[idx], ...updatedRow };
        }
        return updatedRow;
      }
    } catch (e) {
      console.error('Failed to update payment method in Supabase shards:', e);
    }

    const index = this.mockPaymentMethods.findIndex(p => p.id === id || p.code === id);
    if (index !== -1) {
      this.mockPaymentMethods[index] = { ...this.mockPaymentMethods[index], ...updates };
      return this.mockPaymentMethods[index];
    }
    return null;
  }

  static async updatePaymentMethods(methods: PaymentMethodConfig[]): Promise<PaymentMethodConfig[]> {
    try {
      const shards = getAllAdminClients();
      for (const method of methods) {
        for (const { client } of shards) {
          await client
            .from('payment_methods')
            .upsert(method, { onConflict: 'code' });
        }
      }
    } catch (e) {
      console.error('Failed to bulk update payment methods across shards:', e);
    }
    this.mockPaymentMethods = methods;
    return this.mockPaymentMethods;
  }

  static async getCouriers(): Promise<Courier[]> {
    return this.mockCouriers;
  }

  static async getNotificationSettings(): Promise<NotificationSetting[]> {
    return this.mockNotifications;
  }

  static async toggleNotification(id: string, enabled: boolean): Promise<boolean> {
    const item = this.mockNotifications.find(n => n.id === id);
    if (item) {
      item.is_email_enabled = enabled;
      return true;
    }
    return false;
  }

  static async logAudit(action: string, entityType: string, entityId?: string, metadata?: Record<string, unknown>, adminEmail = 'admin@mfebrand.com') {
    this.mockAuditLogs.unshift({
      id: `aud-${Date.now()}`,
      admin_email: adminEmail,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata,
      created_at: new Date().toISOString(),
    });
  }

  static async getAuditLogs(): Promise<AuditLog[]> {
    return this.mockAuditLogs.slice(0, 50);
  }
}
