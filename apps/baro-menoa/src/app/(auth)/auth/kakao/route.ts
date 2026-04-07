import { NextResponse } from 'next/server';

// 카카오 개발자 콘솔에서 Redirect URI 등록 필요:
// https://developers.kakao.com/console/app → 앱 선택 → 카카오 로그인 → Redirect URI
// 추가할 URI: ${NEXT_PUBLIC_APP_URL}/auth/kakao/callback

export async function GET() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.KAKAO_REST_API_KEY!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/kakao/callback`,
    scope: 'profile_nickname account_email',
  });
  return NextResponse.redirect(
    `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
  );
}
