import type { Metadata } from 'next';
import { getSymptomCategories, getAllSymptoms, getSymptomLogsByDate } from '@/actions/symptoms';
import { getPostLogTip } from '@/lib/daily-tips';
import { getStreakData } from '@/actions/streak';

export const metadata: Metadata = {
  title: '증상 기록하기 | 메노아',
  description: '오늘의 갱년기 증상을 선택하고 심각도를 기록하세요.',
};
import { SymptomLogForm } from '@/components/symptoms/SymptomLogForm';
import { DateSelector } from './DateSelector';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function SymptomLogPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: rawDate } = await searchParams;
  const today = new Date().toISOString().split('T')[0];

  // date 파라미터 유효성 검사: YYYY-MM-DD 형식, 오늘 이하
  const targetDate = (() => {
    if (!rawDate) return today;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(rawDate)) return today;
    if (rawDate > today) return today;
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - 90);
    if (rawDate < minDate.toISOString().split('T')[0]) return today;
    return rawDate;
  })();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select({ plan: menoa_users.plan })
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);

  const plan = (dbUser?.plan ?? 'free') as 'free' | 'pro';
  const isFree = plan === 'free';

  const [categories, symptoms, existingLogs, streakData] = await Promise.all([
    getSymptomCategories(),
    getAllSymptoms(plan),
    getSymptomLogsByDate(targetDate),
    getStreakData(),
  ]);
  const tip = getPostLogTip(existingLogs.map(l => l.symptom_name));

  if (categories.length === 0) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-20">
          <p className="text-gray-400">증상 데이터가 없습니다.</p>
          <p className="text-xs text-gray-300 mt-1">관리자가 시드 데이터를 먼저 실행해야 합니다.</p>
        </div>
      </div>
    );
  }

  const isToday = targetDate === today;

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/symptoms" className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {isToday ? '오늘의 증상 기록' : '증상 기록 수정'}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {existingLogs.length > 0 && `${existingLogs.length}개 기록됨`}
          </p>
        </div>
      </div>

      {/* 날짜 선택 UI */}
      <DateSelector currentDate={targetDate} />

      {/* Free 플랜 안내 배너 */}
      {isFree && (
        <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-2" style={{ backgroundColor: '#fff7ed', borderLeft: '3px solid #f97316' }}>
          <span className="mt-0.5 flex-shrink-0">🌸</span>
          <p className="text-orange-800">
            <span className="font-semibold">Free 플랜</span>은 기본 10가지 증상만 기록 가능합니다.{' '}
            <span className="font-semibold">Pro</span>로 업그레이드하면 30개+ 증상을 추적할 수 있어요.
          </p>
        </div>
      )}

      <SymptomLogForm
        categories={categories}
        symptoms={symptoms}
        existingLogs={existingLogs}
        date={targetDate}
        tip={tip}
        streakCount={streakData.current}
      />
    </div>
  );
}
