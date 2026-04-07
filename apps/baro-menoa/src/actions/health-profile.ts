'use server';

import { db } from '@/db';
import { menoa_health_profiles, menoa_users } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

type Section = 'conditions' | 'medical_history' | 'medications' | 'supplements';

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select({ id: menoa_users.id })
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);

  if (!dbUser) redirect('/login');
  return dbUser.id;
}

export async function getHealthProfile() {
  const userId = await getCurrentUserId();

  const [profile] = await db
    .select()
    .from(menoa_health_profiles)
    .where(eq(menoa_health_profiles.user_id, userId))
    .limit(1);

  return profile ?? null;
}

export async function saveHealthSection(
  section: Section,
  items: string[],
  isSmoker?: boolean,
) {
  const userId = await getCurrentUserId();

  const [existing] = await db
    .select({ id: menoa_health_profiles.id })
    .from(menoa_health_profiles)
    .where(eq(menoa_health_profiles.user_id, userId))
    .limit(1);

  const updateData: Partial<typeof menoa_health_profiles.$inferInsert> = {
    [section]: items,
    updated_at: new Date(),
  };
  if (isSmoker !== undefined) {
    updateData.is_smoker = isSmoker;
  }

  if (existing) {
    await db
      .update(menoa_health_profiles)
      .set(updateData)
      .where(eq(menoa_health_profiles.id, existing.id));
  } else {
    await db.insert(menoa_health_profiles).values({
      user_id: userId,
      [section]: items,
      is_smoker: isSmoker ?? false,
    });
  }

  revalidatePath('/health');
}
