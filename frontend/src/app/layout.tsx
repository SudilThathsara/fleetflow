import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DynamicBrandingHead } from '@/components/layout/DynamicBrandingHead';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Tourism & Transport — Fleet & Operations',
  description:
    'Comprehensive Enterprise Fleet, Driver, Running Chart, Invoicing & Transport Operations Management System for Sri Lanka.',
  icons: {
    icon: '/api/branding/favicon',
    shortcut: '/api/branding/favicon',
    apple: '/api/branding/favicon',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}>
        <DynamicBrandingHead />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
