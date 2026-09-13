import React from 'react';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { NavigationProgressBar } from '@/components/layout/NavigationProgressBar';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { SettingsRepository } from '@/repositories/settings.repository';
import { CustomerProvider } from '@/components/providers/CustomerProvider';
import { CartProvider } from '@/components/providers/CartProvider';

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const announcement = await SettingsRepository.getAnnouncement();

  return (
    <CustomerProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen bg-white text-[#141414] selection:bg-[#d99026]/20 selection:text-[#141414]">
          <NavigationProgressBar />
          {announcement && announcement.is_active && (
            <AnnouncementBar
              message={announcement.message}
              couponCode={announcement.coupon_code}
              linkUrl={announcement.link_url}
              whatsappNumber={announcement.whatsapp_number}
              tickerMessages={announcement.ticker_messages}
            />
          )}
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </div>
      </CartProvider>
    </CustomerProvider>
  );
}
