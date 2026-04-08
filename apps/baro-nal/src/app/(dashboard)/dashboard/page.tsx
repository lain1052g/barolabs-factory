import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { br045_nal_users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select()
    .from(br045_nal_users)
    .where(eq(br045_nal_users.supabase_id, user.id))
    .limit(1);

  return (
    <div className="space-y-6">
      <div className="pt-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          안녕하세요, {dbUser?.name ?? user.email?.split('@')[0]}님
        </h2>
        <p className="text-sm text-gray-500 mt-1">오늘의 나를 기록해보세요</p>
      </div>
      {/* 앱 콘텐츠 영역 — br-120 DB 설계 후 채워짐 */}
      <div className="rounded-2xl border border-[var(--c-brand-border)] bg-[var(--c-brand-subtle)] p-6 text-center">
        <p className="text-sm text-[var(--c-brand)]">키워드 선택 기능이 곧 추가됩니다</p>
      </div>
    </div>
  );
}
