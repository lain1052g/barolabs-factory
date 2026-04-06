'use server';

import { db } from '@/db';
import { menoa_trigger_logs, menoa_users } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
  } = data;

  if (!log_date) return { error: '날짜가 올바르지 않습니다.' };

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

export async function getTriggerLogByDate(date: string) {
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
        eq(menoa_trigger_logs.log_date, date),
        isNull(menoa_trigger_logs.deleted_at),
      ),
    )
    .limit(1);

  return row ?? null;
}
