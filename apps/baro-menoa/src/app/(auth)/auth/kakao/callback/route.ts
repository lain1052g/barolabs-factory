import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.redirect(`${origin}/login?error=kakao_failed`);

  try {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_REST_API_KEY!,
        client_secret: process.env.KAKAO_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/kakao/callback`,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token)
      return NextResponse.redirect(`${origin}/login?error=kakao_failed`);

    const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const kakao = await profileRes.json();
    const email = kakao?.kakao_account?.email;
    const name = kakao?.kakao_account?.profile?.nickname ?? null;

    if (!email)
      return NextResponse.redirect(`${origin}/login?error=kakao_no_email`);

    const admin = createServiceRoleClient();

    const [existing] = await db
      .select({ supabase_id: menoa_users.supabase_id })
      .from(menoa_users)
      .where(eq(menoa_users.email, email))
      .limit(1);

    let supabaseUserId: string;
    if (existing) {
      supabaseUserId = existing.supabase_id;
      await admin.auth.admin.updateUserById(supabaseUserId, {
        user_metadata: { full_name: name },
      });
    } else {
      const { data: newUser, error } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: name },
      });
      if (error || !newUser?.user)
        return NextResponse.redirect(`${origin}/login?error=kakao_failed`);
      supabaseUserId = newUser.user.id;
    }

    await db.insert(menoa_users)
      .values({ supabase_id: supabaseUserId, email, name, pro_expires_at: new Date('2026-12-31T23:59:59Z') })
      .onConflictDoUpdate({
        target: menoa_users.supabase_id,
        set: { email, name, updated_at: new Date() },
      });

    const { data: linkData } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${origin}/auth/kakao/complete` },
    });
    const actionLink = linkData?.properties?.action_link;
    if (!actionLink)
      return NextResponse.redirect(`${origin}/login?error=kakao_failed`);

    return NextResponse.redirect(actionLink);
  } catch (err) {
    console.error('[Kakao OAuth]', err);
    return NextResponse.redirect(`${origin}/login?error=kakao_failed`);
  }
}
