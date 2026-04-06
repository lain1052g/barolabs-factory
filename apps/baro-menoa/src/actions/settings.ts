'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function setPlan(plan: 'free' | 'pro') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  if (user.email !== process.env.ADMIN_EMAIL) return;

  await db.update(menoa_users)
    .set({ plan, updated_at: new Date() })
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

  const name = (formData.get('name') as string)?.trim();
  const birth_year_raw = formData.get('birth_year') as string;
  const menopause_stage = formData.get('menopause_stage') as string;
  const last_period_date = (formData.get('last_period_date') as string)?.trim() || null;

  // 유효성 검사
  if (!name || name.length < 1) {
    return { error: '이름을 입력해주세요.' };
  }
  if (name.length > 50) {
    return { error: '이름은 50자 이하로 입력해주세요.' };
  }

  const birth_year = birth_year_raw ? parseInt(birth_year_raw, 10) : null;
  if (birth_year !== null) {
    const currentYear = new Date().getFullYear();
    if (isNaN(birth_year) || birth_year < 1930 || birth_year > currentYear - 30) {
      return { error: '올바른 출생연도를 입력해주세요.' };
    }
  }

  const validStages = ['pre', 'peri', 'post'];
  const stage = validStages.includes(menopause_stage)
    ? (menopause_stage as 'pre' | 'peri' | 'post')
    : null;

  // 날짜 형식 검증
  if (last_period_date && !/^\d{4}-\d{2}-\d{2}$/.test(last_period_date)) {
    return { error: '마지막 생리일 형식이 올바르지 않습니다.' };
  }

  await db.update(menoa_users)
    .set({
      name,
      birth_year,
      menopause_stage: stage,
      last_period_date: last_period_date ?? undefined,
      updated_at: new Date(),
    })
    .where(eq(menoa_users.supabase_id, user.id));

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { success: true };
}
