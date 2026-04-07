// 클라이언트 사이드 GA4 이벤트 트래킹 유틸
// NEXT_PUBLIC_GA_MEASUREMENT_ID 환경변수가 없으면 아무 동작도 하지 않음 (graceful 처리)

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// gtag 타입 선언
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

// 주요 이벤트 헬퍼
export const analytics = {
  // 증상 기록
  symptomLogged: (symptomCount: number) =>
    trackEvent('symptom_logged', { symptom_count: symptomCount }),

  // 기분 기록
  moodLogged: (moodScore: number) =>
    trackEvent('mood_logged', { mood_score: moodScore }),

  // 트리거 기록
  triggerLogged: (triggerType: string) =>
    trackEvent('trigger_logged', { trigger_type: triggerType }),

  // SOS 사용
  sosUsed: (symptomType: string) =>
    trackEvent('sos_used', { symptom_type: symptomType }),

  // 콘텐츠 조회
  contentViewed: (contentId: string, category: string) =>
    trackEvent('content_viewed', { content_id: contentId, category }),

  // 콘텐츠 북마크
  contentBookmarked: (contentId: string) =>
    trackEvent('content_bookmarked', { content_id: contentId }),

  // PDF 내보내기 (주간 리포트)
  pdfExported: () =>
    trackEvent('pdf_exported'),

  // 진료 요약 PDF 다운로드
  visitPdfDownloaded: (days: number) =>
    trackEvent('visit_pdf_downloaded', { period_days: days }),

  // Pro 업그레이드 클릭
  proUpgradeClicked: () =>
    trackEvent('pro_upgrade_clicked'),

  // 다크모드 전환
  darkModeToggled: (theme: string) =>
    trackEvent('dark_mode_toggled', { theme }),

  // 푸시 알림 권한 허용
  pushPermissionGranted: () =>
    trackEvent('push_permission_granted'),

  // PWA 설치
  pwaInstalled: () =>
    trackEvent('pwa_installed'),
};
