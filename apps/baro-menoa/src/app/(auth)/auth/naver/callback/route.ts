import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.redirect(`${origin}/login?error=naver_failed`);

  try {
    const tokenRes = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NAVER_CLIENT_ID!,
        client_secret: process.env.NAVER_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/naver/callback`,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token)
      return NextResponse.redirect(`${origin}/login?error=naver_failed`);

    const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const { response: naver } = await profileRes.json();
    if (!naver?.email)
      return NextResponse.redirect(`${origin}/login?error=naver_no_email`);

    const { email, name = null } = naver;
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
        return NextResponse.redirect(`${origin}/login?error=naver_failed`);
      supabaseUserId = newUser.user.id;
    }

    await db.insert(menoa_users)
      .values({ supabase_id: supabaseUserId, email, name })
      .onConflictDoUpdate({
        target: menoa_users.supabase_id,
        set: { email, name, updated_at: new Date() },
      });

    const { data: linkData } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${origin}/auth/naver/complete` },
    });
    const actionLink = linkData?.properties?.action_link;
    if (!actionLink)
      return NextResponse.redirect(`${origin}/login?error=naver_failed`);

    return NextResponse.redirect(actionLink);
  } catch (err) {
    console.error('[Naver OAuth]', err);
    return NextResponse.redirect(`${origin}/login?error=naver_failed`);
  }
}
