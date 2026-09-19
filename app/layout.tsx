import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mfe-brand.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MFE BRAND | Haute Couture & Luxury Pret Atelier',
    template: '%s | MFE BRAND',
  },
  description:
    'Official online maison for MFE BRAND. Discover handcrafted luxury Pakistani unstitched lawn, festive velvet formals, bespoke pret, and heirloom pashmina shawls with nationwide white-glove express delivery.',
  keywords: [
    'MFE Brand',
    'Pakistani luxury fashion',
    'haute couture lawn',
    'pret wear',
    'festive formals',
    'pashmina shawls',
    'bespoke atelier',
    'unstitched suits online Pakistan',
    'designer menswear Lahore',
    'leather wallets Pakistan',
  ],
  authors: [{ name: 'MFE BRAND Atelier', url: siteUrl }],
  creator: 'MFE BRAND',
  publisher: 'MFE BRAND',
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MFE BRAND | Haute Couture & Luxury Pret Atelier',
    description:
      'Centuries of Lahore artisan heritage tailored for the contemporary connoisseur. Discover handcrafted festive formals and luxury pret.',
    url: siteUrl,
    siteName: 'MFE BRAND',
    locale: 'en_PK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MFE BRAND | Haute Couture & Luxury Pret Atelier',
    description:
      'Centuries of Lahore artisan heritage tailored for the contemporary connoisseur.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased bg-white text-[#141414] selection:bg-[#d99026]/20 selection:text-[#141414]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://i.postimg.cc" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://i.postimg.cc" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white text-[#141414] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
