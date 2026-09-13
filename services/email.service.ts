import nodemailer, { type Transporter } from 'nodemailer';
import { NewsletterRepository, SmtpConfig } from '@/repositories/newsletter.repository';
import { Order } from '@/types/database';
import { formatPrice, formatDate } from '@/lib/utils';

export class EmailService {
  private static async getTransporter(): Promise<{ transporter: Transporter | null; config: SmtpConfig }> {
    const config = await NewsletterRepository.getSmtpConfig();

    if (!config.host || !config.port || !config.user || !config.pass) {
      return { transporter: null, config };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: Number(config.port),
        secure: Boolean(config.secure),
        auth: {
          user: config.user,
          pass: config.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      return { transporter, config };
    } catch (e) {
      console.error('Failed to create nodemailer transporter:', e);
      return { transporter: null, config };
    }
  }

  // 1. Order Confirmation Email
  static async sendOrderConfirmation(order: Order): Promise<boolean> {
    try {
      const { transporter, config } = await this.getTransporter();
      const html = this.generateOrderConfirmationHtml(order);

      if (!transporter) {
        console.log(`[EMAIL SIMULATION] Order Confirmation for #${order.order_number} to ${order.customer_email}`);
        return true;
      }

      await transporter.sendMail({
        from: `"${config.from_name || 'MFE Brand Haute Couture'}" <${config.from_email || config.user}>`,
        to: order.customer_email,
        subject: `Order Confirmed: #${order.order_number} • MFE Brand Haute Couture`,
        html,
      });

      console.log(`[EMAIL DISPATCH] Sent Order Confirmation to ${order.customer_email} for #${order.order_number}`);
      return true;
    } catch (err) {
      console.error('Failed to dispatch order confirmation email:', err);
      return false;
    }
  }

  // 2. Account Welcome & Credentials Email
  static async sendAccountCreated(
    customer: { full_name?: string; email: string; phone?: string | null; username?: string | null }, 
    plainPassword?: string
  ): Promise<boolean> {
    try {
      const { transporter, config } = await this.getTransporter();
      const html = this.generateAccountCreatedHtml(customer, plainPassword);

      if (!transporter) {
        console.log(`[EMAIL SIMULATION] Welcome Email with Credentials to ${customer.email}`);
        return true;
      }

      await transporter.sendMail({
        from: `"${config.from_name || 'MFE Brand Haute Couture'}" <${config.from_email || config.user}>`,
        to: customer.email,
        subject: `Welcome to MFE Patron Lounge • Your Atelier Account Credentials`,
        html,
      });

      console.log(`[EMAIL DISPATCH] Sent Account Welcome & Credentials to ${customer.email}`);
      return true;
    } catch (err) {
      console.error('Failed to dispatch account welcome email:', err);
      return false;
    }
  }

  // 3. Shipment Tracking Email
  static async sendTrackingUpdate(order: Order): Promise<boolean> {
    try {
      const { transporter, config } = await this.getTransporter();
      const html = this.generateTrackingUpdateHtml(order);

      if (!transporter) {
        console.log(`[EMAIL SIMULATION] Tracking Update for #${order.order_number} to ${order.customer_email}`);
        return true;
      }

      await transporter.sendMail({
        from: `"${config.from_name || 'MFE Brand Haute Couture'}" <${config.from_email || config.user}>`,
        to: order.customer_email,
        subject: `Your Atelier Consignment has Shipped • Tracking #${order.tracking_id || order.order_number}`,
        html,
      });

      console.log(`[EMAIL DISPATCH] Sent Tracking Dispatch Email to ${order.customer_email}`);
      return true;
    } catch (err) {
      console.error('Failed to dispatch tracking email:', err);
      return false;
    }
  }

  // --- LUXURY HTML TEMPLATES ---

  static generateOrderConfirmationHtml(order: Order): string {
    const itemsList = order.items && order.items.length > 0
      ? order.items.map(it => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #eae7e2;">
            <div style="font-weight: 700; color: #141414; font-size: 14px;">${it.product_name}</div>
            <div style="font-size: 11px; color: #8c827a; margin-top: 3px;">SKU: ${it.sku || 'MFE-BESPOKE'} • Qty: ${it.quantity}</div>
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #eae7e2; text-align: right; font-weight: 700; color: #141414; font-size: 14px; font-family: monospace;">
            ${formatPrice(it.subtotal || (it.unit_price * it.quantity))}
          </td>
        </tr>
      `).join('')
      : `<tr><td colspan="2" style="padding: 12px 0; color: #6b6b6b; font-size: 13px;">Bespoke Haute Couture Garments Allocation</td></tr>`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation #${order.order_number}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; padding: 40px 15px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border: 1px solid #e8dfd2; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #141414; padding: 36px 30px; text-align: center; border-bottom: 3px solid #d99026;">
                    <div style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; letter-spacing: 0.25em; color: #ffffff; text-transform: uppercase;">MFE BRAND</div>
                    <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.35em; color: #d99026; text-transform: uppercase; margin-top: 6px;">Haute Couture Atelier • Pakistan</div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 36px;">
                    <div style="display: inline-block; background-color: #f7f3ec; border: 1px solid #e5dac9; border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; color: #b87414; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 16px;">
                      ✓ Order Confirmed & Booked
                    </div>
                    
                    <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: bold; color: #141414; margin: 0 0 12px 0;">
                      Thank You for Your Patronage, ${order.customer_name || 'Valued Patron'}
                    </h1>
                    
                    <p style="font-size: 13px; line-height: 1.6; color: #5a5550; margin: 0 0 24px 0;">
                      We have received your atelier order. Master artisans are preparing your hand-embroidered ensemble with discerning attention to silhouette, tilla finesse, and fabric drape.
                    </p>

                    <!-- Order Summary Box -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; border: 1px solid #eae7e2; border-radius: 14px; padding: 18px 20px; margin-bottom: 26px;">
                      <tr>
                        <td style="font-size: 11px; color: #8c827a; text-transform: uppercase; font-weight: 700;">Order Reference</td>
                        <td style="font-size: 11px; color: #8c827a; text-transform: uppercase; font-weight: 700; text-align: right;">Booking Date</td>
                      </tr>
                      <tr>
                        <td style="font-family: monospace; font-size: 15px; font-weight: bold; color: #b87414; padding-top: 4px;">${order.order_number}</td>
                        <td style="font-size: 13px; color: #141414; font-weight: 600; padding-top: 4px; text-align: right;">${formatDate(order.created_at)}</td>
                      </tr>
                    </table>

                    <!-- Itemized Ensembles -->
                    <h2 style="font-size: 13px; font-weight: 700; color: #141414; text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 12px 0;">
                      Ordered Creations
                    </h2>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                      ${itemsList}
                    </table>

                    <!-- Financial Summary -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 2px solid #141414; padding-top: 14px; margin-bottom: 28px;">
                      <tr>
                        <td style="font-size: 13px; color: #6b6b6b; padding: 4px 0;">Subtotal</td>
                        <td style="font-size: 13px; color: #141414; font-weight: 600; text-align: right; font-family: monospace;">${formatPrice(order.subtotal || order.grand_total)}</td>
                      </tr>
                      ${order.discount_amount > 0 ? `
                        <tr>
                          <td style="font-size: 13px; color: #16a34a; padding: 4px 0;">Coupon Discount</td>
                          <td style="font-size: 13px; color: #16a34a; font-weight: 600; text-align: right; font-family: monospace;">-${formatPrice(order.discount_amount)}</td>
                        </tr>
                      ` : ''}
                      <tr>
                        <td style="font-size: 13px; color: #6b6b6b; padding: 4px 0;">Nationwide Courier</td>
                        <td style="font-size: 13px; color: #16a34a; font-weight: 600; text-align: right;">${order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : 'FREE'}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 16px; font-weight: bold; color: #141414; padding-top: 10px;">Grand Total</td>
                        <td style="font-size: 18px; font-weight: bold; color: #d99026; text-align: right; padding-top: 10px; font-family: monospace;">${formatPrice(order.grand_total)}</td>
                      </tr>
                    </table>

                    <!-- Shipping Destination -->
                    <div style="background-color: #faf8f5; border: 1px solid #eae7e2; border-radius: 14px; padding: 18px 20px; margin-bottom: 30px; font-size: 12px; line-height: 1.6; color: #5a5550;">
                      <strong style="color: #141414; display: block; font-size: 13px; margin-bottom: 4px;">Delivery Destination:</strong>
                      ${order.customer_name} • ${order.customer_phone}<br>
                      ${order.shipping_address?.address_line1 || 'Address on file'}<br>
                      ${order.shipping_address?.city || 'Pakistan'}, ${order.shipping_address?.province || ''}
                    </div>

                    <!-- CTA Button -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <a href="https://mfebrand.com/track-order?order=${order.order_number}&email=${encodeURIComponent(order.customer_email || '')}" 
                             style="display: inline-block; background-color: #d99026; color: #141414; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.18em; text-decoration: none; padding: 14px 34px; border-radius: 30px; box-shadow: 0 4px 12px rgba(217,144,38,0.25);">
                            Track Consignment Live →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7f5f2; padding: 26px 30px; text-align: center; border-top: 1px solid #eae7e2; font-size: 11px; color: #8c827a; line-height: 1.6;">
                    MFE Brand Haute Couture Atelier • Gulberg III, Lahore, Pakistan<br>
                    Concierge Helpline: +92 300 1234567 • concierge@mfebrand.com
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  static generateAccountCreatedHtml(customer: { full_name?: string; email: string; phone?: string | null; username?: string | null }, plainPassword?: string): string {
    const usernameDisplay = customer.username ? customer.username : customer.email;
    const passwordHtml = plainPassword ? `
      <div style="background-color: #fdfbf7; border: 1px solid #e8dfd2; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
          ${customer.username ? `
          <tr>
            <td style="color: #8c827a; font-weight: 700; width: 130px; padding: 4px 0;">Chosen Username:</td>
            <td style="color: #141414; font-weight: bold; font-family: monospace;">${customer.username}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="color: #8c827a; font-weight: 700; width: 130px; padding: 4px 0;">Patron Email:</td>
            <td style="color: #141414; font-weight: bold; font-family: monospace;">${customer.email}</td>
          </tr>
          <tr>
            <td style="color: #8c827a; font-weight: 700; padding: 4px 0;">Initial Password:</td>
            <td style="color: #b87414; font-weight: bold; font-family: monospace; font-size: 15px;">${plainPassword}</td>
          </tr>
        </table>
      </div>
    ` : `
      <div style="background-color: #fdfbf7; border: 1px solid #e8dfd2; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; color: #141414;">
        ${customer.username ? `<strong>Username:</strong> <span style="font-family: monospace;">${customer.username}</span><br>` : ''}
        <strong>Registered Email:</strong> <span style="font-family: monospace;">${customer.email}</span><br>
        <span style="font-size: 11px; color: #8c827a;">Your chosen private password has been encrypted in our multi-shard database.</span>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MFE Patron Lounge</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; padding: 40px 15px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border: 1px solid #e8dfd2; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                <tr>
                  <td style="background-color: #141414; padding: 36px 30px; text-align: center; border-bottom: 3px solid #d99026;">
                    <div style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; letter-spacing: 0.25em; color: #ffffff; text-transform: uppercase;">MFE BRAND</div>
                    <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.35em; color: #d99026; text-transform: uppercase; margin-top: 6px;">Haute Couture Atelier • Pakistan</div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 40px 36px;">
                    <div style="display: inline-block; background-color: #f7f3ec; border: 1px solid #e5dac9; border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; color: #b87414; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 16px;">
                      ✦ VIP Patron Lounge Access Granted
                    </div>

                    <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: bold; color: #141414; margin: 0 0 12px 0;">
                      Welcome to the Atelier, ${customer.full_name || 'Esteemed Patron'}
                    </h1>

                    <p style="font-size: 13px; line-height: 1.6; color: #5a5550; margin: 0 0 16px 0;">
                      Your private patron account has been activated. You now enjoy priority garment reservation, live consignment tracking, saved address books, and VIP preview access to new couture capsules.
                    </p>

                    <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; color: #141414; margin: 20px 0 6px 0;">
                      Your Login Credentials:
                    </h3>

                    ${passwordHtml}

                    <p style="font-size: 12px; color: #6b6b6b; line-height: 1.5; margin-bottom: 28px;">
                      You can log into your account anytime to inspect your bespoke order history, download tax invoices, and track parcel dispatch milestones.
                    </p>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <a href="https://mfebrand.com/account" 
                             style="display: inline-block; background-color: #141414; color: #ffffff; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.18em; text-decoration: none; padding: 14px 34px; border-radius: 30px; box-shadow: 0 4px 12px rgba(20,20,20,0.2);">
                            Access Patron Lounge →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="background-color: #f7f5f2; padding: 26px 30px; text-align: center; border-top: 1px solid #eae7e2; font-size: 11px; color: #8c827a; line-height: 1.6;">
                    MFE Brand Haute Couture Atelier • Gulberg III, Lahore, Pakistan<br>
                    Security Notice: For your protection, never share your password with anyone.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  static generateTrackingUpdateHtml(order: Order): string {
    const courierName = order.courier?.name || (order.courier_id ? String(order.courier_id).toUpperCase() : 'TCS Express');
    const trackingUrl = order.tracking_url || `https://mfebrand.com/track-order?order=${order.order_number}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Dispatched #${order.order_number}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; padding: 40px 15px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border: 1px solid #e8dfd2; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                <tr>
                  <td style="background-color: #141414; padding: 36px 30px; text-align: center; border-bottom: 3px solid #d99026;">
                    <div style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; letter-spacing: 0.25em; color: #ffffff; text-transform: uppercase;">MFE BRAND</div>
                    <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.35em; color: #d99026; text-transform: uppercase; margin-top: 6px;">Haute Couture Atelier • Pakistan</div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 40px 36px;">
                    <div style="display: inline-block; background-color: #e0f2fe; border: 1px solid #bae6fd; border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 16px;">
                      🚚 Consignment In Transit
                    </div>

                    <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: bold; color: #141414; margin: 0 0 12px 0;">
                      Your Atelier Creation Has Been Dispatched
                    </h1>

                    <p style="font-size: 13px; line-height: 1.6; color: #5a5550; margin: 0 0 24px 0;">
                      Dear ${order.customer_name || 'Valued Patron'}, your order #${order.order_number} has completed luxury quality inspection and has been handed over to our courier partner for doorstep express delivery.
                    </p>

                    <!-- Tracking Box -->
                    <div style="background-color: #faf8f5; border: 1px solid #eae7e2; border-radius: 14px; padding: 22px; margin-bottom: 26px;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                        <tr>
                          <td style="color: #8c827a; font-weight: 700; padding: 6px 0;">Courier Partner:</td>
                          <td style="color: #141414; font-weight: bold; text-align: right;">${courierName}</td>
                        </tr>
                        <tr>
                          <td style="color: #8c827a; font-weight: 700; padding: 6px 0;">Consignment ID:</td>
                          <td style="color: #b87414; font-weight: bold; font-family: monospace; font-size: 15px; text-align: right;">${order.tracking_id || 'Generating ID'}</td>
                        </tr>
                        <tr>
                          <td style="color: #8c827a; font-weight: 700; padding: 6px 0;">Destination City:</td>
                          <td style="color: #141414; font-weight: 600; text-align: right;">${order.shipping_address?.city || 'Pakistan'}</td>
                        </tr>
                      </table>
                    </div>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <a href="${trackingUrl}" 
                             style="display: inline-block; background-color: #d99026; color: #141414; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.18em; text-decoration: none; padding: 14px 34px; border-radius: 30px; box-shadow: 0 4px 12px rgba(217,144,38,0.25);">
                            Track Consignment Live →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="background-color: #f7f5f2; padding: 26px 30px; text-align: center; border-top: 1px solid #eae7e2; font-size: 11px; color: #8c827a; line-height: 1.6;">
                    MFE Brand Haute Couture Atelier • Gulberg III, Lahore, Pakistan<br>
                    Standard delivery takes 2 to 3 business days across all major Pakistani cities.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  static generateNewsletterHtml(subject?: string, content?: string): string {
    const title = subject || 'The Festive Velvet Capsule • Private Atelier Preview';
    const bodyText = content || `We cordially invite you to experience our newest couture release: The Festive Velvet Capsule.

Handcrafted with raw silk lining, antique zardozi embellishments, and custom tailoring, each ensemble is crafted for discerning clientele across Pakistan and internationally.

As a registered member of our Private Salon, your priority atelier reservations are now open before public allocation.`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; padding: 40px 15px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border: 1px solid #e8dfd2; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                <tr>
                  <td style="background-color: #141414; padding: 36px 30px; text-align: center; border-bottom: 3px solid #d99026;">
                    <div style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; letter-spacing: 0.25em; color: #ffffff; text-transform: uppercase;">MFE BRAND</div>
                    <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.35em; color: #d99026; text-transform: uppercase; margin-top: 6px;">Haute Couture Atelier • Pakistan</div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 40px 36px;">
                    <div style="display: inline-block; background-color: #f7f3ec; border: 1px solid #e5dac9; border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; color: #b87414; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 16px;">
                      ✦ Private Salon VIP Gazette
                    </div>

                    <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: bold; color: #141414; margin: 0 0 16px 0; line-height: 1.35;">
                      ${title}
                    </h1>

                    <div style="font-size: 13px; line-height: 1.75; color: #4a4540; margin-bottom: 28px; white-space: pre-line;">
                      ${bodyText}
                    </div>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <a href="https://mfebrand.com/products" 
                             style="display: inline-block; background-color: #d99026; color: #141414; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.18em; text-decoration: none; padding: 14px 34px; border-radius: 30px; box-shadow: 0 4px 12px rgba(217,144,38,0.25);">
                            Explore New Capsule →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="background-color: #f7f5f2; padding: 26px 30px; text-align: center; border-top: 1px solid #eae7e2; font-size: 11px; color: #8c827a; line-height: 1.6;">
                    MFE Brand Haute Couture Atelier • Gulberg III, Lahore, Pakistan<br>
                    You are receiving this bespoke bulletin as a distinguished member of MFE Private Salon.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
