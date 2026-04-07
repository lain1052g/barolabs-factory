import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { InstallBanner } from '@/components/InstallBanner';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select({ menopause_stage: menoa_users.menopause_stage })
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);

  // 온보딩 미완료 시 배너만 표시 (강제 리다이렉트 없음 — 건너뛰기 허용)
  const needsOnboarding = !dbUser?.menopause_stage;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {needsOnboarding && (
        <div
          className="max-w-lg mx-auto px-4 pt-3"
        >
          <a
            href="/onboarding"
            className="brand-bg flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm border border-[#f9d0d7] dark:border-[#5a2a30]"
            style={{ backgroundColor: 'var(--c-brand-subtle)' }}
          >
            <span style={{ color: 'var(--c-brand)' }}>
              💡 갱년기 단계를 설정하면 맞춤 분석을 받을 수 있어요
            </span>
            <span className="text-xs font-semibold shrink-0 ml-2" style={{ color: 'var(--c-brand)' }}>설정하기 →</span>
          </a>
        </div>
      )}
      <main className="max-w-lg mx-auto pb-20">
        {children}
      </main>
      <BottomNav />
      <InstallBanner />
    </div>
  );
}
