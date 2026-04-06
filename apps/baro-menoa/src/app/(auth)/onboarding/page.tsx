import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { OnboardingForm } from './OnboardingForm';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select({ menopause_stage: menoa_users.menopause_stage })
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);

  if (dbUser?.menopause_stage) redirect('/dashboard');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: '#fdf6f7' }}>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl"
            style={{ backgroundColor: '#800020' }}
          >
            메
          </div>
          <h1 className="text-xl font-bold text-gray-800 mt-4">메노아에 오신 것을 환영합니다</h1>
          <p className="text-sm text-gray-500">건강 관리를 시작하기 위해 현재 단계를 알려주세요</p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
