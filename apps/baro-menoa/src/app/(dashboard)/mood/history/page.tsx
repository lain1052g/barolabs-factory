import type { Metadata } from 'next';
import Link from 'next/link';
import { getMoodHistory } from '@/actions/mood';

export const metadata: Metadata = {
  title: '기분 기록 히스토리 | 메노아',
  description: '최근 30일간의 기분 기록을 확인하세요.',
};

export const revalidate = 30;

const MOOD_LABEL: Record<number, string> = {
  1: '매우 나쁨',
  2: '나쁨',
  3: '보통',
  4: '좋음',
  5: '매우 좋음',
};

const SCORE_BAR_COLOR: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#f59e0b',
  4: '#22c55e',
  5: '#16a34a',
};

export default async function MoodHistoryPage() {
  const history = await getMoodHistory(30);

  return (
    <div className="px-4 py-6 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href="/mood" className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">기분 기록 히스토리</h1>
          <p className="text-xs text-gray-400 mt-0.5">최근 30일 · {history.length}건</p>
        </div>
      </div>

      {/* 점수 추이 시각화 */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 mb-3">점수 추이 (최신순)</p>
          <div className="flex items-end gap-1 h-16">
            {[...history].reverse().map((row, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm min-w-0 transition-all"
                style={{
                  height: `${(row.mood_score / 5) * 100}%`,
                  backgroundColor: SCORE_BAR_COLOR[row.mood_score] ?? '#e5e7eb',
                  minHeight: 6,
                }}
                title={`${row.log_date} · ${row.mood_score}점`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-300">30일 전</span>
            <span className="text-xs text-gray-300">오늘</span>
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {history.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-3">😶</div>
          <p className="text-gray-600 font-medium mb-1">아직 기분 기록이 없어요</p>
          <p className="text-sm text-gray-400 mb-4">오늘의 기분을 먼저 기록해보세요!</p>
          <Link
            href="/mood"
            className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--c-brand)' }}
          >
            기분 기록하기
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((row) => {
            const d = new Date(row.log_date + 'T00:00:00');
            const isToday = row.log_date === new Date().toISOString().split('T')[0];
            return (
              <div
                key={row.log_date}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
              >
                {/* 이모지 */}
                <span className="text-2xl leading-none flex-shrink-0">{row.mood_emoji}</span>

                {/* 날짜 + 메모 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {isToday ? '오늘 · ' : ''}
                    {d.toLocaleDateString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                  </p>
                  {row.note && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{row.note}</p>
                  )}
                </div>

                {/* 점수 배지 + 레이블 */}
                <div className="flex-shrink-0 text-right">
                  <span
                    className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: SCORE_BAR_COLOR[row.mood_score] ?? '#9ca3af' }}
                  >
                    {row.mood_score}점
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {MOOD_LABEL[row.mood_score] ?? '-'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
