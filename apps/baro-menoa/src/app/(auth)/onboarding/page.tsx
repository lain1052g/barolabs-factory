import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Image from 'next/image';
import Link from 'next/link';
import { OnboardingForm } from './OnboardingForm';

export const metadata: Metadata = {
  title: '시작하기 | 메노아',
  description: '갱년기 단계를 설정하고 맞춤 건강 관리를 시작하세요.',
  robots: { index: false, follow: false },
};

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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: 'var(--c-brand-subtle)' }}>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Image
            src="/br-s15-menoa.svg"
            alt="메노아"
            width={72}
            height={72}
            className="mx-auto"
            priority
          />
          <h1 className="text-xl font-bold text-gray-800 mt-4">메노아에 오신 것을 환영합니다</h1>
          <p className="text-sm text-gray-500">건강 관리를 시작하기 위해 현재 단계를 알려주세요</p>
        </div>
        <OnboardingForm />
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-full py-3 rounded-2xl border border-gray-200 text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
          >
            나중에 설정할게요
          </Link>
        </div>
      </div>
    </div>
  );
}
