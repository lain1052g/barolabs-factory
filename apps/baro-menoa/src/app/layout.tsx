import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import './globals.css';

export const metadata: Metadata = {
  title: '메노아 | 갱년기 건강 파트너',
  description: '갱년기 증상을 스마트하게 추적하고, 건강을 다시 찾아드립니다.',
  keywords: ['갱년기', '폐경', '증상 관리', '여성 건강', '메노아'],
  authors: [{ name: '바로랩스' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '메노아',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://menoa.barolabs.kr',
    siteName: '메노아',
    title: '메노아 | 갱년기 건강 파트너',
    description: '갱년기 증상을 스마트하게 추적하고, 건강을 다시 찾아드립니다.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '메노아' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '메노아 | 갱년기 건강 파트너',
    description: '갱년기 증상을 스마트하게 추적하고, 건강을 다시 찾아드립니다.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#800020',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png?v=2" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png?v=2" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <GoogleAnalytics />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
