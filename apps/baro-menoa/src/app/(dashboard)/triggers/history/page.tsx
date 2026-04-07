import type { Metadata } from 'next';
import Link from 'next/link';
import { getTriggerHistory } from '@/actions/triggers';

export const metadata: Metadata = {
  title: '트리거 기록 히스토리 | 메노아',
  description: '최근 30일간의 트리거 기록을 확인하세요.',
};

export const revalidate = 30;

function formatSleep(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export default async function TriggerHistoryPage() {
  const history = await getTriggerHistory(30);

  return (
    <div className="px-4 py-6 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href="/triggers" className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">트리거 기록 히스토리</h1>
          <p className="text-xs text-gray-400 mt-0.5">최근 30일 · {history.length}건</p>
        </div>
      </div>

      {/* 빈 상태 */}
      {history.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-600 font-medium mb-1">아직 트리거 기록이 없어요</p>
          <p className="text-sm text-gray-400 mb-4">오늘의 트리거를 먼저 기록해보세요!</p>
          <Link
            href="/triggers"
            className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--c-brand)' }}
          >
            트리거 기록하기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((row) => {
            const d = new Date(row.log_date + 'T00:00:00');
            const isToday = row.log_date === new Date().toISOString().split('T')[0];

            // 활성 배지 목록 생성
            const badges: { emoji: string; label: string; bg: string; text: string }[] = [];
            if (row.caffeine_cups > 0) {
              badges.push({ emoji: '☕', label: `카페인 ${row.caffeine_cups}잔`, bg: '#fffbeb', text: '#92400e' });
            }
            if (row.alcohol_units > 0) {
              badges.push({ emoji: '🍷', label: `음주 ${row.alcohol_units}단위`, bg: '#f5f3ff', text: '#6d28d9' });
            }
            if (row.stress_level !== null && row.stress_level > 0) {
              badges.push({ emoji: '😤', label: `스트레스 ${row.stress_level}단계`, bg: '#fef2f2', text: '#991b1b' });
            }
            if (row.sleep_minutes > 0 && row.sleep_minutes < 360) {
              badges.push({ emoji: '😴', label: `수면 ${formatSleep(row.sleep_minutes)}`, bg: '#eff6ff', text: '#1d4ed8' });
            }
            if (row.exercise_minutes > 0) {
              badges.push({ emoji: '🏃', label: `운동 ${row.exercise_minutes}분`, bg: '#f0fdf4', text: '#166534' });
            }
            if (row.note?.includes('#날씨')) {
              badges.push({ emoji: '🌡️', label: '날씨', bg: '#f0f9ff', text: '#0369a1' });
            }

            return (
              <div key={row.log_date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* 날짜 헤더 */}
                <div
                  className="px-4 py-2.5 flex items-center justify-between"
                  style={{ backgroundColor: isToday ? '#fdf6f7' : '#fafafa' }}
                >
                  <span
                    className="text-sm font-semibold"
                    style={{ color: isToday ? 'var(--c-brand)' : '#374151' }}
                  >
                    {isToday ? '오늘 · ' : ''}
                    {d.toLocaleDateString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                  </span>
                  <span className="text-xs text-gray-400">
                    {badges.length > 0 ? `${badges.length}개 트리거` : '특이사항 없음'}
                  </span>
                </div>

                {/* 배지 목록 */}
                <div className="px-4 py-3">
                  {badges.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {badges.map((b, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: b.bg, color: b.text }}
                        >
                          {b.emoji} {b.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">오늘은 트리거가 없었어요 ✨</p>
                  )}
                  {row.note && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                      {row.note.replace(/#날씨/g, '').replace(/#기타/g, '').trim()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
