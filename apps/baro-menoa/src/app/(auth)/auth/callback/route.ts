import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
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

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback_failed`);
}
