import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Luxury Creations',
  description: 'Side-by-side comparison of MFE BRAND luxury silhouettes, materials, and artisan workmanship.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
