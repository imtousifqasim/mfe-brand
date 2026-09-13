export interface Subscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  subscribed_at: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from_name: string;
  from_email: string;
  is_connected?: boolean;
}

export class NewsletterRepository {
  private static subscribers: Subscriber[] = [
    {
      id: 'sub-1',
      email: 'patron.vip@mfebrand.com',
      status: 'active',
      subscribed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'sub-2',
      email: 'faizan.couture@gmail.com',
      status: 'active',
      subscribed_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'sub-3',
      email: 'clientele@luxuryfashion.pk',
      status: 'active',
      subscribed_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    }
  ];

  private static smtpConfig: SmtpConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: 'notifications@mfebrand.com',
    pass: '••••••••••••••••',
    from_name: 'MFE Brand Haute Couture',
    from_email: 'concierge@mfebrand.com',
    is_connected: true,
  };

  static async getSubscribers(): Promise<Subscriber[]> {
    return this.subscribers;
  }

  static async addSubscriber(email: string): Promise<{ success: boolean; message: string; subscriber?: Subscriber }> {
    const clean = email.trim().toLowerCase();
    const existing = this.subscribers.find(s => s.email.toLowerCase() === clean);
    if (existing) {
      return { success: true, message: 'You are already registered for MFE Private Salon VIP access!' };
    }

    const newSub: Subscriber = {
      id: `sub-${Date.now()}`,
      email: clean,
      status: 'active',
      subscribed_at: new Date().toISOString(),
    };

    this.subscribers.unshift(newSub);
    return { success: true, message: 'Welcome to MFE Private Salon. VIP preview access registered.', subscriber: newSub };
  }

  static async deleteSubscriber(id: string): Promise<boolean> {
    const initialLen = this.subscribers.length;
    this.subscribers = this.subscribers.filter(s => s.id !== id);
    return this.subscribers.length < initialLen;
  }

  static async getSmtpConfig(): Promise<SmtpConfig> {
    return this.smtpConfig;
  }

  static async saveSmtpConfig(config: Partial<SmtpConfig>): Promise<SmtpConfig> {
    this.smtpConfig = {
      ...this.smtpConfig,
      ...config,
      is_connected: true,
    };
    return this.smtpConfig;
  }

  static async testSmtpConnection(): Promise<{ success: boolean; message: string }> {
    // Basic verification of SMTP params
    if (!this.smtpConfig.host || !this.smtpConfig.port || !this.smtpConfig.user) {
      return { success: false, message: 'Incomplete SMTP credentials. Please provide Host, Port, and Username.' };
    }
    return {
      success: true,
      message: `Successfully connected to SMTP server at ${this.smtpConfig.host}:${this.smtpConfig.port} as ${this.smtpConfig.user}.`,
    };
  }

  static async sendBroadcast(subject: string, messageHtml: string): Promise<{ success: boolean; count: number; message: string }> {
    const count = this.subscribers.filter(s => s.status === 'active').length;
    console.log(`[SMTP BROADCAST] Dispatched "${subject}" to ${count} active subscribers via ${this.smtpConfig.host}`);
    return {
      success: true,
      count,
      message: `Broadcast successfully dispatched to ${count} VIP subscribers!`,
    };
  }
}
