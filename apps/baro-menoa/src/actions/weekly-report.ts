'use server';

import { db } from '@/db';
import {
  menoa_symptom_logs,
  menoa_symptoms,
  menoa_users,
  menoa_mood_logs,
  menoa_trigger_logs,
} from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, isNull, gte, lte, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';

// ─── 반환 타입 ─────────────────────────────────────────────

export type WeeklyTopSymptom = {
  name: string;
  count: number;
  avgSeverity: number;
};

export type WeeklyDayEntry = {
  date: string;           // YYYY-MM-DD
  dateLabel: string;      // "4/1 (화)" 형식
  symptoms: string[];     // 기록된 증상 이름 목록
  severity: number;       // 해당 날 평균 중증도 (0이면 기록 없음)
  mood: number | null;    // Pro only, null for free or no record
};

export type WeeklyTriggerSummary = {
  caffeine: number;   // 주 평균 카페인 (잔)
  alcohol: number;    // 주 평균 음주 (단위)
  stress: number;     // 주 평균 스트레스 1~5
  sleep: number;      // 주 평균 수면 (분)
  exercise: number;   // 주 평균 운동 (분)
};

export type WeeklyReportResult = {
  plan: 'free' | 'pro';
  weekOffset: number;
  weekStart: string;  // YYYY-MM-DD
  weekEnd: string;    // YYYY-MM-DD
  logDays: number;    // 기록한 날 수 (최대 7)
  avgSeverity: number;
  topSymptoms: WeeklyTopSymptom[];
  moodAvg: number | null;           // Pro only
  triggerSummary: WeeklyTriggerSummary | null; // Pro only
  dayByDay: WeeklyDayEntry[];
};

// ─── 헬퍼 ──────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function makeDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dayName = DAY_NAMES[d.getDay()];
  return `${month}/${day} (${dayName})`;
}

/** weekOffset=0 → 이번 주 월요일~일요일, weekOffset=1 → 지난 주 */
function getWeekRange(weekOffset: number): { weekStart: Date; weekEnd: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 이번 주 월요일
  const dayOfWeek = today.getDay(); // 0=일요일
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() + diffToMonday);

  // weekOffset 만큼 뒤로
  const weekStart = new Date(thisMonday);
  weekStart.setDate(thisMonday.getDate() - weekOffset * 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return { weekStart, weekEnd };
}

// ─── 메인 Server Action ────────────────────────────────────

export async function getWeeklyReport(
  weekOffset: number = 0,
): Promise<WeeklyReportResult> {
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

  const { weekStart, weekEnd } = getWeekRange(weekOffset);
  const weekStartStr = toDateStr(weekStart);
  const weekEndStr = toDateStr(weekEnd);

  // ── 1. 해당 주 증상 로그 전체 조회 ──────────────────────
  const logs = await db
    .select({
      log_date: menoa_symptom_logs.log_date,
      severity: menoa_symptom_logs.severity,
      symptom_name: menoa_symptoms.name,
    })
    .from(menoa_symptom_logs)
    .innerJoin(
      menoa_symptoms,
      eq(menoa_symptom_logs.symptom_id, menoa_symptoms.id),
    )
    .where(
      and(
        eq(menoa_symptom_logs.author_supabase_id, user.id),
        gte(menoa_symptom_logs.log_date, weekStartStr),
        lte(menoa_symptom_logs.log_date, weekEndStr),
        isNull(menoa_symptom_logs.deleted_at),
      ),
    );

  // ── 2. 기록한 날 수 ───────────────────────────────────
  const logDaysSet = new Set(logs.map((l) => l.log_date));
  const logDays = logDaysSet.size;

  // ── 3. 평균 중증도 ────────────────────────────────────
  const avgSeverity =
    logs.length > 0
      ? Math.round(
          (logs.reduce((s, l) => s + l.severity, 0) / logs.length) * 10,
        ) / 10
      : 0;

  // ── 4. Top 5 증상 ─────────────────────────────────────
  const symptomMap = new Map<string, { count: number; totalSeverity: number }>();
  for (const log of logs) {
    const existing = symptomMap.get(log.symptom_name) ?? {
      count: 0,
      totalSeverity: 0,
    };
    symptomMap.set(log.symptom_name, {
      count: existing.count + 1,
      totalSeverity: existing.totalSeverity + log.severity,
    });
  }
  const topSymptoms: WeeklyTopSymptom[] = Array.from(symptomMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgSeverity:
        Math.round((data.totalSeverity / data.count) * 10) / 10,
    }));

  // ── 5. 기분 평균 (Pro only) ───────────────────────────
  let moodAvg: number | null = null;
  if (plan === 'pro') {
    const [moodRow] = await db
      .select({
        avg: sql<number>`round(avg(${menoa_mood_logs.mood_score})::numeric, 1)`,
      })
      .from(menoa_mood_logs)
      .where(
        and(
          eq(menoa_mood_logs.author_supabase_id, user.id),
          gte(menoa_mood_logs.log_date, weekStartStr),
          lte(menoa_mood_logs.log_date, weekEndStr),
          isNull(menoa_mood_logs.deleted_at),
        ),
      );
    moodAvg = moodRow?.avg != null ? Number(moodRow.avg) : null;
  }

  // ── 6. 트리거 요약 (Pro only) ─────────────────────────
  let triggerSummary: WeeklyTriggerSummary | null = null;
  if (plan === 'pro') {
    const [trigRow] = await db
      .select({
        caffeine: sql<number>`round(avg(${menoa_trigger_logs.caffeine_cups})::numeric, 1)`,
        alcohol: sql<number>`round(avg(${menoa_trigger_logs.alcohol_units})::numeric, 1)`,
        stress: sql<number>`round(avg(${menoa_trigger_logs.stress_level})::numeric, 1)`,
        sleep: sql<number>`round(avg(${menoa_trigger_logs.sleep_minutes})::numeric, 0)`,
        exercise: sql<number>`round(avg(${menoa_trigger_logs.exercise_minutes})::numeric, 0)`,
      })
      .from(menoa_trigger_logs)
      .where(
        and(
          eq(menoa_trigger_logs.author_supabase_id, user.id),
          gte(menoa_trigger_logs.log_date, weekStartStr),
          lte(menoa_trigger_logs.log_date, weekEndStr),
          isNull(menoa_trigger_logs.deleted_at),
        ),
      );

    if (trigRow) {
      triggerSummary = {
        caffeine: Number(trigRow.caffeine ?? 0),
        alcohol: Number(trigRow.alcohol ?? 0),
        stress: Number(trigRow.stress ?? 0),
        sleep: Number(trigRow.sleep ?? 0),
        exercise: Number(trigRow.exercise ?? 0),
      };
    }
  }

  // ── 7. 일별 요약 (7일 배열) ───────────────────────────
  // 기분 기록 조회 (Pro only)
  const moodByDate = new Map<string, number>();
  if (plan === 'pro') {
    const moodLogs = await db
      .select({
        log_date: menoa_mood_logs.log_date,
        mood_score: menoa_mood_logs.mood_score,
      })
      .from(menoa_mood_logs)
      .where(
        and(
          eq(menoa_mood_logs.author_supabase_id, user.id),
          gte(menoa_mood_logs.log_date, weekStartStr),
          lte(menoa_mood_logs.log_date, weekEndStr),
          isNull(menoa_mood_logs.deleted_at),
        ),
      );
    for (const m of moodLogs) {
      moodByDate.set(m.log_date, m.mood_score);
    }
  }

  // 증상 로그를 날짜별로 그룹화
  const logsByDate = new Map<
    string,
    { symptoms: string[]; totalSeverity: number; count: number }
  >();
  for (const log of logs) {
    const existing = logsByDate.get(log.log_date) ?? {
      symptoms: [],
      totalSeverity: 0,
      count: 0,
    };
    if (!existing.symptoms.includes(log.symptom_name)) {
      existing.symptoms.push(log.symptom_name);
    }
    logsByDate.set(log.log_date, {
      symptoms: existing.symptoms,
      totalSeverity: existing.totalSeverity + log.severity,
      count: existing.count + 1,
    });
  }

  const dayByDay: WeeklyDayEntry[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = toDateStr(d);
    const dayLogs = logsByDate.get(dateStr);
    dayByDay.push({
      date: dateStr,
      dateLabel: makeDateLabel(dateStr),
      symptoms: dayLogs?.symptoms ?? [],
      severity:
        dayLogs && dayLogs.count > 0
          ? Math.round((dayLogs.totalSeverity / dayLogs.count) * 10) / 10
          : 0,
      mood: plan === 'pro' ? (moodByDate.get(dateStr) ?? null) : null,
    });
  }

  return {
    plan,
    weekOffset,
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    logDays,
    avgSeverity,
    topSymptoms,
    moodAvg,
    triggerSummary,
    dayByDay,
  };
}
