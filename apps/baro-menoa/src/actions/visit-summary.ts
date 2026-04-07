'use server';

import { db } from '@/db';
import {
  menoa_symptom_logs,
  menoa_symptoms,
  menoa_trigger_logs,
  menoa_mood_logs,
  menoa_health_profiles,
  menoa_users,
} from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, isNull, gte, lte, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getItemLabel } from '@/lib/health-profile-items';

// ──────────────────────────────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────────────────────────────

export interface SymptomSummary {
  name: string;
  count: number;
  avgSeverity: number;
  maxSeverity: number;
}

export interface SymptomTrend {
  name: string;
  firstHalfAvg: number;   // 기간 전반부 평균 심각도
  secondHalfAvg: number;  // 기간 후반부 평균 심각도
  direction: 'worsening' | 'improving' | 'stable';
  change: number;         // 후반 - 전반 (양수 = 악화)
}

export interface TriggerCorrelation {
  triggerLabel: string;
  triggerEmoji: string;
  symptomName: string;
  onDaysAvg: number;    // 트리거 있는 날 평균 심각도
  offDaysAvg: number;   // 트리거 없는 날 평균 심각도
  difference: number;   // onDays - offDays (양수 = 트리거 시 악화)
  onDaysCount: number;
  offDaysCount: number;
}

export interface TriggerSummary {
  avgCaffeine: number;
  avgAlcohol: number;
  avgSleepMinutes: number;
  avgStress: number;
  avgExerciseMinutes: number;
  daysRecorded: number;
}

export interface MoodSummary {
  avgScore: number;
  prevAvgScore: number | null;
  daysRecorded: number;
}

export interface DayHighlight {
  date: string;
  label: string; // 한국어 날짜
  avgSeverity: number;
  symptomCount: number;
}

export interface VisitSummaryData {
  userName: string;
  menopauseStage: string | null;
  birthYear: number | null;
  days: number;
  periodFrom: string;
  periodTo: string;
  totalRecordDays: number;
  dataQuality: 'good' | 'fair' | 'poor'; // good: ≥14일, fair: 7~13일, poor: <7일
  summaryText: string;   // 자동 생성 요약 문장
  symptoms: SymptomSummary[];
  trends: SymptomTrend[];
  correlations: TriggerCorrelation[];
  triggers: TriggerSummary | null;
  mood: MoodSummary | null;
  worstDay: DayHighlight | null;
  bestDay: DayHighlight | null;
  conditions: string[];
  medicalHistory: string[];
  medications: string[];
  supplements: string[];
  isSmoker: boolean;
  doctorQuestions: string[];
  generatedAt: string;
}

// ──────────────────────────────────────────────────────────────────
// 한국어 조사 헬퍼 (받침 유무에 따라 이/가, 은/는, 을/를 자동 선택)
// ──────────────────────────────────────────────────────────────────

function hasJongseong(word: string): boolean {
  if (!word) return false;
  const last = word[word.length - 1];
  const code = last.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return false;
  return (code - 0xAC00) % 28 !== 0;
}

function particle(word: string, withConsonant: string, withoutConsonant: string): string {
  return hasJongseong(word) ? withConsonant : withoutConsonant;
}

// ──────────────────────────────────────────────────────────────────
// 메인 함수
// ──────────────────────────────────────────────────────────────────

export async function getVisitSummary(days = 30): Promise<VisitSummaryData> {
  const validDays = [14, 30, 60, 90].includes(days) ? days : 30;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db.select().from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id)).limit(1);
  if (!dbUser) redirect('/login');

  const now = new Date();
  const to = now.toISOString().split('T')[0];
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - (validDays - 1));
  const from = fromDate.toISOString().split('T')[0];

  // 이전 기간 (기분 비교용)
  const prevFrom = new Date();
  prevFrom.setDate(prevFrom.getDate() - (validDays * 2 - 1));
  const prevFromStr = prevFrom.toISOString().split('T')[0];
  const prevTo = new Date();
  prevTo.setDate(prevTo.getDate() - validDays);
  const prevToStr = prevTo.toISOString().split('T')[0];

  const [symptomLogs, triggerLogs, moodLogs, prevMoodLogs, healthProfileRows] = await Promise.all([
    db.select({
      symptom_name: menoa_symptoms.name,
      severity: menoa_symptom_logs.severity,
      log_date: menoa_symptom_logs.log_date,
    })
      .from(menoa_symptom_logs)
      .innerJoin(menoa_symptoms, eq(menoa_symptom_logs.symptom_id, menoa_symptoms.id))
      .where(and(
        eq(menoa_symptom_logs.author_supabase_id, user.id),
        gte(menoa_symptom_logs.log_date, from),
        lte(menoa_symptom_logs.log_date, to),
        isNull(menoa_symptom_logs.deleted_at),
      ))
      .orderBy(desc(menoa_symptom_logs.log_date)),

    db.select().from(menoa_trigger_logs)
      .where(and(
        eq(menoa_trigger_logs.author_supabase_id, user.id),
        gte(menoa_trigger_logs.log_date, from),
        lte(menoa_trigger_logs.log_date, to),
        isNull(menoa_trigger_logs.deleted_at),
      )),

    db.select({ mood_score: menoa_mood_logs.mood_score, log_date: menoa_mood_logs.log_date })
      .from(menoa_mood_logs)
      .where(and(
        eq(menoa_mood_logs.author_supabase_id, user.id),
        gte(menoa_mood_logs.log_date, from),
        lte(menoa_mood_logs.log_date, to),
        isNull(menoa_mood_logs.deleted_at),
      )),

    db.select({ mood_score: menoa_mood_logs.mood_score })
      .from(menoa_mood_logs)
      .where(and(
        eq(menoa_mood_logs.author_supabase_id, user.id),
        gte(menoa_mood_logs.log_date, prevFromStr),
        lte(menoa_mood_logs.log_date, prevToStr),
        isNull(menoa_mood_logs.deleted_at),
      )),

    db.select().from(menoa_health_profiles)
      .where(eq(menoa_health_profiles.user_id, dbUser.id)).limit(1),
  ]);

  // ── 증상 집계 ──────────────────────────────────────────────────
  const symptomMap = new Map<string, { count: number; totalSev: number; maxSev: number; dates: string[] }>();
  const recordDates = new Set<string>();

  for (const log of symptomLogs) {
    recordDates.add(log.log_date);
    const e = symptomMap.get(log.symptom_name);
    if (e) {
      e.count++;
      e.totalSev += log.severity;
      e.maxSev = Math.max(e.maxSev, log.severity);
      e.dates.push(log.log_date);
    } else {
      symptomMap.set(log.symptom_name, { count: 1, totalSev: log.severity, maxSev: log.severity, dates: [log.log_date] });
    }
  }

  const symptoms: SymptomSummary[] = Array.from(symptomMap.entries())
    .map(([name, d]) => ({
      name,
      count: d.count,
      avgSeverity: Math.round((d.totalSev / d.count) * 10) / 10,
      maxSeverity: d.maxSev,
    }))
    .sort((a, b) => b.count - a.count || b.avgSeverity - a.avgSeverity);

  // ── 증상 추이 (전반부 vs 후반부) ───────────────────────────────
  const midDate = new Date(fromDate);
  midDate.setDate(midDate.getDate() + Math.floor(validDays / 2));
  const midStr = midDate.toISOString().split('T')[0];

  const trends: SymptomTrend[] = [];
  for (const [name, data] of symptomMap.entries()) {
    if (data.count < 4) continue; // 데이터 부족 시 추이 계산 스킵

    const firstLogs = symptomLogs.filter(l => l.symptom_name === name && l.log_date < midStr);
    const secondLogs = symptomLogs.filter(l => l.symptom_name === name && l.log_date >= midStr);

    if (firstLogs.length < 2 || secondLogs.length < 2) continue;

    const firstAvg = firstLogs.reduce((s, l) => s + l.severity, 0) / firstLogs.length;
    const secondAvg = secondLogs.reduce((s, l) => s + l.severity, 0) / secondLogs.length;
    const change = Math.round((secondAvg - firstAvg) * 10) / 10;

    trends.push({
      name,
      firstHalfAvg: Math.round(firstAvg * 10) / 10,
      secondHalfAvg: Math.round(secondAvg * 10) / 10,
      direction: change >= 0.5 ? 'worsening' : change <= -0.5 ? 'improving' : 'stable',
      change,
    });
  }
  trends.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  // ── 트리거-증상 상관관계 ────────────────────────────────────────
  const triggerByDate = new Map(triggerLogs.map(t => [t.log_date, t]));

  const TRIGGER_DEFS = [
    {
      key: 'caffeine' as const,
      label: '카페인',
      emoji: '☕',
      isHigh: (t: typeof triggerLogs[0]) => t.caffeine_cups >= 2,
      isLow: (t: typeof triggerLogs[0]) => t.caffeine_cups === 0,
    },
    {
      key: 'alcohol' as const,
      label: '음주',
      emoji: '🍷',
      isHigh: (t: typeof triggerLogs[0]) => t.alcohol_units >= 1,
      isLow: (t: typeof triggerLogs[0]) => t.alcohol_units === 0,
    },
    {
      key: 'sleep' as const,
      label: '수면 부족',
      emoji: '😴',
      isHigh: (t: typeof triggerLogs[0]) => t.sleep_minutes < 360 && t.sleep_minutes > 0, // 부족
      isLow: (t: typeof triggerLogs[0]) => t.sleep_minutes >= 420, // 충분
    },
    {
      key: 'stress' as const,
      label: '스트레스',
      emoji: '😤',
      isHigh: (t: typeof triggerLogs[0]) => (t.stress_level ?? 0) >= 4,
      isLow: (t: typeof triggerLogs[0]) => (t.stress_level ?? 0) <= 2 && t.stress_level !== null,
    },
    {
      key: 'exercise' as const,
      label: '운동 부족',
      emoji: '🏃',
      isHigh: (t: typeof triggerLogs[0]) => t.exercise_minutes === 0,
      isLow: (t: typeof triggerLogs[0]) => t.exercise_minutes >= 30,
    },
  ];

  const correlations: TriggerCorrelation[] = [];

  // 상위 5개 증상에 대해 각 트리거 상관관계 계산
  for (const symptom of symptoms.slice(0, 5)) {
    for (const trig of TRIGGER_DEFS) {
      const symptomLogsForThis = symptomLogs.filter(l => l.symptom_name === symptom.name);

      const onDays = symptomLogsForThis.filter(l => {
        const t = triggerByDate.get(l.log_date);
        return t && trig.isHigh(t);
      });
      const offDays = symptomLogsForThis.filter(l => {
        const t = triggerByDate.get(l.log_date);
        return t && trig.isLow(t);
      });

      if (onDays.length < 2 || offDays.length < 2) continue;

      const onAvg = onDays.reduce((s, l) => s + l.severity, 0) / onDays.length;
      const offAvg = offDays.reduce((s, l) => s + l.severity, 0) / offDays.length;
      const diff = Math.round((onAvg - offAvg) * 10) / 10;

      // 0.6 이상 차이일 때만 유의미한 상관관계로 표시
      if (Math.abs(diff) >= 0.6) {
        // 이미 같은 트리거로 더 강한 상관관계가 있으면 스킵
        const existing = correlations.find(c => c.triggerLabel === trig.label);
        if (existing && Math.abs(existing.difference) >= Math.abs(diff)) continue;

        correlations.push({
          triggerLabel: trig.label,
          triggerEmoji: trig.emoji,
          symptomName: symptom.name,
          onDaysAvg: Math.round(onAvg * 10) / 10,
          offDaysAvg: Math.round(offAvg * 10) / 10,
          difference: diff,
          onDaysCount: onDays.length,
          offDaysCount: offDays.length,
        });
      }
    }
  }
  correlations.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  // ── 트리거 집계 ───────────────────────────────────────────────
  let triggers: TriggerSummary | null = null;
  if (triggerLogs.length > 0) {
    const n = triggerLogs.length;
    const sum = triggerLogs.reduce(
      (acc, t) => ({
        caffeine: acc.caffeine + t.caffeine_cups,
        alcohol: acc.alcohol + t.alcohol_units,
        sleep: acc.sleep + t.sleep_minutes,
        stress: acc.stress + (t.stress_level ?? 0),
        stressCount: acc.stressCount + (t.stress_level ? 1 : 0),
        exercise: acc.exercise + t.exercise_minutes,
      }),
      { caffeine: 0, alcohol: 0, sleep: 0, stress: 0, stressCount: 0, exercise: 0 },
    );
    triggers = {
      avgCaffeine: Math.round((sum.caffeine / n) * 10) / 10,
      avgAlcohol: Math.round((sum.alcohol / n) * 10) / 10,
      avgSleepMinutes: Math.round(sum.sleep / n),
      avgStress: sum.stressCount > 0 ? Math.round((sum.stress / sum.stressCount) * 10) / 10 : 0,
      avgExerciseMinutes: Math.round(sum.exercise / n),
      daysRecorded: n,
    };
  }

  // ── 기분 집계 ────────────────────────────────────────────────
  let mood: MoodSummary | null = null;
  if (moodLogs.length > 0) {
    const avg = moodLogs.reduce((s, m) => s + m.mood_score, 0) / moodLogs.length;
    const prevAvg = prevMoodLogs.length > 0
      ? prevMoodLogs.reduce((s, m) => s + m.mood_score, 0) / prevMoodLogs.length
      : null;
    mood = {
      avgScore: Math.round(avg * 10) / 10,
      prevAvgScore: prevAvg ? Math.round(prevAvg * 10) / 10 : null,
      daysRecorded: moodLogs.length,
    };
  }

  // ── 최악/최고의 날 ────────────────────────────────────────────
  const dayMap = new Map<string, { totalSev: number; count: number }>();
  for (const log of symptomLogs) {
    const e = dayMap.get(log.log_date);
    if (e) { e.totalSev += log.severity; e.count++; }
    else dayMap.set(log.log_date, { totalSev: log.severity, count: 1 });
  }

  const dayEntries = Array.from(dayMap.entries())
    .map(([date, d]) => ({ date, avg: d.totalSev / d.count, count: d.count }))
    .filter(d => d.count >= 1);

  const fmtDate = (s: string) => {
    const d = new Date(s + 'T00:00:00');
    return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  };

  let worstDay: DayHighlight | null = null;
  let bestDay: DayHighlight | null = null;

  if (dayEntries.length >= 2) {
    const worst = dayEntries.reduce((a, b) => b.avg > a.avg ? b : a);
    const best = dayEntries.reduce((a, b) => b.avg < a.avg ? b : a);
    worstDay = { date: worst.date, label: fmtDate(worst.date), avgSeverity: Math.round(worst.avg * 10) / 10, symptomCount: worst.count };
    if (best.date !== worst.date) {
      bestDay = { date: best.date, label: fmtDate(best.date), avgSeverity: Math.round(best.avg * 10) / 10, symptomCount: best.count };
    }
  }

  // ── 건강 프로필 ───────────────────────────────────────────────
  const profile = healthProfileRows[0] ?? null;

  const stageLabels: Record<string, string> = {
    pre: '폐경 전기 (Pre-menopause)',
    peri: '폐경 이행기 (Perimenopause)',
    post: '폐경 후기 (Post-menopause)',
  };

  // ── 데이터 품질 ───────────────────────────────────────────────
  const totalDays = recordDates.size;
  const dataQuality: 'good' | 'fair' | 'poor' =
    totalDays >= 14 ? 'good' : totalDays >= 7 ? 'fair' : 'poor';

  // ── 자동 요약 문장 ─────────────────────────────────────────────
  const summaryParts: string[] = [];

  if (symptoms.length === 0) {
    summaryParts.push('해당 기간에 기록된 증상이 없습니다.');
  } else {
    const main = symptoms[0];
    const mainParticle = particle(main.name, '이', '가');
    summaryParts.push(
      `최근 ${validDays}일간 ${main.name}${mainParticle} 주요 증상으로 ${main.count}회 기록되었으며, 평균 심각도는 ${main.avgSeverity}/5입니다.`
    );

    const worsening = trends.find(t => t.direction === 'worsening');
    if (worsening) {
      const wp = particle(worsening.name, '은', '는');
      summaryParts.push(`${worsening.name}${wp} 기간 후반 기록 평균이 높아졌어요(전반 ${worsening.firstHalfAvg} → 후반 ${worsening.secondHalfAvg}).`);
    }

    const strongCorr = correlations[0];
    if (strongCorr && Math.abs(strongCorr.difference) >= 0.8) {
      const dir = strongCorr.difference > 0 ? '높게' : '낮게';
      summaryParts.push(`${strongCorr.triggerLabel} 기록이 있는 날에 ${strongCorr.symptomName} 심각도가 ${dir} 기록되었어요(차이 ${Math.abs(strongCorr.difference)}점).`);
    }

    if (mood && mood.avgScore <= 2.5) {
      summaryParts.push(`기분 점수 평균이 ${mood.avgScore}/5로 기록되었어요.`);
    }
  }

  const summaryText = summaryParts.join(' ');

  // ── 전문의 질문 가이드 ─────────────────────────────────────────
  const doctorQuestions: string[] = [];

  if (symptoms.length > 0 && symptoms[0].avgSeverity >= 3) {
    doctorQuestions.push(`"${symptoms[0].name}" 기록이 자주 남아 있어요. 관련 치료 방법에 대해 상담받고 싶습니다.`);
  }

  if (triggers && triggers.avgSleepMinutes > 0 && triggers.avgSleepMinutes < 360) {
    const h = Math.floor(triggers.avgSleepMinutes / 60);
    const m = triggers.avgSleepMinutes % 60;
    doctorQuestions.push(`평균 수면 기록이 ${h}시간 ${m > 0 ? m + '분' : ''}이에요. 수면 개선 방법이 있을까요?`);
  }

  if (mood && mood.avgScore <= 2.5) {
    doctorQuestions.push(`기분 점수가 낮게 기록되고 있어요. 기분 관련 상담이 도움이 될까요?`);
  }

  const alcoholCorr = correlations.find(c => c.triggerLabel === '음주' && c.difference >= 0.8);
  if (alcoholCorr) {
    doctorQuestions.push(`음주 기록이 있는 날에 ${alcoholCorr.symptomName} 점수가 높게 기록됐어요. 음주와 갱년기 증상에 대해 궁금합니다.`);
  }

  if (profile?.conditions?.includes('thyroid')) {
    doctorQuestions.push('갑상선 질환이 갱년기 증상과 유사한 증상을 유발할 수 있다고 하는데, 현재 갑상선 수치 확인이 필요한가요?');
  }

  if (symptoms.some(s => s.name.includes('안면홍조') || s.name.includes('발한')) && symptoms.some(s => s.avgSeverity >= 4)) {
    doctorQuestions.push('안면홍조·발한 기록이 자주 있어요. 도움이 되는 방법에 대해 상담받고 싶습니다.');
  }

  if (doctorQuestions.length === 0) {
    doctorQuestions.push('현재 증상에 맞는 치료 방법이나 생활 습관 개선 방법이 있나요?');
  }

  return {
    userName: dbUser.name ?? '사용자',
    menopauseStage: dbUser.menopause_stage ? stageLabels[dbUser.menopause_stage] ?? null : null,
    birthYear: dbUser.birth_year,
    days: validDays,
    periodFrom: from,
    periodTo: to,
    totalRecordDays: totalDays,
    dataQuality,
    summaryText,
    symptoms,
    trends,
    correlations,
    triggers,
    mood,
    worstDay,
    bestDay,
    conditions: (profile?.conditions ?? []).map(id => getItemLabel(id)),
    medicalHistory: (profile?.medical_history ?? []).map(id => getItemLabel(id)),
    medications: (profile?.medications ?? []).map(id => getItemLabel(id)),
    supplements: (profile?.supplements ?? []).map(id => getItemLabel(id)),
    isSmoker: profile?.is_smoker ?? false,
    doctorQuestions,
    generatedAt: now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
  };
}
