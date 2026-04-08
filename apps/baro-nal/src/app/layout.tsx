import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import './globals.css';

export const metadata: Metadata = {
  title: '날 | 나를 날마다',
  description: '글을 한 줄도 안 써도 되는 사고의 일기. 키워드를 고르는 것만으로 오늘의 나를 기록하세요.',
  keywords: ['자기탐색', '감정일기', '심리', '키워드', '날', 'NAL'],
  authors: [{ name: '바로랩스' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '날',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://nal.barolabs.kr',
    siteName: '날',
    title: '날 | 나를 날마다',
    description: '글을 한 줄도 안 써도 되는 사고의 일기.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '날' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '날 | 나를 날마다',
    description: '글을 한 줄도 안 써도 되는 사고의 일기.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#3C3489',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png?v=1" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png?v=1" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <GoogleAnalytics />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
