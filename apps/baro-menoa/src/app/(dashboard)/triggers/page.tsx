import type { Metadata } from 'next';
import Link from 'next/link';
import { getTriggerLogByDate } from '@/actions/triggers';
import { TriggerLogForm } from '@/components/TriggerLogForm';

export const metadata: Metadata = {
  title: '트리거 기록 | 메노아',
  description: '생활 요인을 기록하고 나만의 패턴을 파악하세요.',
};

export const revalidate = 0;

export default async function TriggersPage() {
  const today = new Date().toISOString().split('T')[0];
  const existing = await getTriggerLogByDate(today);

  return (
    <div className="px-4 py-6 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">트리거 기록</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
            {existing && ' · 오늘 기록 있음'}
          </p>
        </div>
        <Link
          href="/triggers/history"
          className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border"
          style={{ color: 'var(--c-brand)', borderColor: 'var(--c-brand-light)', backgroundColor: 'var(--c-brand-subtle)' }}
        >
          기록 보기
        </Link>
      </div>

      {/* 안내 배너 */}
      <div
        className="brand-bg flex items-start gap-3 p-4 rounded-2xl border border-[#f9d0d7] dark:border-[#5a2a30]"
        style={{ backgroundColor: 'var(--c-brand-subtle)' }}
      >
        <span className="text-2xl leading-none">🎯</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--c-brand)' }}>
            생활 요인 기록
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
            오늘 겪은 트리거를 선택하면 증상과의 연관성을 파악할 수 있어요.
            날짜별로 1회 기록되며 수정 가능합니다.
          </p>
        </div>
      </div>

      {/* 기존 기록 요약 */}
      {existing && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none border border-gray-50 dark:border-gray-700 space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">오늘의 기록</p>
          <div className="flex flex-wrap gap-2">
            {existing.caffeine_cups > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                ☕ 카페인 {existing.caffeine_cups}잔
              </span>
            )}
            {existing.alcohol_units > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                🍷 음주 {existing.alcohol_units}단위
              </span>
            )}
            {existing.stress_level !== null && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                😤 스트레스 {existing.stress_level}단계
              </span>
            )}
            {existing.sleep_minutes > 0 && existing.sleep_minutes < 360 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                😴 수면 부족
              </span>
            )}
            {existing.exercise_minutes > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                🏃 운동 {existing.exercise_minutes}분
              </span>
            )}
            {existing.note?.includes('#날씨') && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                🌡️ 날씨
              </span>
            )}
            {existing.note?.includes('#기타') && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                📝 기타
              </span>
            )}
          </div>
          {existing.note && (
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
              {existing.note.replace(/#날씨/g, '').replace(/#기타/g, '').trim()}
            </p>
          )}
        </div>
      )}

      {/* 폼 */}
      <TriggerLogForm existing={existing} date={today} />
    </div>
  );
}
