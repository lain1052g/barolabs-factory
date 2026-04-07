'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { WeeklyReportResult } from '@/actions/weekly-report';

interface Props {
  report: WeeklyReportResult;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function SeverityDot({ value }: { value: number }) {
  if (value === 0) return <span className="text-gray-300 text-xs">—</span>;
  const color =
    value <= 2
      ? '#22c55e'
      : value <= 3
        ? '#f59e0b'
        : '#ef4444';
  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-semibold"
      style={{ color }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {value.toFixed(1)}
    </span>
  );
}

function MoodEmoji({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-300 text-xs">—</span>;
  const emojis = ['', '😢', '😐', '🙂', '😊', '😄'];
  return <span className="text-base">{emojis[score] ?? '—'}</span>;
}

export function WeekTabBar({ weekOffset }: { weekOffset: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function go(offset: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('w', String(offset));
    router.push(`/report?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 no-print">
      {[0, 1].map((offset) => (
        <button
          key={offset}
          onClick={() => go(offset)}
          className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          style={
            weekOffset === offset
              ? { backgroundColor: 'var(--c-brand)', color: 'white' }
              : { backgroundColor: '#f3f4f6', color: '#6b7280' }
          }
        >
          {offset === 0 ? '이번 주' : '지난 주'}
        </button>
      ))}
    </div>
  );
}

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
      style={{ borderColor: 'var(--c-brand)', color: 'var(--c-brand)' }}
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M5 7V3h10v4M5 15H3a1 1 0 01-1-1V9a1 1 0 011-1h14a1 1 0 011 1v5a1 1 0 01-1 1h-2m-9 0v3h8v-3H6z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      PDF 인쇄
    </button>
  );
}

export function WeeklyReportContent({ report }: Props) {
  const isEmpty = report.logDays === 0;

  return (
    <div className="space-y-4">
      {/* 기간 */}
      <div className="text-sm text-gray-500 dark:text-gray-400 print-show">
        {formatDate(report.weekStart)} ~ {formatDate(report.weekEnd)}
      </div>

      {isEmpty ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 shadow-sm dark:shadow-none text-center print-page">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-700 dark:text-gray-200 font-semibold mb-1">
            이 주간에는 기록된 데이터가 없어요
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            증상을 기록하면 주간 리포트가 자동 생성됩니다.
          </p>
        </div>
      ) : (
        <>
          {/* 요약 카드 3개 */}
          <div className="grid grid-cols-3 gap-3 print-page">
            <div
              className="rounded-2xl p-4 text-white"
              style={{ backgroundColor: 'var(--c-brand)' }}
            >
              <p className="text-xs opacity-80">기록일수</p>
              <p className="text-2xl font-bold mt-0.5">
                {report.logDays}
                <span className="text-sm font-normal ml-0.5">일</span>
              </p>
              <p className="text-xs opacity-60 mt-0.5">/ 7일</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none">
              <p className="text-xs text-gray-500 dark:text-gray-400">평균 중증도</p>
              <p
                className="text-2xl font-bold mt-0.5"
                style={{ color: 'var(--c-brand)' }}
              >
                {report.avgSeverity > 0 ? report.avgSeverity.toFixed(1) : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">1~5 척도</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none">
              <p className="text-xs text-gray-500 dark:text-gray-400">주요 증상</p>
              <p
                className="text-sm font-bold mt-0.5 leading-tight"
                style={{ color: 'var(--c-brand)' }}
              >
                {report.topSymptoms[0]?.name ?? '—'}
              </p>
              {report.topSymptoms[1] && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {report.topSymptoms[1].name}
                </p>
              )}
            </div>
          </div>

          {/* Top 5 증상 */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none print-page">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              이번 주 상위 증상
            </h2>
            <div className="space-y-2">
              {report.topSymptoms.map((sym, idx) => (
                <div key={sym.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4 text-right">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        {sym.name}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>{sym.count}회</span>
                        <SeverityDot value={sym.avgSeverity} />
                      </div>
                    </div>
                    <div className="mt-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (sym.count / (report.topSymptoms[0]?.count || 1)) * 100)}%`,
                          backgroundColor: 'var(--c-brand)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro: 기분 + 트리거 */}
          {report.plan === 'pro' && (
            <div className="grid grid-cols-2 gap-3 print-page">
              {/* 기분 평균 */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none">
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  평균 기분
                </h2>
                {report.moodAvg !== null ? (
                  <div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: 'var(--c-brand)' }}
                    >
                      {report.moodAvg.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">/ 5점</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">기록 없음</p>
                )}
              </div>

              {/* 트리거 요약 */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none">
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  트리거 평균
                </h2>
                {report.triggerSummary ? (
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                    <p>카페인 {report.triggerSummary.caffeine}잔</p>
                    <p>음주 {report.triggerSummary.alcohol}단위</p>
                    <p>스트레스 {report.triggerSummary.stress > 0 ? report.triggerSummary.stress.toFixed(1) : '—'}</p>
                    <p>수면 {report.triggerSummary.sleep > 0 ? Math.round(report.triggerSummary.sleep / 60) + 'h' : '—'}</p>
                    <p>운동 {report.triggerSummary.exercise > 0 ? report.triggerSummary.exercise + '분' : '—'}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">기록 없음</p>
                )}
              </div>
            </div>
          )}

          {/* Free: Pro 유도 */}
          {report.plan === 'free' && (
            <div
              className="rounded-2xl p-4 flex items-start gap-3 no-print"
              style={{ backgroundColor: 'var(--c-brand-subtle)', border: '1px solid #f9d0d8' }}
            >
              <span className="text-lg flex-shrink-0">🔒</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--c-brand)' }}>
                  Pro 전용 — 기분 & 트리거 분석
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pro로 업그레이드하면 기분 점수와 트리거 분석을 리포트에서 확인할 수 있어요.
                </p>
              </div>
            </div>
          )}

          {/* 7일 일별 테이블 */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none print-page">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              일별 요약
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      날짜
                    </th>
                    <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      증상
                    </th>
                    <th className="text-center py-2 pr-3 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      중증도
                    </th>
                    {report.plan === 'pro' && (
                      <th className="text-center py-2 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        기분
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {report.dayByDay.map((day) => (
                    <tr
                      key={day.date}
                      className="border-b border-gray-50 dark:border-gray-800/50 last:border-0"
                    >
                      <td className="py-2.5 pr-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap font-medium">
                        {day.dateLabel}
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-gray-700 dark:text-gray-300">
                        {day.symptoms.length > 0 ? (
                          <span>{day.symptoms.slice(0, 3).join(', ')}{day.symptoms.length > 3 ? ` 외 ${day.symptoms.length - 3}개` : ''}</span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">기록 없음</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-center">
                        <SeverityDot value={day.severity} />
                      </td>
                      {report.plan === 'pro' && (
                        <td className="py-2.5 text-center">
                          <MoodEmoji score={day.mood} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 인쇄 시 출처 표기 */}
      <div className="hidden print-footer text-xs text-gray-400 text-center pt-4">
        메노아 (menoa.bareumlabs.kr) — 갱년기 증상 관리 앱
      </div>
    </div>
  );
}
