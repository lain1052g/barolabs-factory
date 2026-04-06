'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function setPlan(plan: 'free' | 'pro') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  if (user.email !== process.env.ADMIN_EMAIL) return;

  await db.update(menoa_users)
    .set({ plan, updated_at: new Date() })
    .where(eq(menoa_users.supabase_id, user.id));
}
