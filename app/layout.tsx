import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MFE BRAND | Haute Couture & Luxury Pret Atelier',
  description: 'Official online maison for MFE BRAND. Discover handcrafted luxury unstitched lawn, festive velvet formals, bespoke pret, and heirloom pashmina shawls with nationwide white-glove express delivery.',
  keywords: ['MFE Brand', 'Pakistani luxury fashion', 'haute couture lawn', 'pret wear', 'festive formals', 'pashmina shawls', 'bespoke atelier'],
  openGraph: {
    title: 'MFE BRAND | Haute Couture & Luxury Pret',
    description: 'Centuries of Lahore artisan heritage tailored for the contemporary connoisseur.',
    type: 'website',
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
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white text-[#141414] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
