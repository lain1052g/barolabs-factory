'use server';

import { db } from '@/db';
import { menoa_sos_logs, menoa_users } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function recordSosUsage(symptomType: string, contentShown: string): Promise<void> {
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
    symptom_type: symptomType,
    content_shown: contentShown,
  });
}
