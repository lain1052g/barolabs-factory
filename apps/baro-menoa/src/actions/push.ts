'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { menoa_users, menoa_push_tokens } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getAdminMessaging } from '@/lib/firebase/admin';

export async function savePushToken(token: string, platform: 'web' | 'android' | 'ios' = 'web') {
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
    .values({ user_id: dbUser.id, token, platform })
    .onConflictDoUpdate({
      target: menoa_push_tokens.token,
      set: { user_id: dbUser.id, platform, updated_at: new Date() },
    });
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  url = '/dashboard'
) {
  const tokens = await db
    .select({ token: menoa_push_tokens.token })
    .from(menoa_push_tokens)
    .innerJoin(menoa_users, eq(menoa_push_tokens.user_id, menoa_users.id))
    .where(eq(menoa_users.supabase_id, userId));

  if (tokens.length === 0) return;

  const messaging = getAdminMessaging();
  await Promise.allSettled(
    tokens.map(({ token }) =>
      messaging.send({
        token,
        notification: { title, body },
        data: { url },
        webpush: { fcmOptions: { link: url } },
      })
    )
  );
}
