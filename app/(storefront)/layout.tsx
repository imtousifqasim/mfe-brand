import React from 'react';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { NavigationProgressBar } from '@/components/layout/NavigationProgressBar';
import { SettingsRepository } from '@/repositories/settings.repository';

import { CustomerProvider } from '@/components/providers/CustomerProvider';

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const announcement = await SettingsRepository.getAnnouncement();

  return (
    <CustomerProvider>
      <div className="flex flex-col min-h-screen bg-white text-[#141414] selection:bg-[#d99026]/20 selection:text-[#141414]">
        <NavigationProgressBar />
        {announcement && announcement.is_active && (
          <AnnouncementBar
            message={announcement.message}
            couponCode={announcement.coupon_code}
            linkUrl={announcement.link_url}
          />
        )}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CustomerProvider>
  );
}
