import { NextResponse } from 'next/server';

export async function GET() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.NAVER_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/naver/callback`,
    state: crypto.randomUUID(),
  });
  return NextResponse.redirect(`https://nid.naver.com/oauth2.0/authorize?${params.toString()}`);
}
