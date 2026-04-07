'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`,
    },
  });
  if (data.url) redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  try {
    await supabase.auth.signOut();
  } catch {
    // 세션이 이미 없거나 네트워크 오류가 나도 로그인 페이지로 이동
  }
  redirect('/login');
}

export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // menoa_users 삭제 → CASCADE로 연결된 모든 데이터 삭제
  await db.delete(menoa_users).where(eq(menoa_users.supabase_id, user.id));

  // 세션 종료
  await supabase.auth.signOut();

  revalidatePath('/');
  redirect('/login');
}
