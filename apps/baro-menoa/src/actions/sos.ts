'use server';

import { db } from '@/db';
import { menoa_sos_logs, menoa_users } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const recordSosUsageSchema = z.object({
  symptomType: z.string().min(1, '증상 유형을 입력해주세요.').max(100),
  contentShown: z.string().min(1, '표시된 콘텐츠 정보가 올바르지 않습니다.').max(500),
});

export async function getSosHistory() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const rows = await db
    .select({
      triggered_at: menoa_sos_logs.triggered_at,
      symptom_type: menoa_sos_logs.symptom_type,
      duration_seconds: menoa_sos_logs.duration_seconds,
    })
    .from(menoa_sos_logs)
    .where(eq(menoa_sos_logs.author_supabase_id, user.id))
    .orderBy(desc(menoa_sos_logs.triggered_at))
    .limit(20);

  return rows;
}

export async function recordSosUsage(symptomType: string, contentShown: string): Promise<{ error: string } | void> {
  const parsed = recordSosUsageSchema.safeParse({ symptomType, contentShown });
  if (!parsed.success) return { error: '입력값이 올바르지 않습니다.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select({ id: menoa_users.id })
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);
  if (!dbUser) return;

  await db.insert(menoa_sos_logs).values({
    author_id: dbUser.id,
    author_supabase_id: user.id,
    symptom_type: parsed.data.symptomType,
    content_shown: parsed.data.contentShown,
  });
}
