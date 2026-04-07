import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getWeeklyReport } from '@/actions/weekly-report';
import {
  WeekTabBar,
  PrintButton,
  WeeklyReportContent,
} from './WeeklyReportClient';

export const metadata: Metadata = {
  title: '주간 리포트 | 메노아',
  description: '이번 주 갱년기 증상 기록을 한눈에 확인하고 PDF로 저장하세요.',
};

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ w?: string }>;
}

export default async function WeeklyReportPage({ searchParams }: Props) {
  const params = await searchParams;
  const weekOffset = Math.min(1, Math.max(0, Number(params.w ?? 0) || 0));

  const report = await getWeeklyReport(weekOffset);

  return (
    <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="설정으로 돌아가기"
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
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            주간 리포트
          </h1>
        </div>
        <PrintButton />
      </div>

      {/* 인쇄 시에만 보이는 헤더 */}
      <div className="hidden print-title">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--c-brand)' }}>
          메노아 주간 증상 리포트
        </h1>
      </div>

      {/* 주차 탭 */}
      <Suspense
        fallback={
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
            <div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
          </div>
        }
      >
        <WeekTabBar weekOffset={weekOffset} />
      </Suspense>

      {/* 리포트 본문 */}
      <WeeklyReportContent report={report} />
    </div>
  );
}
