'use server';

import { resend } from '@/lib/email/resend';
import { WelcomeEmail, subject as welcomeSubject } from '@/lib/email/templates/WelcomeEmail';
import { SymptomReportEmail, subject as reportSubject } from '@/lib/email/templates/SymptomReportEmail';
import { db } from '@/db';
import { menoa_users, menoa_symptom_logs, menoa_symptoms } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { createElement } from 'react';

const FROM_ADDRESS = 'noreply@menoa.barolabs.kr';

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { error } = await resend.emails.send({
      from: `메노아 <${FROM_ADDRESS}>`,
      to: email,
      subject: welcomeSubject,
      react: createElement(WelcomeEmail, { name }),
    });

    if (error) {
      console.error('[email] sendWelcomeEmail error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('[email] sendWelcomeEmail exception:', err);
    return { success: false, error: err };
  }
}

export async function sendWeeklyReport(userId: string) {
  // 1. 유저 정보 조회
  const [user] = await db
    .select({ email: menoa_users.email, name: menoa_users.name })
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, userId))
    .limit(1);

  if (!user) {
    console.error('[email] sendWeeklyReport: user not found', userId);
    return { success: false, error: 'user not found' };
  }

  // 2. 지난 7일 증상 로그 조회
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const logs = await db
    .select({
      symptom_id: menoa_symptom_logs.symptom_id,
      severity: menoa_symptom_logs.severity,
      symptom_name: menoa_symptoms.name,
    })
    .from(menoa_symptom_logs)
    .innerJoin(menoa_symptoms, eq(menoa_symptom_logs.symptom_id, menoa_symptoms.id))
    .where(
      sql`${menoa_symptom_logs.author_supabase_id} = ${userId}
        AND ${menoa_symptom_logs.log_date} >= ${sevenDaysAgoStr}
        AND ${menoa_symptom_logs.deleted_at} IS NULL`,
    );

  const totalLogs = logs.length;

  // 로그가 없으면 이메일 미발송
  if (totalLogs === 0) {
    return { success: true, skipped: true, reason: 'no_logs' };
  }

  // 3. 가장 많이 기록된 증상 계산
  const symptomCounts = logs.reduce<Record<string, { name: string; count: number }>>(
    (acc, log) => {
      if (!acc[log.symptom_id]) {
        acc[log.symptom_id] = { name: log.symptom_name, count: 0 };
      }
      acc[log.symptom_id].count += 1;
      return acc;
    },
    {},
  );

  const mostFrequent = Object.values(symptomCounts).sort((a, b) => b.count - a.count)[0];
  const averageSeverity =
    logs.reduce((sum, log) => sum + log.severity, 0) / totalLogs;

  // 4. 날짜 범위 포맷
  const formatDate = (date: Date) =>
    `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

  const weekEnd = new Date();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);

  // 5. 이메일 발송
  try {
    const { error } = await resend.emails.send({
      from: `메노아 <${FROM_ADDRESS}>`,
      to: user.email,
      subject: reportSubject,
      react: createElement(SymptomReportEmail, {
        name: user.name ?? undefined,
        totalLogs,
        mostFrequentSymptom: mostFrequent?.name ?? '기록 없음',
        averageSeverity,
        weekStart: formatDate(weekStart),
        weekEnd: formatDate(weekEnd),
      }),
    });

    if (error) {
      console.error('[email] sendWeeklyReport error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('[email] sendWeeklyReport exception:', err);
    return { success: false, error: err };
  }
}
