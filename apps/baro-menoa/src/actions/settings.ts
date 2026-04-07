'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { isAdmin } from '@/lib/admin';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const setPlanSchema = z.object({
  plan: z.enum(['free', 'pro']),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.').max(50, '이름은 50자 이하로 입력해주세요.'),
  birth_year: z.coerce
    .number()
    .int()
    .min(1930, '올바른 출생연도를 입력해주세요.')
    .max(new Date().getFullYear() - 30, '올바른 출생연도를 입력해주세요.')
    .nullable()
    .optional(),
  menopause_stage: z.enum(['pre', 'peri', 'post']).nullable().optional(),
  last_period_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '마지막 생리일 형식이 올바르지 않습니다.')
    .nullable()
    .optional(),
});

const updateNotificationHourSchema = z.object({
  hour: z.number().int().min(0, '올바른 시간(0~23)을 선택해주세요.').max(23, '올바른 시간(0~23)을 선택해주세요.'),
});

export async function setPlan(plan: 'free' | 'pro') {
  const parsed = setPlanSchema.safeParse({ plan });
  if (!parsed.success) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  if (!isAdmin(user.email)) return;

  await db.update(menoa_users)
    .set({ plan: parsed.data.plan, updated_at: new Date() })
    .where(eq(menoa_users.supabase_id, user.id));
}

export type UpdateProfileState = { success?: boolean; error?: string } | null;

export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const rawBirthYear = formData.get('birth_year') as string;
  const rawMenopauseStage = formData.get('menopause_stage') as string;
  const rawLastPeriodDate = (formData.get('last_period_date') as string)?.trim() || null;

  const parsed = updateProfileSchema.safeParse({
    name: (formData.get('name') as string)?.trim(),
    birth_year: rawBirthYear ? rawBirthYear : undefined,
    menopause_stage: rawMenopauseStage || undefined,
    last_period_date: rawLastPeriodDate || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? '입력값이 올바르지 않습니다.' };
  }

  const { name, birth_year = null, menopause_stage = null, last_period_date = null } = parsed.data;

  await db.update(menoa_users)
    .set({
      name,
      birth_year: birth_year ?? null,
      menopause_stage: menopause_stage ?? null,
      last_period_date: last_period_date ?? undefined,
      updated_at: new Date(),
    })
    .where(eq(menoa_users.supabase_id, user.id));

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateEmailMarketing(agreed: boolean): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  await db.update(menoa_users)
    .set({ email_marketing_agreed: agreed, updated_at: new Date() })
    .where(eq(menoa_users.supabase_id, user.id));

  revalidatePath('/settings');
  return { success: true };
}

export async function updateNotificationHour(hour: number): Promise<{ success?: boolean; error?: string }> {
  const parsed = updateNotificationHourSchema.safeParse({ hour });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? '입력값이 올바르지 않습니다.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  await db.update(menoa_users)
    .set({ notification_hour: parsed.data.hour, updated_at: new Date() })
    .where(eq(menoa_users.supabase_id, user.id));

  revalidatePath('/settings');
  return { success: true };
}
