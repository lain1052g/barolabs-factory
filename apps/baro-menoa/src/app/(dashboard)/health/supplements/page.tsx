import type { Metadata } from 'next';
import Link from 'next/link';
import { getHealthProfile } from '@/actions/health-profile';
import { SUPPLEMENTS } from '@/lib/health-profile-items';
import { HealthChecklist } from '@/components/health/HealthChecklist';

export const metadata: Metadata = {
  title: '영양제 · 보조식품 | 건강 프로필 | 메노아',
};

export const revalidate = 0;

export default async function SupplementsPage() {
  const profile = await getHealthProfile();
  const saved = profile?.supplements ?? [];

  return (
    <div className="px-4 py-6 space-y-5 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/health" className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">🌿 영양제 · 보조식품</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">현재 복용 중인 영양제</p>
        </div>
      </div>

      <div className="rounded-xl px-4 py-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed" style={{ backgroundColor: 'var(--c-brand-subtle)' }}>
        먹고 있는 것만 체크하세요. 이걸 바탕으로
        추가로 필요한 영양소가 있을 때 안내해 드려요.
        <strong> 해당 없으면 빈 채로 저장하세요.</strong>
      </div>

      <HealthChecklist
        section="supplements"
        items={SUPPLEMENTS}
        savedItems={saved}
        showSmokingToggle
        savedIsSmoker={profile?.is_smoker ?? false}
      />
    </div>
  );
}
