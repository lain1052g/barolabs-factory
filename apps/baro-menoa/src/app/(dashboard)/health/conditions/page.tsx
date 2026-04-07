import type { Metadata } from 'next';
import Link from 'next/link';
import { getHealthProfile } from '@/actions/health-profile';
import { CONDITIONS } from '@/lib/health-profile-items';
import { HealthChecklist } from '@/components/health/HealthChecklist';

export const metadata: Metadata = {
  title: '질병 기록 | 건강 프로필 | 메노아',
};

export const revalidate = 0;

export default async function ConditionsPage() {
  const profile = await getHealthProfile();
  const saved = profile?.conditions ?? [];

  return (
    <div className="px-4 py-6 space-y-5 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/health" className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">🏥 질병 기록</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">현재 앓고 있는 지병</p>
        </div>
      </div>

      <div className="rounded-xl px-4 py-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed" style={{ backgroundColor: 'var(--c-brand-subtle)' }}>
        지병이 있으면 갱년기 증상과 겹치는 경우가 많아요.
        입력해두면 분석 결과가 더 정확해집니다. <strong>해당 없으면 빈 채로 저장하세요.</strong>
      </div>

      <HealthChecklist
        section="conditions"
        items={CONDITIONS}
        savedItems={saved}
      />
    </div>
  );
}
