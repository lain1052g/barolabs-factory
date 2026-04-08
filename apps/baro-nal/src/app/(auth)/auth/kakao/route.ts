import { NextResponse } from 'next/server';

export async function GET() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.KAKAO_REST_API_KEY!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/kakao/callback`,
    scope: 'profile_nickname account_email',
  });
  return NextResponse.redirect(`https://kauth.kakao.com/oauth/authorize?${params.toString()}`);
}
