'use client';

import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';

/**
 * GA4 스크립트 로더 컴포넌트.
 * NEXT_PUBLIC_GA_MEASUREMENT_ID 환경변수가 없으면 아무것도 렌더링하지 않음.
 * layout.tsx의 <body> 안에 배치.
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
