'use server';

import { db } from '@/db';
import { menoa_mood_logs, menoa_users } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, isNull, desc, gte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const saveMoodLogSchema = z.object({
  mood_score: z.number().int().min(1, '기분 점수는 1~5 사이여야 합니다.').max(5, '기분 점수는 1~5 사이여야 합니다.'),
  mood_emoji: z.string().min(1, '기분 이모지를 선택해주세요.').max(10),
  note: z.string().max(500).optional(),
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜가 올바르지 않습니다.'),
});

const getMoodHistorySchema = z.object({
  days: z.number().int().min(1).max(365),
});

const getMoodLogByDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다.'),
});

export type MoodFormData = {
  mood_score: number;
  mood_emoji: string;
  note?: string;
  log_date: string;
};

export async function saveMoodLog(
  data: MoodFormData,
): Promise<{ error: string } | void> {
  const parsed = saveMoodLogSchema.safeParse(data);
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

  const { mood_score, mood_emoji, note, log_date } = parsed.data;

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

export async function getMoodHistory(days: number) {
  const parsed = getMoodHistorySchema.safeParse({ days });
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
      log_date: menoa_mood_logs.log_date,
      mood_emoji: menoa_mood_logs.mood_emoji,
      mood_score: menoa_mood_logs.mood_score,
      note: menoa_mood_logs.note,
    })
    .from(menoa_mood_logs)
    .where(
      and(
        eq(menoa_mood_logs.author_supabase_id, user.id),
        gte(menoa_mood_logs.log_date, from),
        isNull(menoa_mood_logs.deleted_at),
      ),
    )
    .orderBy(desc(menoa_mood_logs.log_date));

  return rows;
}

export async function getMoodLogByDate(date: string) {
  const parsed = getMoodLogByDateSchema.safeParse({ date });
  if (!parsed.success) return null;

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
        eq(menoa_mood_logs.log_date, parsed.data.date),
        isNull(menoa_mood_logs.deleted_at),
      ),
    )
    .limit(1);

  return row ?? null;
}
