import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Curated Atelier Wishlist',
  description:
    'Your personal salon curation of handcrafted silhouettes, bespoke festive formals, and bridal couture at MFE BRAND.',
  alternates: {
    canonical: 'https://mfe-brand.com/wishlist',
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Curated Atelier Wishlist | MFE BRAND',
    description: 'Personal salon curation of luxury Pakistani couture silhouettes.',
    url: 'https://mfe-brand.com/wishlist',
    siteName: 'MFE BRAND',
    type: 'website',
  },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
