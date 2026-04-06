import type { Metadata } from 'next';
import Link from 'next/link';
import { getMoodLogByDate } from '@/actions/mood';
import { MoodLogForm } from '@/components/MoodLogForm';

export const metadata: Metadata = {
  title: '기분 기록 | 메노아',
  description: '오늘의 기분을 기록하고 감정 변화 패턴을 파악하세요.',
};

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
        <div>
          <h1 className="text-xl font-bold text-gray-800">기분 기록</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
            {existing && ' · 오늘 기록 있음'}
          </p>
        </div>
      </div>

      {/* 오늘 기록 요약 */}
      {existing && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-3">
          <span className="text-3xl leading-none">
            {MOOD_EMOJI[existing.mood_score] ?? existing.mood_emoji}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              오늘의 기분: {MOOD_LABEL[existing.mood_score] ?? '-'}
            </p>
            {existing.note && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{existing.note}</p>
            )}
          </div>
          <span
            className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#fdf6f7', color: '#800020' }}
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
