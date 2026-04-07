import type { Metadata } from 'next';
import { getVisitSummary } from '@/actions/visit-summary';
import Link from 'next/link';
import { VisitClient } from './VisitClient';

export const revalidate = 0;

export const metadata: Metadata = {
  title: '진료 요약 | 메노아',
  description: '전문의에게 보여줄 내 증상 요약 보고서를 확인하세요.',
};

export default async function VisitPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const rawDays = parseInt(params.days ?? '30', 10);
  const days = [14, 30, 60, 90].includes(rawDays) ? rawDays : 30;

  const data = await getVisitSummary(days);

  const isEmpty = data.symptoms.length === 0 && !data.triggers && !data.mood;

  return (
    <div className="px-4 py-6 space-y-4 max-w-lg mx-auto pb-24">
      {/* 뒤로가기 */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        대시보드
      </Link>

      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">🩺 진료 요약</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          전문의에게 보여주거나 읽어줄 수 있는 내 증상 요약이에요.
        </p>
      </div>

      {isEmpty ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm text-center space-y-3">
          <p className="text-3xl">📋</p>
          <p className="text-gray-600 dark:text-gray-300 font-medium">아직 데이터가 없어요</p>
          <p className="text-sm text-gray-400">
            증상·기분·트리거를 기록하면 자동으로 요약이 생성돼요.
          </p>
          <Link
            href="/symptoms/log"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--c-brand)' }}
          >
            첫 증상 기록하기
          </Link>
        </div>
      ) : (
        <VisitClient data={data} activeDays={days} />
      )}
    </div>
  );
}
