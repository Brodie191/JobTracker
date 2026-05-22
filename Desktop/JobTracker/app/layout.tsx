import type { Metadata } from 'next';
import { Courier_Prime } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from './providers';
import './globals.css';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Job Tracker',
  description: 'Track your job applications with a kanban board.',
};

const courierPrime = Courier_Prime({
  subsets: ['latin'],
  variable: '--font-courier',
  weight: ['400', '700'],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={courierPrime.variable} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
