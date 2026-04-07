import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { signInWithGoogle } from '@/actions/auth';
import { GoogleButton, KakaoButton, NaverButton } from './LoginButtons';

export const metadata: Metadata = {
  title: '로그인 | 메노아',
  description: '메노아에 로그인하여 갱년기 증상을 스마트하게 관리하세요.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: 'var(--c-brand-subtle)' }}>
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm space-y-4">
        <div className="text-center mb-6">
          <Image
            src="/br-s15-menoa.svg"
            alt="메노아"
            width={72}
            height={72}
            className="mx-auto mb-3"
            priority
          />
          <h1 className="text-xl font-bold" style={{ color: 'var(--c-brand)' }}>메노아</h1>
          <p className="text-sm text-gray-500 mt-0.5">갱년기 건강 파트너</p>
        </div>

        {/* Google */}
        <form action={signInWithGoogle}>
          <GoogleButton />
        </form>

        {/* Kakao */}
        <KakaoButton />

        {/* Naver */}
        <NaverButton />
      </div>

      <p className="text-xs text-gray-400 text-center">
        가입 시{' '}
        <Link href="/terms" className="underline hover:text-gray-600 transition-colors">이용약관</Link>{' '}
        및{' '}
        <Link href="/privacy" className="underline hover:text-gray-600 transition-colors">개인정보처리방침</Link>
        에 동의합니다.
      </p>
    </div>
  );
}
