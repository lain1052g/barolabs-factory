'use server';

import { db } from '@/db';
import { menoa_mood_logs, menoa_users } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type MoodFormData = {
  mood_score: number;
  mood_emoji: string;
  note?: string;
  log_date: string;
};

export async function saveMoodLog(
  data: MoodFormData,
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

  const { mood_score, mood_emoji, note, log_date } = data;

  if (!log_date) return { error: '날짜가 올바르지 않습니다.' };
  if (mood_score < 1 || mood_score > 5)
    return { error: '기분 점수는 1~5 사이여야 합니다.' };

  const [existing] = await db
    .select({ id: menoa_mood_logs.id })
    .from(menoa_mood_logs)
    .where(
      and(
        eq(menoa_mood_logs.author_supabase_id, user.id),
        eq(menoa_mood_logs.log_date, log_date),
        isNull(menoa_mood_logs.deleted_at),
      ),
    )
    .limit(1);

  const values = {
    mood_score,
    mood_emoji,
    note: note?.trim() || null,
    updated_at: new Date(),
  };

  if (existing) {
    await db
      .update(menoa_mood_logs)
      .set(values)
      .where(eq(menoa_mood_logs.id, existing.id));
  } else {
    await db.insert(menoa_mood_logs).values({
      author_id: dbUser.id,
      author_supabase_id: user.id,
      log_date,
      ...values,
    });
  }

  revalidatePath('/mood');
  revalidatePath('/dashboard');
}

export async function getMoodLogByDate(date: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [row] = await db
    .select()
    .from(menoa_mood_logs)
    .where(
      and(
        eq(menoa_mood_logs.author_supabase_id, user.id),
        eq(menoa_mood_logs.log_date, date),
        isNull(menoa_mood_logs.deleted_at),
      ),
    )
    .limit(1);

  return row ?? null;
}
