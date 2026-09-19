import { Metadata } from 'next';
import { AccountLayoutClient } from '@/components/account/AccountLayoutClient';

export const metadata: Metadata = {
  title: 'Client Salon Account & Patron Lounge',
  description: 'Private patron account lounge for MFE BRAND clientele.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountLayoutClient>{children}</AccountLayoutClient>;
}
