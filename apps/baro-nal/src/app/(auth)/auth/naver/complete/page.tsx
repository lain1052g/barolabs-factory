'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NaverComplete() {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    async function handleSession() {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (!error) {
          router.replace('/dashboard');
          return;
        }
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
        return;
      }
      router.replace('/login?error=naver_failed');
    }
    handleSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-500">네이버 로그인 중...</p>
    </div>
  );
}
