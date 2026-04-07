'use server';

import { db } from '@/db';
import { menoa_trigger_logs, menoa_users } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, isNull, desc, gte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const saveTriggerLogSchema = z.object({
  caffeine_cups: z.number().int().min(0, '카페인 섭취량이 올바르지 않습니다.').max(50),
  alcohol_units: z.number().int().min(0, '음주량이 올바르지 않습니다.').max(50),
  sleep_minutes: z.number().int().min(0, '수면 시간이 올바르지 않습니다.').max(1440),
  stress_level: z.number().int().min(1).max(5).nullable(),
  exercise_minutes: z.number().int().min(0, '운동 시간이 올바르지 않습니다.').max(1440),
  note: z.string().max(500).optional(),
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜가 올바르지 않습니다.'),
});

const getTriggerHistorySchema = z.object({
  days: z.number().int().min(1).max(365),
});

const getTriggerLogByDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다.'),
});

export type TriggerFormData = {
  caffeine_cups: number;
  alcohol_units: number;
  sleep_minutes: number;
  stress_level: number | null;
  exercise_minutes: number;
  note?: string;
  log_date: string;
};

export async function saveTriggerLog(
  data: TriggerFormData,
): Promise<{ error: string } | void> {
  const parsed = saveTriggerLogSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? '입력값이 올바르지 않습니다.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select({ id: menoa_users.id })
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);
  if (!dbUser) redirect('/login');

  const {
    caffeine_cups,
    alcohol_units,
    sleep_minutes,
    stress_level,
    exercise_minutes,
    note,
    log_date,
  } = parsed.data;

  // 해당 날짜에 기록이 이미 있는지 확인
  const [existing] = await db
    .select({ id: menoa_trigger_logs.id })
    .from(menoa_trigger_logs)
    .where(
      and(
        eq(menoa_trigger_logs.author_supabase_id, user.id),
        eq(menoa_trigger_logs.log_date, log_date),
        isNull(menoa_trigger_logs.deleted_at),
      ),
    )
    .limit(1);

  const values = {
    caffeine_cups,
    alcohol_units,
    sleep_minutes,
    stress_level: stress_level ?? null,
    exercise_minutes,
    note: note?.trim() || null,
    updated_at: new Date(),
  };

  if (existing) {
    await db
      .update(menoa_trigger_logs)
      .set(values)
      .where(eq(menoa_trigger_logs.id, existing.id));
  } else {
    await db.insert(menoa_trigger_logs).values({
      author_id: dbUser.id,
      author_supabase_id: user.id,
      log_date,
      ...values,
    });
  }

  revalidatePath('/triggers');
  revalidatePath('/dashboard');
}

export async function getTriggerHistory(days: number) {
  const parsed = getTriggerHistorySchema.safeParse({ days });
  if (!parsed.success) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - (parsed.data.days - 1));
  const from = fromDate.toISOString().split('T')[0];

  const rows = await db
    .select({
      log_date: menoa_trigger_logs.log_date,
      caffeine_cups: menoa_trigger_logs.caffeine_cups,
      alcohol_units: menoa_trigger_logs.alcohol_units,
      stress_level: menoa_trigger_logs.stress_level,
      sleep_minutes: menoa_trigger_logs.sleep_minutes,
      exercise_minutes: menoa_trigger_logs.exercise_minutes,
      note: menoa_trigger_logs.note,
    })
    .from(menoa_trigger_logs)
    .where(
      and(
        eq(menoa_trigger_logs.author_supabase_id, user.id),
        gte(menoa_trigger_logs.log_date, from),
        isNull(menoa_trigger_logs.deleted_at),
      ),
    )
    .orderBy(desc(menoa_trigger_logs.log_date));

  return rows;
}

export async function getTriggerLogByDate(date: string) {
  const parsed = getTriggerLogByDateSchema.safeParse({ date });
  if (!parsed.success) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [row] = await db
    .select()
    .from(menoa_trigger_logs)
    .where(
      and(
        eq(menoa_trigger_logs.author_supabase_id, user.id),
        eq(menoa_trigger_logs.log_date, parsed.data.date),
        isNull(menoa_trigger_logs.deleted_at),
      ),
    )
    .limit(1);

  return row ?? null;
}
