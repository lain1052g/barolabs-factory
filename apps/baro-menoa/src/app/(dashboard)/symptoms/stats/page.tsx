import type { Metadata } from 'next';
import Link from 'next/link';
import { getSymptomStats } from '@/actions/stats';
import {
  MonthlyBarChart,
  CategoryDonutChart,
  TopSymptomsChart,
  WeeklySeverityChart,
} from '@/components/symptoms/StatsCharts';

export const metadata: Metadata = {
  title: '증상 통계 | 메노아',
  description: '갱년기 증상 기록의 상세 통계를 확인하세요.',
};

export const revalidate = 0;

export default async function SymptomStatsPage() {
  const stats = await getSymptomStats();
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
          <h1 className="text-xl font-bold text-gray-800">증상 통계</h1>
        </div>
        {/* 기간 배지 */}
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: stats.plan === 'pro' ? '#fdf6f7' : '#f3f4f6',
            color: stats.plan === 'pro' ? '#800020' : '#6b7280',
          }}
        >
          {stats.plan === 'pro' ? `최근 ${stats.periodMonths}개월` : '최근 1개월'}
        </span>
      </div>

      {/* Free 플랜 제한 안내 배너 */}
      {stats.plan === 'free' && (
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ backgroundColor: '#fdf6f7', border: '1px solid #f9d0d8' }}
        >
          <span className="text-lg flex-shrink-0">🔒</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#800020' }}>
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
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
          <div className="text-5xl mb-3">📊</div>
          <p className="text-gray-700 font-semibold mb-1">아직 분석할 데이터가 없어요</p>
          <p className="text-sm text-gray-400 mb-5">
            증상을 기록하면 통계가 자동으로 생성됩니다.
          </p>
          <Link
            href="/symptoms/log"
            className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: '#800020' }}
          >
            첫 증상 기록하기
          </Link>
        </div>
      ) : (
        <>
          {/* 요약 카드 */}
          <div
            className="rounded-2xl p-4 text-white"
            style={{ backgroundColor: '#800020' }}
          >
            <p className="text-sm opacity-80">기간 내 총 기록</p>
            <p className="text-3xl font-bold mt-0.5">{stats.totalLogs}<span className="text-lg font-normal ml-1">회</span></p>
          </div>

          {/* 월별 바차트 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              월별 기록 횟수
              {stats.plan === 'free' && (
                <span className="ml-2 text-xs text-gray-400 font-normal">(최근 1개월)</span>
              )}
            </h2>
            {stats.monthlyCounts.every((m) => m.count === 0) ? (
              <div className="text-center py-6 text-sm text-gray-400">
                이 기간에 기록된 데이터가 없습니다
              </div>
            ) : (
              <MonthlyBarChart data={stats.monthlyCounts} />
            )}
          </div>

          {/* 카테고리 도넛차트 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">카테고리별 분포</h2>
            <CategoryDonutChart data={stats.categoryDistribution} />
          </div>

          {/* Top 5 증상 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Top 5 증상</h2>
            <TopSymptomsChart data={stats.topSymptoms} />
          </div>

          {/* 주별 평균 심각도 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">주별 평균 심각도</h2>
            <p className="text-xs text-gray-400 mb-4">1(낮음) ~ 5(높음)</p>
            <WeeklySeverityChart data={stats.weeklySeverity} />
          </div>
        </>
      )}
    </div>
  );
}
