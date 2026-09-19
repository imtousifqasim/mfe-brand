import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Sign In & Private Salon Access',
  description: 'Sign in to your private MFE BRAND atelier account to view orders, loyalty status, and saved addresses.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
