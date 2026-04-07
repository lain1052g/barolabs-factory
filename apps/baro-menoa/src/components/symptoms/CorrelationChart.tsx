'use client';

import type { TriggerCorrelation } from '@/actions/correlation';

const SEVERITY_COLOR = ['', '#22c55e', '#84cc16', '#f59e0b', '#ef4444', '#dc2626'];

function severityColor(v: number): string {
  const idx = Math.min(5, Math.max(1, Math.round(v)));
  return SEVERITY_COLOR[idx] ?? '#e5e7eb';
}

interface CorrelationChartProps {
  data: TriggerCorrelation[];
  analyzedDays: number;
}

export function CorrelationChart({ data, analyzedDays }: CorrelationChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-400">
        <p className="text-2xl mb-2">📊</p>
        <p>트리거와 증상을 모두 기록한 날이 없어요.</p>
        <p className="text-xs mt-1 text-gray-300">트리거와 증상을 함께 기록하면 기록 비교를 볼 수 있어요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">분석 일수: {analyzedDays}일</p>
      {data.map((item) => {
        const deltaPositive = item.severity_delta > 0;
        const deltaLabel =
          item.severity_delta > 0.2
            ? '점수 높음'
            : item.severity_delta < -0.2
            ? '점수 낮음'
            : '차이 적음';
        const deltaColor =
          item.severity_delta > 0.2
            ? '#ef4444'
            : item.severity_delta < -0.2
            ? '#22c55e'
            : '#9ca3af';

        // bar width: map 0~5 to 0~100%
        const barWith = Math.min(100, (item.avg_severity_with / 5) * 100);
        const barWithout = item.days_without > 0 ? Math.min(100, (item.avg_severity_without / 5) * 100) : 0;

        return (
          <div key={item.trigger} className="bg-gray-50 rounded-xl p-4 space-y-3">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.trigger_emoji}</span>
                <span className="font-semibold text-sm text-gray-800">{item.trigger_label}</span>
                <span className="text-xs text-gray-400">{item.days_with}일</span>
              </div>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  color: deltaColor,
                  backgroundColor: deltaColor + '18',
                }}
              >
                {deltaPositive ? '+' : ''}{item.severity_delta} {deltaLabel}
              </span>
            </div>

            {/* 비교 바 */}
            <div className="space-y-2">
              {/* 트리거 있는 날 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16 shrink-0">있는 날</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${barWith}%`,
                      backgroundColor: severityColor(item.avg_severity_with),
                    }}
                  />
                </div>
                <span className="text-xs font-semibold w-6 text-right" style={{ color: severityColor(item.avg_severity_with) }}>
                  {item.avg_severity_with}
                </span>
              </div>

              {/* 트리거 없는 날 */}
              {item.days_without > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-16 shrink-0">없는 날</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${barWithout}%`,
                        backgroundColor: severityColor(item.avg_severity_without),
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">
                    {item.avg_severity_without}
                  </span>
                </div>
              )}
            </div>

            {/* 많이 나타난 증상 */}
            {item.top_symptom && (
              <p className="text-xs text-gray-400">
                이 날 많이 나타나는 증상: <span className="text-gray-600 font-medium">{item.top_symptom}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
