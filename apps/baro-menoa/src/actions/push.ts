'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { menoa_users, menoa_push_tokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getAdminMessaging } from '@/lib/firebase/admin';
import { z } from 'zod';

const savePushTokenSchema = z.object({
  token: z.string().min(1, '푸시 토큰이 올바르지 않습니다.'),
  platform: z.enum(['web', 'android', 'ios']).default('web'),
});

const sendPushNotificationSchema = z.object({
  userId: z.string().min(1, '유효하지 않은 사용자 ID입니다.'),
  title: z.string().min(1, '알림 제목을 입력해주세요.').max(200),
  body: z.string().min(1, '알림 내용을 입력해주세요.').max(500),
  url: z.string().min(1).default('/dashboard'),
});

export async function savePushToken(token: string, platform: 'web' | 'android' | 'ios' = 'web'): Promise<{ error: string } | void> {
  const parsed = savePushTokenSchema.safeParse({ token, platform });
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

  await db
    .insert(menoa_push_tokens)
    .values({ author_id: dbUser.id, author_supabase_id: user.id, token: parsed.data.token, platform: parsed.data.platform })
    .onConflictDoUpdate({
      target: menoa_push_tokens.token,
      set: { author_id: dbUser.id, author_supabase_id: user.id, platform: parsed.data.platform, updated_at: new Date() },
    });
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  url = '/dashboard'
): Promise<{ error: string } | void> {
  const parsed = sendPushNotificationSchema.safeParse({ userId, title, body, url });
  if (!parsed.success) return { error: '입력값이 올바르지 않습니다.' };

  const tokens = await db
    .select({ token: menoa_push_tokens.token })
    .from(menoa_push_tokens)
    .where(eq(menoa_push_tokens.author_supabase_id, parsed.data.userId));

  if (tokens.length === 0) return;

  const messaging = getAdminMessaging();
  await Promise.allSettled(
    tokens.map(({ token }) =>
      messaging.send({
        token,
        notification: { title: parsed.data.title, body: parsed.data.body },
        data: { url: parsed.data.url },
        webpush: { fcmOptions: { link: parsed.data.url } },
      })
    )
  );
}
