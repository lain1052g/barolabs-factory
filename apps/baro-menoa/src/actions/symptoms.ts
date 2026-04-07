'use server';

import { db } from '@/db';
import {
  menoa_symptom_logs,
  menoa_symptom_categories,
  menoa_symptoms,
  menoa_users,
} from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, isNull, desc, gte, lte, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logSymptomSchema } from '@/lib/schemas/symptom.schema';
import { z } from 'zod';
import { isProPlan } from '@/lib/plan';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다.');

const dateRangeSchema = z.object({
  from: dateString,
  to: dateString,
});

const singleDateSchema = z.object({
  date: dateString,
});

const recentDaysSchema = z.object({
  days: z.number().int().min(1).max(365),
});

const deleteSymptomLogSchema = z.object({
  id: z.string().uuid('유효하지 않은 기록 ID입니다.'),
});

// Free: 추적 가능한 증상 종류 10개
// Pro: 30개+
const PLAN_LIMITS = { free: { symptoms: 10 }, pro: { symptoms: 999 } };

// ── 증상 카테고리 + 마스터 목록 ───────────────────────
export async function getSymptomCategories() {
  return db
    .select()
    .from(menoa_symptom_categories)
    .orderBy(menoa_symptom_categories.sort_order);
}

export async function getAllSymptoms(plan: 'free' | 'pro' = 'free') {
  const limit = PLAN_LIMITS[plan].symptoms;
  return db
    .select({
      id: menoa_symptoms.id,
      name: menoa_symptoms.name,
      name_en: menoa_symptoms.name_en,
      category_id: menoa_symptoms.category_id,
      sort_order: menoa_symptoms.sort_order,
    })
    .from(menoa_symptoms)
    .where(eq(menoa_symptoms.is_active, true))
    .orderBy(menoa_symptoms.sort_order)
    .limit(limit);
}

// ── 날짜 범위 기록 조회 (목록 페이지용) ──────────────
export async function getSymptomLogsByDateRange(from: string, to: string) {
  const parsed = dateRangeSchema.safeParse({ from, to });
  if (!parsed.success) return [];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return db
    .select({
      id: menoa_symptom_logs.id,
      symptom_id: menoa_symptom_logs.symptom_id,
      severity: menoa_symptom_logs.severity,
      note: menoa_symptom_logs.note,
      log_date: menoa_symptom_logs.log_date,
      symptom_name: menoa_symptoms.name,
      category_id: menoa_symptoms.category_id,
    })
    .from(menoa_symptom_logs)
    .innerJoin(menoa_symptoms, eq(menoa_symptom_logs.symptom_id, menoa_symptoms.id))
    .where(and(
      eq(menoa_symptom_logs.author_supabase_id, user.id),
      gte(menoa_symptom_logs.log_date, parsed.data.from),
      lte(menoa_symptom_logs.log_date, parsed.data.to),
      isNull(menoa_symptom_logs.deleted_at),
    ))
    .orderBy(desc(menoa_symptom_logs.log_date), menoa_symptom_logs.created_at);
}

// ── 날짜별 기록 조회 ──────────────────────────────────
export async function getSymptomLogsByDate(date: string) {
  const parsed = singleDateSchema.safeParse({ date });
  if (!parsed.success) return [];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return db
    .select({
      id: menoa_symptom_logs.id,
      symptom_id: menoa_symptom_logs.symptom_id,
      severity: menoa_symptom_logs.severity,
      note: menoa_symptom_logs.note,
      symptom_name: menoa_symptoms.name,
      category_id: menoa_symptoms.category_id,
    })
    .from(menoa_symptom_logs)
    .innerJoin(menoa_symptoms, eq(menoa_symptom_logs.symptom_id, menoa_symptoms.id))
    .where(and(
      eq(menoa_symptom_logs.author_supabase_id, user.id),
      eq(menoa_symptom_logs.log_date, parsed.data.date),
      isNull(menoa_symptom_logs.deleted_at),
    ))
    .orderBy(menoa_symptom_logs.created_at);
}

// ── 최근 N일 기록 요약 ────────────────────────────────
export async function getRecentSymptomSummary(days = 7) {
  const parsed = recentDaysSchema.safeParse({ days });
  if (!parsed.success) return [];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const from = new Date();
  from.setDate(from.getDate() - parsed.data.days + 1);
  const fromStr = from.toISOString().split('T')[0];
  const toStr = new Date().toISOString().split('T')[0];

  return db
    .select({
      log_date: menoa_symptom_logs.log_date,
      count: sql<number>`count(*)`,
      max_severity: sql<number>`max(${menoa_symptom_logs.severity})`,
    })
    .from(menoa_symptom_logs)
    .where(and(
      eq(menoa_symptom_logs.author_supabase_id, user.id),
      gte(menoa_symptom_logs.log_date, fromStr),
      lte(menoa_symptom_logs.log_date, toStr),
      isNull(menoa_symptom_logs.deleted_at),
    ))
    .groupBy(menoa_symptom_logs.log_date)
    .orderBy(desc(menoa_symptom_logs.log_date));
}

// ── 증상 기록 저장 (upsert) ───────────────────────────
export async function logSymptom(formData: FormData): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select({ id: menoa_users.id, plan: menoa_users.plan, pro_expires_at: menoa_users.pro_expires_at })
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);
  if (!dbUser) redirect('/login');

  const parsed = logSymptomSchema.safeParse({
    symptom_id: formData.get('symptom_id'),
    severity: formData.get('severity'),
    note: (formData.get('note') as string)?.trim() || undefined,
    log_date: formData.get('log_date') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? '입력값이 올바르지 않습니다.' };
  }

  const { symptom_id, severity, note = null, log_date = new Date().toISOString().split('T')[0] } = parsed.data;

  // 이미 오늘 이 증상 기록했는지 확인
  const [existing] = await db
    .select({ id: menoa_symptom_logs.id })
    .from(menoa_symptom_logs)
    .where(and(
      eq(menoa_symptom_logs.author_supabase_id, user.id),
      eq(menoa_symptom_logs.symptom_id, symptom_id),
      eq(menoa_symptom_logs.log_date, log_date),
      isNull(menoa_symptom_logs.deleted_at),
    ))
    .limit(1);

  if (existing) {
    // 수정
    await db
      .update(menoa_symptom_logs)
      .set({ severity, note, updated_at: new Date() })
      .where(eq(menoa_symptom_logs.id, existing.id));
  } else {
    // 플랜 제한: 선택한 증상의 sort_order가 플랜 허용 범위 내인지 확인
    const plan = isProPlan(dbUser.plan, dbUser.pro_expires_at) ? 'pro' : 'free' as 'free' | 'pro';
    const limit = PLAN_LIMITS[plan].symptoms;

    const [symptomRow] = await db
      .select({ sort_order: menoa_symptoms.sort_order })
      .from(menoa_symptoms)
      .where(eq(menoa_symptoms.id, symptom_id))
      .limit(1);

    if (symptomRow && symptomRow.sort_order > limit) {
      return {
        error: `Free 플랜은 기본 ${limit}가지 증상만 기록할 수 있습니다. Pro로 업그레이드하면 30개+ 증상을 추적할 수 있어요.`,
      };
    }

    await db.insert(menoa_symptom_logs).values({
      author_id: dbUser.id,
      author_supabase_id: user.id,
      symptom_id,
      log_date,
      severity,
      note,
    });
  }

  revalidatePath('/symptoms');
  revalidatePath('/dashboard');
}

// ── 증상 기록 삭제 ────────────────────────────────────
export async function deleteSymptomLog(id: string): Promise<{ error: string } | void> {
  const parsed = deleteSymptomLogSchema.safeParse({ id });
  if (!parsed.success) return { error: '입력값이 올바르지 않습니다.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  await db
    .update(menoa_symptom_logs)
    .set({ deleted_at: new Date() })
    .where(and(
      eq(menoa_symptom_logs.id, parsed.data.id),
      eq(menoa_symptom_logs.author_supabase_id, user.id),
    ));

  revalidatePath('/symptoms');
  revalidatePath('/dashboard');
}
