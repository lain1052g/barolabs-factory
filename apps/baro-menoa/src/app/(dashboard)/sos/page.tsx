import type { Metadata } from 'next';
import { SosClient } from './SosClient';
import { getSosHistory } from '@/actions/sos';

export const metadata: Metadata = {
  title: 'SOS 응급 가이드 | 메노아',
  description: '갱년기 증상이 심할 때 즉각적인 대처법을 확인하세요.',
};

export const revalidate = 0;

const SYMPTOM_LABEL: Record<string, string> = {
  general: '일반',
  breathing: '호흡법',
  cooling: '냉각법',
  grounding: '그라운딩',
  stretch: '스트레칭',
};

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '-';
  if (seconds < 60) return `${seconds}초`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}분 ${s}초` : `${m}분`;
}

export default async function SosPage() {
  const history = await getSosHistory();
  const recent = history.slice(0, 5);

  return (
    <div className="space-y-0">
      <SosClient />

      {/* 최근 SOS 이용 내역 */}
      <div className="px-4 pb-6 space-y-3">
        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">최근 SOS 이용 내역</h2>

          {recent.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <p className="text-sm text-gray-400">아직 SOS를 사용한 적이 없어요</p>
              <p className="text-xs text-gray-300 mt-1">위급한 상황이 생기면 언제든지 사용하세요</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((log, i) => {
                const dt = new Date(log.triggered_at);
                const dateStr = dt.toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  weekday: 'short',
                });
                const timeStr = dt.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: 'var(--c-brand-subtle)' }}
                    >
                      🆘
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {SYMPTOM_LABEL[log.symptom_type ?? ''] ?? log.symptom_type ?? '일반'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {dateStr} {timeStr}
                      </p>
                    </div>
                    {log.duration_seconds !== null && log.duration_seconds > 0 && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDuration(log.duration_seconds)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
