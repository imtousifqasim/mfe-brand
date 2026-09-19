import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Atelier Order',
  description: 'Track the real-time fulfillment and courier delivery status of your MFE BRAND luxury order.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
