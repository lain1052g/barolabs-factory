'use client';

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

// 주요 이벤트 헬퍼
export const analytics = {
  symptomLogged: (symptomName: string) =>
    trackEvent('symptom_logged', { symptom: symptomName }),
  sosUsed: (technique: string) =>
    trackEvent('sos_used', { technique }),
  planUpgradeClicked: () =>
    trackEvent('plan_upgrade_clicked'),
  pushPermissionGranted: () =>
    trackEvent('push_permission_granted'),
  pwaInstalled: () =>
    trackEvent('pwa_installed'),
};

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}
