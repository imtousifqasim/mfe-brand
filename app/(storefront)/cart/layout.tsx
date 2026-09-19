import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Bag & Cart Review',
  description:
    'Review your selected Pakistani couture garments, luxury wool shawls, and leather goods before checkout with express nationwide delivery.',
  alternates: {
    canonical: 'https://mfe-brand.com/cart',
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Shopping Bag & Cart Review | MFE BRAND',
    description: 'Review your selected couture creations before white-glove delivery.',
    url: 'https://mfe-brand.com/cart',
    siteName: 'MFE BRAND',
    type: 'website',
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
