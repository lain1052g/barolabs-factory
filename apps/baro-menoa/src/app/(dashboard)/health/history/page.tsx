import type { Metadata } from 'next';
import Link from 'next/link';
import { getHealthProfile } from '@/actions/health-profile';
import { MEDICAL_HISTORY } from '@/lib/health-profile-items';
import { HealthChecklist } from '@/components/health/HealthChecklist';

export const metadata: Metadata = {
  title: '병력 기록 | 건강 프로필 | 메노아',
};

export const revalidate = 0;

export default async function HistoryPage() {
  const profile = await getHealthProfile();
  const saved = profile?.medical_history ?? [];

  return (
    <div className="px-4 py-6 space-y-5 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/health" className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">📋 병력 기록</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">과거 수술 · 질환 이력</p>
        </div>
      </div>

      <div className="rounded-xl px-4 py-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed" style={{ backgroundColor: 'var(--c-brand-subtle)' }}>
        특히 <strong>수술로 인한 폐경</strong>이나 <strong>유방암 과거력</strong>은
        추천 내용이 크게 달라질 수 있어요. <strong>해당 없으면 빈 채로 저장하세요.</strong>
      </div>

      <HealthChecklist
        section="medical_history"
        items={MEDICAL_HISTORY}
        savedItems={saved}
      />
    </div>
  );
}
