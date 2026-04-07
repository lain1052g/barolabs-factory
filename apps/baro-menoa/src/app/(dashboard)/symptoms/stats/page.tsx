import type { Metadata } from 'next';
import Link from 'next/link';
import { getSymptomStats } from '@/actions/stats';
import { getTriggerCorrelation } from '@/actions/correlation';
import {
  MonthlyBarChart,
  CategoryDonutChart,
  TopSymptomsChart,
  WeeklySeverityChart,
} from '@/components/symptoms/StatsCharts';
import { CorrelationChart } from '@/components/symptoms/CorrelationChart';
import { ExportButton } from '@/components/ExportButton';

export const metadata: Metadata = {
  title: '증상 통계 | 메노아',
  description: '갱년기 증상 기록의 상세 통계를 확인하세요.',
};

export const revalidate = 0;

export default async function SymptomStatsPage() {
  const [stats, correlation] = await Promise.all([
    getSymptomStats(),
    getTriggerCorrelation(),
  ]);
  const isEmpty = stats.totalLogs === 0;

  return (
    <div className="px-4 py-6 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/symptoms"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="증상 기록으로 돌아가기"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">증상 통계</h1>
        </div>
        {/* 기간 배지 + PDF 내보내기 */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: stats.plan === 'pro' ? '#fdf6f7' : '#f3f4f6',
              color: stats.plan === 'pro' ? 'var(--c-brand)' : '#6b7280',
            }}
          >
            {stats.plan === 'pro' ? `최근 ${stats.periodMonths}개월` : '최근 1개월'}
          </span>
          <ExportButton plan={stats.plan} />
        </div>
      </div>

      {/* Free 플랜 제한 안내 배너 */}
      {stats.plan === 'free' && (
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ backgroundColor: 'var(--c-brand-subtle)', border: '1px solid #f9d0d8' }}
        >
          <span className="text-lg flex-shrink-0">🔒</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--c-brand)' }}>
              Free 플랜 — 최근 1개월 데이터
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Pro로 업그레이드하면 최근 12개월 전체 통계를 확인할 수 있어요.
            </p>
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {isEmpty ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 shadow-sm dark:shadow-none text-center">
          <div className="text-5xl mb-3">📊</div>
          <p className="text-gray-700 dark:text-gray-200 font-semibold mb-1">아직 분석할 데이터가 없어요</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">
            증상을 기록하면 통계가 자동으로 생성됩니다.
          </p>
          <Link
            href="/symptoms/log"
            className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--c-brand)' }}
          >
            첫 증상 기록하기
          </Link>
        </div>
      ) : (
        <>
          {/* 요약 카드 */}
          <div
            className="rounded-2xl p-4 text-white"
            style={{ backgroundColor: 'var(--c-brand)' }}
          >
            <p className="text-sm opacity-80">기간 내 총 기록</p>
            <p className="text-3xl font-bold mt-0.5">{stats.totalLogs}<span className="text-lg font-normal ml-1">회</span></p>
          </div>

          {/* 월별 바차트 */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
              월별 기록 횟수
              {stats.plan === 'free' && (
                <span className="ml-2 text-xs text-gray-400 font-normal">(최근 1개월)</span>
              )}
            </h2>
            {stats.monthlyCounts.every((m) => m.count === 0) ? (
              <div className="text-center py-6 text-sm text-gray-400 dark:text-gray-500">
                이 기간에 기록된 데이터가 없습니다
              </div>
            ) : (
              <MonthlyBarChart data={stats.monthlyCounts} />
            )}
          </div>

          {/* 카테고리 도넛차트 */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">카테고리별 분포</h2>
            <CategoryDonutChart data={stats.categoryDistribution} />
          </div>

          {/* Top 5 증상 */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Top 5 증상</h2>
            <TopSymptomsChart data={stats.topSymptoms} />
          </div>

          {/* 주별 평균 심각도 */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">주별 평균 심각도</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">1(낮음) ~ 5(높음)</p>
            <WeeklySeverityChart data={stats.weeklySeverity} />
          </div>
        </>
      )}

      {/* 트리거 ↔ 증상 상관관계 분석 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">트리거 ↔ 증상 상관관계</h2>
          {correlation.plan === 'free' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Free</span>
          )}
          {correlation.plan === 'pro' && (
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: 'var(--c-brand)' }}
            >
              Pro
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          트리거가 있는 날과 없는 날의 평균 심각도를 비교합니다 (최근 {correlation.periodDays}일)
        </p>

        {correlation.plan === 'free' ? (
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--c-brand-subtle)' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--c-brand)' }}>🔒 Pro 전용 기능</p>
            <p className="text-xs text-gray-500">Pro로 업그레이드하면 트리거와 증상의 상관관계를 분석할 수 있어요.</p>
          </div>
        ) : (
          <CorrelationChart
            data={correlation.correlations}
            analyzedDays={correlation.analyzed_days}
          />
        )}
      </div>
    </div>
  );
}
