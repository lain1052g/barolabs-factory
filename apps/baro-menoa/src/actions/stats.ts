'use server';

import { db } from '@/db';
import {
  menoa_symptom_logs,
  menoa_symptom_categories,
  menoa_symptoms,
  menoa_users,
} from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, isNull, gte, lte, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';

// ─── 반환 타입 정의 ────────────────────────────────────

export type MonthlyCount = {
  year: number;
  month: number;
  label: string; // "3월", "4월" etc.
  count: number;
};

export type CategoryDistribution = {
  category_id: string;
  category_name: string;
  count: number;
  percentage: number;
};

export type TopSymptom = {
  symptom_id: string;
  symptom_name: string;
  count: number;
  avg_severity: number;
};

export type WeeklySeverity = {
  weekLabel: string; // "3/31~4/6"
  avgSeverity: number;
};

export type SymptomStatsResult = {
  plan: 'free' | 'pro';
  periodMonths: number; // Free: 1, Pro: unlimited (최대 12)
  totalLogs: number;
  monthlyCounts: MonthlyCount[];
  categoryDistribution: CategoryDistribution[];
  topSymptoms: TopSymptom[];
  weeklySeverity: WeeklySeverity[];
};

// ─── 헬퍼: 날짜 범위 계산 ──────────────────────────────

function getFromDate(plan: 'free' | 'pro'): Date {
  const from = new Date();
  if (plan === 'free') {
    // Free: 최근 1개월
    from.setMonth(from.getMonth() - 1);
  } else {
    // Pro: 최근 12개월
    from.setMonth(from.getMonth() - 12);
  }
  from.setHours(0, 0, 0, 0);
  return from;
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

// ─── 메인 Server Action ────────────────────────────────

export async function getSymptomStats(): Promise<SymptomStatsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 플랜 조회
  const [dbUser] = await db
    .select({ plan: menoa_users.plan })
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);

  if (!dbUser) redirect('/login');

  const plan = (dbUser.plan ?? 'free') as 'free' | 'pro';
  const periodMonths = plan === 'free' ? 1 : 12;

  const fromDate = getFromDate(plan);
  const fromStr = toDateStr(fromDate);
  const toStr = toDateStr(new Date());

  // ── 1. 전체 기록 수 ──────────────────────────────────
  const [totalRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(menoa_symptom_logs)
    .where(
      and(
        eq(menoa_symptom_logs.author_supabase_id, user.id),
        gte(menoa_symptom_logs.log_date, fromStr),
        lte(menoa_symptom_logs.log_date, toStr),
        isNull(menoa_symptom_logs.deleted_at),
      ),
    );
  const totalLogs = Number(totalRow?.count ?? 0);

  // ── 2. 월별 기록 수 ──────────────────────────────────
  // 최근 3개월 (Free는 1개월이지만 UI는 3개 슬롯 표시, 데이터 없으면 0)
  const monthsToShow = plan === 'free' ? 1 : 3;
  const monthSlots: MonthlyCount[] = [];

  for (let i = monthsToShow - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-indexed
    const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0);
    const lastDayStr = toDateStr(lastDay);

    // Free는 1개월만 조회
    const effectiveFrom =
      plan === 'free'
        ? (firstDay < fromStr ? fromStr : firstDay)
        : firstDay;

    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(menoa_symptom_logs)
      .where(
        and(
          eq(menoa_symptom_logs.author_supabase_id, user.id),
          gte(menoa_symptom_logs.log_date, effectiveFrom),
          lte(menoa_symptom_logs.log_date, lastDayStr),
          isNull(menoa_symptom_logs.deleted_at),
        ),
      );

    monthSlots.push({
      year,
      month,
      label: `${month}월`,
      count: Number(row?.count ?? 0),
    });
  }

  // ── 3. 카테고리별 분포 ────────────────────────────────
  const categoryRows = await db
    .select({
      category_id: menoa_symptom_categories.id,
      category_name: menoa_symptom_categories.name,
      count: sql<number>`count(${menoa_symptom_logs.id})::int`,
    })
    .from(menoa_symptom_logs)
    .innerJoin(
      menoa_symptoms,
      eq(menoa_symptom_logs.symptom_id, menoa_symptoms.id),
    )
    .innerJoin(
      menoa_symptom_categories,
      eq(menoa_symptoms.category_id, menoa_symptom_categories.id),
    )
    .where(
      and(
        eq(menoa_symptom_logs.author_supabase_id, user.id),
        gte(menoa_symptom_logs.log_date, fromStr),
        lte(menoa_symptom_logs.log_date, toStr),
        isNull(menoa_symptom_logs.deleted_at),
      ),
    )
    .groupBy(
      menoa_symptom_categories.id,
      menoa_symptom_categories.name,
    );

  const catTotal = categoryRows.reduce((s, r) => s + Number(r.count), 0);
  const categoryDistribution: CategoryDistribution[] = categoryRows.map((r) => ({
    category_id: r.category_id,
    category_name: r.category_name,
    count: Number(r.count),
    percentage: catTotal > 0 ? Math.round((Number(r.count) / catTotal) * 100) : 0,
  }));

  // ── 4. Top 5 증상 ─────────────────────────────────────
  const topRows = await db
    .select({
      symptom_id: menoa_symptoms.id,
      symptom_name: menoa_symptoms.name,
      count: sql<number>`count(${menoa_symptom_logs.id})::int`,
      avg_severity: sql<number>`round(avg(${menoa_symptom_logs.severity})::numeric, 1)`,
    })
    .from(menoa_symptom_logs)
    .innerJoin(
      menoa_symptoms,
      eq(menoa_symptom_logs.symptom_id, menoa_symptoms.id),
    )
    .where(
      and(
        eq(menoa_symptom_logs.author_supabase_id, user.id),
        gte(menoa_symptom_logs.log_date, fromStr),
        lte(menoa_symptom_logs.log_date, toStr),
        isNull(menoa_symptom_logs.deleted_at),
      ),
    )
    .groupBy(menoa_symptoms.id, menoa_symptoms.name)
    .orderBy(sql`count(${menoa_symptom_logs.id}) desc`)
    .limit(5);

  const topSymptoms: TopSymptom[] = topRows.map((r) => ({
    symptom_id: r.symptom_id,
    symptom_name: r.symptom_name,
    count: Number(r.count),
    avg_severity: Number(r.avg_severity),
  }));

  // ── 5. 주별 평균 심각도 (최근 4주) ───────────────────
  const weeklySeverity: WeeklySeverity[] = [];
  const weeksToShow = 4;

  for (let i = weeksToShow - 1; i >= 0; i--) {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    const wsStr = toDateStr(weekStart);
    const weStr = toDateStr(weekEnd);

    // Free는 fromStr 이후만
    if (weStr < fromStr) {
      weeklySeverity.push({
        weekLabel: `${weekStart.getMonth() + 1}/${weekStart.getDate()}~${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`,
        avgSeverity: 0,
      });
      continue;
    }

    const effectiveWs = wsStr < fromStr ? fromStr : wsStr;

    const [sevRow] = await db
      .select({
        avg: sql<number>`round(avg(${menoa_symptom_logs.severity})::numeric, 1)`,
      })
      .from(menoa_symptom_logs)
      .where(
        and(
          eq(menoa_symptom_logs.author_supabase_id, user.id),
          gte(menoa_symptom_logs.log_date, effectiveWs),
          lte(menoa_symptom_logs.log_date, weStr),
          isNull(menoa_symptom_logs.deleted_at),
        ),
      );

    weeklySeverity.push({
      weekLabel: `${weekStart.getMonth() + 1}/${weekStart.getDate()}~${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`,
      avgSeverity: Number(sevRow?.avg ?? 0),
    });
  }

  return {
    plan,
    periodMonths,
    totalLogs,
    monthlyCounts: monthSlots,
    categoryDistribution,
    topSymptoms,
    weeklySeverity,
  };
}
