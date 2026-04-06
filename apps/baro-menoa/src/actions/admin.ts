'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function changeUserPlan(userId: string, plan: 'free' | 'pro') {
  await assertAdmin();

  await db
    .update(menoa_users)
    .set({
      plan,
      updated_at: new Date(),
    })
    .where(eq(menoa_users.id, userId));

  revalidatePath('/admin');
}
