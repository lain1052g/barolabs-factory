'use server';

import { db } from '@/db';
import {
  menoa_symptom_logs,
  menoa_symptoms,
  menoa_trigger_logs,
  menoa_users,
} from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, isNull, gte, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { isProPlan } from '@/lib/plan';

export type TriggerCorrelation = {
  trigger: string;
  trigger_label: string;
  trigger_emoji: string;
  days_with: number;
  avg_severity_with: number;
  days_without: number;
  avg_severity_without: number;
  severity_delta: number; // positive = trigger worsens symptoms
  top_symptom: string | null;
};

export type CorrelationResult = {
  plan: 'free' | 'pro';
  periodDays: number;
  analyzed_days: number;
  correlations: TriggerCorrelation[];
};

export async function getTriggerCorrelation(): Promise<CorrelationResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select({ plan: menoa_users.plan, pro_expires_at: menoa_users.pro_expires_at })
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);

  if (!dbUser) redirect('/login');

  const plan = isProPlan(dbUser.plan, dbUser.pro_expires_at) ? 'pro' : 'free' as 'free' | 'pro';
  const periodDays = plan === 'free' ? 30 : 90;

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - periodDays);
  const fromStr = fromDate.toISOString().split('T')[0];

  // 1. 트리거 기록이 있는 날짜들 전부 가져오기
  const triggerRows = await db
    .select({
      log_date: menoa_trigger_logs.log_date,
      caffeine_cups: menoa_trigger_logs.caffeine_cups,
      alcohol_units: menoa_trigger_logs.alcohol_units,
      stress_level: menoa_trigger_logs.stress_level,
      sleep_minutes: menoa_trigger_logs.sleep_minutes,
      exercise_minutes: menoa_trigger_logs.exercise_minutes,
    })
    .from(menoa_trigger_logs)
    .where(
      and(
        eq(menoa_trigger_logs.author_supabase_id, user.id),
        gte(menoa_trigger_logs.log_date, fromStr),
        isNull(menoa_trigger_logs.deleted_at),
      ),
    );

  if (triggerRows.length === 0) {
    return { plan, periodDays, analyzed_days: 0, correlations: [] };
  }

  // 2. 같은 날짜의 증상 평균 심각도 + 가장 많은 증상 가져오기
  const symptomAggRows = await db
    .select({
      log_date: menoa_symptom_logs.log_date,
      avg_severity: sql<number>`round(avg(${menoa_symptom_logs.severity})::numeric, 2)`,
    })
    .from(menoa_symptom_logs)
    .where(
      and(
        eq(menoa_symptom_logs.author_supabase_id, user.id),
        gte(menoa_symptom_logs.log_date, fromStr),
        isNull(menoa_symptom_logs.deleted_at),
      ),
    )
    .groupBy(menoa_symptom_logs.log_date);

  const symptomMap = new Map(
    symptomAggRows.map((r) => [r.log_date, Number(r.avg_severity)]),
  );

  // 3. 날짜별 최다 증상명
  const topSymptomRows = await db
    .select({
      log_date: menoa_symptom_logs.log_date,
      symptom_name: menoa_symptoms.name,
      cnt: sql<number>`count(*)::int`,
    })
    .from(menoa_symptom_logs)
    .innerJoin(menoa_symptoms, eq(menoa_symptom_logs.symptom_id, menoa_symptoms.id))
    .where(
      and(
        eq(menoa_symptom_logs.author_supabase_id, user.id),
        gte(menoa_symptom_logs.log_date, fromStr),
        isNull(menoa_symptom_logs.deleted_at),
      ),
    )
    .groupBy(menoa_symptom_logs.log_date, menoa_symptoms.name)
    .orderBy(sql`count(*) desc`);

  // 날짜별 최다 증상 (첫 번째만)
  const topSymptomMap = new Map<string, string>();
  for (const row of topSymptomRows) {
    if (!topSymptomMap.has(row.log_date)) {
      topSymptomMap.set(row.log_date, row.symptom_name);
    }
  }

  // 4. 분석 대상: 트리거 기록이 있고 동시에 증상 기록도 있는 날짜
  const datesWithBoth = triggerRows.filter((t) => symptomMap.has(t.log_date));
  const analyzedDays = datesWithBoth.length;

  if (analyzedDays === 0) {
    return { plan, periodDays, analyzed_days: 0, correlations: [] };
  }

  type TriggerDef = {
    key: keyof (typeof triggerRows)[0];
    label: string;
    emoji: string;
    check: (row: (typeof triggerRows)[0]) => boolean;
  };

  const triggerDefs: TriggerDef[] = [
    {
      key: 'caffeine_cups',
      label: '카페인',
      emoji: '☕',
      check: (r) => r.caffeine_cups > 0,
    },
    {
      key: 'alcohol_units',
      label: '음주',
      emoji: '🍷',
      check: (r) => r.alcohol_units > 0,
    },
    {
      key: 'stress_level',
      label: '고스트레스',
      emoji: '😤',
      check: (r) => r.stress_level !== null && r.stress_level >= 4,
    },
    {
      key: 'sleep_minutes',
      label: '수면 부족',
      emoji: '😴',
      check: (r) => r.sleep_minutes > 0 && r.sleep_minutes < 360,
    },
    {
      key: 'exercise_minutes',
      label: '운동',
      emoji: '🏃',
      check: (r) => r.exercise_minutes > 0,
    },
  ];

  const correlations: TriggerCorrelation[] = [];

  for (const def of triggerDefs) {
    const withDays = datesWithBoth.filter((r) => def.check(r));
    const withoutDays = datesWithBoth.filter((r) => !def.check(r));

    if (withDays.length === 0) continue;

    const avgWith =
      withDays.reduce((sum, r) => sum + (symptomMap.get(r.log_date) ?? 0), 0) /
      withDays.length;

    const avgWithout =
      withoutDays.length > 0
        ? withoutDays.reduce((sum, r) => sum + (symptomMap.get(r.log_date) ?? 0), 0) /
          withoutDays.length
        : 0;

    // 가장 많이 나타난 증상
    const symptomCounts = new Map<string, number>();
    for (const r of withDays) {
      const sym = topSymptomMap.get(r.log_date);
      if (sym) symptomCounts.set(sym, (symptomCounts.get(sym) ?? 0) + 1);
    }
    const topSymptom =
      symptomCounts.size > 0
        ? [...symptomCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]
        : null;

    correlations.push({
      trigger: def.key as string,
      trigger_label: def.label,
      trigger_emoji: def.emoji,
      days_with: withDays.length,
      avg_severity_with: Math.round(avgWith * 10) / 10,
      days_without: withoutDays.length,
      avg_severity_without: Math.round(avgWithout * 10) / 10,
      severity_delta: Math.round((avgWith - avgWithout) * 10) / 10,
      top_symptom: topSymptom,
    });
  }

  // severity_delta 내림차순 정렬 (증상에 가장 영향 큰 트리거 먼저)
  correlations.sort((a, b) => b.severity_delta - a.severity_delta);

  return { plan, periodDays, analyzed_days: analyzedDays, correlations };
}
