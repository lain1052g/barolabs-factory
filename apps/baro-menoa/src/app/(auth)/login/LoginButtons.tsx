'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';

// Google 버튼 — form 안에서 useFormStatus 사용
export function GoogleButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
    >
      {pending ? (
        <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )}
      {pending ? '로그인 중...' : 'Google로 시작하기'}
    </button>
  );
}

// Kakao / Naver — <a> 대신 클릭 시 loading 상태 표시
function SocialButton({
  href, bgColor, textColor, borderColor, label, icon,
}: {
  href: string;
  bgColor: string;
  textColor: string;
  borderColor?: string;
  label: string;
  icon: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <a
      href={loading ? undefined : href}
      onClick={() => setLoading(true)}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-opacity cursor-pointer"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        border: borderColor ? `1px solid ${borderColor}` : undefined,
        opacity: loading ? 0.7 : 1,
        pointerEvents: loading ? 'none' : 'auto',
      }}
      aria-disabled={loading}
    >
      {loading ? (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color: textColor }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : icon}
      {loading ? '로그인 중...' : label}
    </a>
  );
}

export function KakaoButton() {
  return (
    <SocialButton
      href="/auth/kakao"
      bgColor="#FEE500"
      textColor="#191919"
      label="카카오로 시작하기"
      icon={
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919" aria-hidden="true">
          <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.628 1.607 4.937 4.037 6.31-.168.615-.606 2.22-.695 2.565-.109.432.159.426.333.31.137-.09 2.173-1.473 3.052-2.076.41.057.83.087 1.273.087 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
        </svg>
      }
    />
  );
}

export function NaverButton() {
  return (
    <SocialButton
      href="/auth/naver"
      bgColor="#03C75A"
      textColor="white"
      label="네이버로 시작하기"
      icon={
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
        </svg>
      }
    />
  );
}
