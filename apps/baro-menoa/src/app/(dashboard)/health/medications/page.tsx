import type { Metadata } from 'next';
import Link from 'next/link';
import { getHealthProfile } from '@/actions/health-profile';
import { MEDICATIONS } from '@/lib/health-profile-items';
import { HealthChecklist } from '@/components/health/HealthChecklist';

export const metadata: Metadata = {
  title: '복용 약물 | 건강 프로필 | 메노아',
};

export const revalidate = 0;

export default async function MedicationsPage() {
  const profile = await getHealthProfile();
  const saved = profile?.medications ?? [];

  return (
    <div className="px-4 py-6 space-y-5 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/health" className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">💊 복용 약물</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">현재 복용 중인 처방약</p>
        </div>
      </div>

      <div className="rounded-xl px-4 py-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed" style={{ backgroundColor: 'var(--c-brand-subtle)' }}>
        일부 약물은 갱년기 증상에 영향을 줘요.
        복용 중인 것만 체크하면 분석 결과가 더 정확해집니다.
        <strong> 해당 없으면 빈 채로 저장하세요.</strong>
      </div>

      <HealthChecklist
        section="medications"
        items={MEDICATIONS}
        savedItems={saved}
      />
    </div>
  );
}
