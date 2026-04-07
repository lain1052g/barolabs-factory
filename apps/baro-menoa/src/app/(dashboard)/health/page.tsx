import type { Metadata } from 'next';
import Link from 'next/link';
import { getHealthProfile } from '@/actions/health-profile';
import { CONDITIONS, MEDICAL_HISTORY, MEDICATIONS, SUPPLEMENTS } from '@/lib/health-profile-items';

export const metadata: Metadata = {
  title: '건강 프로필 | 메노아',
  description: '나의 건강 정보를 입력하면 더 정확한 분석을 받을 수 있어요.',
};

export const revalidate = 0;

const SECTIONS = [
  {
    href: '/health/conditions',
    emoji: '🏥',
    title: '질병 기록',
    subtitle: '현재 앓고 있는 지병',
    total: CONDITIONS.length,
    key: 'conditions' as const,
  },
  {
    href: '/health/history',
    emoji: '📋',
    title: '병력 기록',
    subtitle: '과거 수술·질환 이력',
    total: MEDICAL_HISTORY.length,
    key: 'medical_history' as const,
  },
  {
    href: '/health/medications',
    emoji: '💊',
    title: '복용 약물',
    subtitle: '현재 복용 중인 처방약',
    total: MEDICATIONS.length,
    key: 'medications' as const,
  },
  {
    href: '/health/supplements',
    emoji: '🌿',
    title: '영양제 · 보조식품',
    subtitle: '현재 복용 중인 영양제',
    total: SUPPLEMENTS.length,
    key: 'supplements' as const,
  },
];

export default async function HealthPage() {
  const profile = await getHealthProfile();

  const counts = {
    conditions: profile?.conditions?.length ?? 0,
    medical_history: profile?.medical_history?.length ?? 0,
    medications: profile?.medications?.length ?? 0,
    supplements: profile?.supplements?.length ?? 0,
  };

  const filled = SECTIONS.filter(s => counts[s.key] > 0).length;
  const completionPct = Math.round((filled / SECTIONS.length) * 100);

  return (
    <div className="px-4 py-6 space-y-5 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">건강 프로필</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            입력할수록 분석이 더 정확해져요
          </p>
        </div>
      </div>

      {/* 완성도 바 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">프로필 완성도</p>
          <p className="text-sm font-bold" style={{ color: 'var(--c-brand)' }}>{completionPct}%</p>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%`, backgroundColor: 'var(--c-brand)' }}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {completionPct === 0
            ? '아무것도 입력 안 해도 앱은 정상 작동해요. 원하는 것만 선택적으로 입력하세요.'
            : completionPct === 100
            ? '모든 섹션을 입력하셨어요!'
            : `${SECTIONS.length - filled}개 섹션을 더 입력하면 분석이 더 정확해져요.`}
        </p>
      </div>

      {/* 섹션 카드 목록 */}
      <div className="space-y-2">
        {SECTIONS.map(section => {
          const count = counts[section.key];
          const hasData = count > 0;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl px-4 py-4 shadow-sm dark:shadow-none hover:shadow-md transition-shadow active:scale-95"
            >
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: 'var(--c-brand-subtle)' }}
              >
                {section.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {section.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {section.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {hasData ? (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--c-brand-subtle)', color: 'var(--c-brand)' }}
                  >
                    {count}개 선택
                  </span>
                ) : (
                  <span className="text-xs text-gray-300 dark:text-gray-600">미입력</span>
                )}
                <span className="text-gray-300 dark:text-gray-600">→</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 안내 */}
      <div className="rounded-2xl p-4 text-sm" style={{ backgroundColor: 'var(--c-brand-subtle)' }}>
        <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">🔒 개인정보 안내</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          입력하신 건강 정보는 증상 분석에만 사용되며, 외부에 공유되지 않아요.
          언제든지 수정하거나 삭제할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
