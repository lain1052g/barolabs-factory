'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { isAdmin } from '@/lib/admin';
import { eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const changeUserPlanSchema = z.object({
  userId: z.string().uuid('유효하지 않은 사용자 ID입니다.'),
  plan: z.enum(['free', 'pro']),
});

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function grantProToAll(expiresAt: Date): Promise<{ error: string } | { count: number }> {
  await assertAdmin();

  const result = await db
    .update(menoa_users)
    .set({
      pro_expires_at: expiresAt,
      updated_at: new Date(),
    })
    .where(ne(menoa_users.plan, 'pro'))
    .returning({ id: menoa_users.id });

  revalidatePath('/admin');
  return { count: result.length };
}

export async function changeUserPlan(userId: string, plan: 'free' | 'pro'): Promise<{ error: string } | void> {
  const parsed = changeUserPlanSchema.safeParse({ userId, plan });
  if (!parsed.success) return { error: '입력값이 올바르지 않습니다.' };

  await assertAdmin();

  await db
    .update(menoa_users)
    .set({
      plan: parsed.data.plan,
      updated_at: new Date(),
    })
    .where(eq(menoa_users.id, parsed.data.userId));

  revalidatePath('/admin');
}
