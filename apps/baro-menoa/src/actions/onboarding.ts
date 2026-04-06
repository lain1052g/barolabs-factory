'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const onboardingSchema = z.object({
  menopause_stage: z.enum(['pre', 'peri', 'post']),
  last_period_date: z.string().optional(),
});

export async function saveOnboarding(
  _prev: null | { error: string },
  formData: FormData
): Promise<null | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const parsed = onboardingSchema.safeParse({
    menopause_stage: formData.get('menopause_stage'),
    last_period_date: formData.get('last_period_date') || undefined,
  });
  if (!parsed.success) return { error: '입력값을 확인해주세요.' };

  await db
    .update(menoa_users)
    .set({
      menopause_stage: parsed.data.menopause_stage,
      last_period_date: parsed.data.last_period_date ?? null,
      updated_at: new Date(),
    })
    .where(eq(menoa_users.supabase_id, user.id));

  redirect('/dashboard');
}
