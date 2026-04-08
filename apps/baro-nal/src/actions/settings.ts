'use server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { br045_nal_users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function setPlan(plan: 'free' | 'pro') {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const adminEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? '').split(',');
  if (!adminEmails.includes(user.email ?? '')) return;

  await db
    .update(br045_nal_users)
    .set({ plan, updated_at: new Date() })
    .where(eq(br045_nal_users.supabase_id, user.id));
}
