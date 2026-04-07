'use server';

import { db } from '@/db';
import { menoa_symptom_logs, menoa_users } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export interface StreakData {
  current: number;       // 현재 연속 기록 일수
  totalDays: number;     // 전체 기록한 날 수 (중복 제외)
  progressTo30: number;  // 30일 분석까지 진행률 (0~100)
  daysRemaining: number; // 30일 분석까지 남은 날
  isNewRecord: boolean;  // 오늘 첫 기록 여부
}

export async function getStreakData(): Promise<StreakData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select({ id: menoa_users.id })
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);

  if (!dbUser) return { current: 0, totalDays: 0, progressTo30: 0, daysRemaining: 30, isNewRecord: false };

  // 기록된 날짜 목록 (중복 제거, 최신순)
  const logs = await db
    .select({ log_date: menoa_symptom_logs.log_date })
    .from(menoa_symptom_logs)
    .where(eq(menoa_symptom_logs.author_id, dbUser.id))
    .orderBy(desc(menoa_symptom_logs.log_date));

  // 유니크한 날짜만 추출
  const uniqueDates = [...new Set(logs.map(l => l.log_date))].sort().reverse();
  const totalDays = uniqueDates.length;

  if (totalDays === 0) {
    return { current: 0, totalDays: 0, progressTo30: 0, daysRemaining: 30, isNewRecord: false };
  }

  // 연속 일수 계산 (오늘 또는 어제부터 연속)
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const mostRecent = uniqueDates[0];

  // 가장 최근 기록이 오늘도 어제도 아니면 streak = 0
  if (mostRecent !== today && mostRecent !== yesterday) {
    return {
      current: 0,
      totalDays,
      progressTo30: Math.min(100, Math.round((totalDays / 30) * 100)),
      daysRemaining: Math.max(0, 30 - totalDays),
      isNewRecord: false,
    };
  }

  // 연속 일수 세기
  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  // 오늘 처음 기록인지
  const isNewRecord = mostRecent === today && logs.filter(l => l.log_date === today).length > 0;

  return {
    current: streak,
    totalDays,
    progressTo30: Math.min(100, Math.round((totalDays / 30) * 100)),
    daysRemaining: Math.max(0, 30 - totalDays),
    isNewRecord,
  };
}
