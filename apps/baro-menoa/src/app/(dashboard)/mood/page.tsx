import type { Metadata } from 'next';
import Link from 'next/link';
import { getMoodLogByDate } from '@/actions/mood';
import { MoodLogForm } from '@/components/MoodLogForm';

export const metadata: Metadata = {
  title: '기분 기록 | 메노아',
  description: '오늘의 기분을 기록하고 감정 변화 패턴을 파악하세요.',
};

export const revalidate = 0;

const MOOD_LABEL: Record<number, string> = {
  1: '매우 나쁨',
  2: '나쁨',
  3: '보통',
  4: '좋음',
  5: '매우 좋음',
};

const MOOD_EMOJI: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '😊',
  5: '😄',
};

export default async function MoodPage() {
  const today = new Date().toISOString().split('T')[0];
  const existing = await getMoodLogByDate(today);

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
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">기분 기록</h1>
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
          href="/mood/history"
          className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border"
          style={{ color: 'var(--c-brand)', borderColor: 'var(--c-brand-light)', backgroundColor: 'var(--c-brand-subtle)' }}
        >
          기록 보기
        </Link>
      </div>

      {/* 오늘 기록 요약 */}
      {existing && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none border border-gray-50 dark:border-gray-700 flex items-center gap-3">
          <span className="text-3xl leading-none">
            {MOOD_EMOJI[existing.mood_score] ?? existing.mood_emoji}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              오늘의 기분: {MOOD_LABEL[existing.mood_score] ?? '-'}
            </p>
            {existing.note && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{existing.note}</p>
            )}
          </div>
          <span
            className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--c-brand-subtle)', color: 'var(--c-brand)' }}
          >
            {existing.mood_score}점
          </span>
        </div>
      )}

      {/* 폼 */}
      <MoodLogForm existing={existing} date={today} />
    </div>
  );
}
