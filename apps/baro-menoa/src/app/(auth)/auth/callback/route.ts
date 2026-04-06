import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const [existing] = await db
        .select({ menopause_stage: menoa_users.menopause_stage })
        .from(menoa_users)
        .where(eq(menoa_users.supabase_id, data.user.id))
        .limit(1);

      await db.insert(menoa_users)
        .values({
          supabase_id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.full_name ?? null,
        })
        .onConflictDoUpdate({
          target: menoa_users.supabase_id,
          set: {
            email: data.user.email!,
            name: data.user.user_metadata?.full_name ?? null,
            updated_at: new Date(),
          },
        });

      // 신규 유저 or 온보딩 미완료 → 온보딩으로
      const isNewUser = !existing || !existing.menopause_stage;
      const destination = isNewUser ? '/onboarding' : next;
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback_failed`);
}
