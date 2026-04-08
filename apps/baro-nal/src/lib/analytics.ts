export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export function trackEvent(action: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', action, params);
}

export function setUserProperty(key: string, value: string) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('set', 'user_properties', { [key]: value });
}

export const analytics = {
  keywordSelected: (keyword: string, archetype: string) =>
    trackEvent('keyword_selected', { keyword, archetype }),

  recordSaved: () => trackEvent('record_saved'),

  proUpgradeClicked: () => trackEvent('pro_upgrade_clicked'),

  darkModeToggled: (theme: string) => trackEvent('dark_mode_toggled', { theme }),

  pushPermissionGranted: () => trackEvent('push_permission_granted'),

  pwaInstalled: () => trackEvent('pwa_installed'),
};
