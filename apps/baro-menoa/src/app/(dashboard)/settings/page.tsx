import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { signOut } from '@/actions/auth';
import { PushPermissionButton } from '@/components/PushPermissionButton';
import { ProfileForm } from './ProfileForm';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db.select()
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);

  const plan = dbUser?.plan ?? 'free';
  const isPro = plan === 'pro';

  return (
    <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold text-gray-800">설정</h1>

      {/* 프로필 아바타 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
          style={{ backgroundColor: '#800020' }}
        >
          {(dbUser?.name ?? user.user_metadata?.full_name ?? user.email ?? '?')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">
            {dbUser?.name ?? user.user_metadata?.full_name ?? '이름 없음'}
          </p>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
          style={{
            backgroundColor: isPro ? '#800020' : '#f3f4f6',
            color: isPro ? 'white' : '#6b7280',
          }}
        >
          {isPro ? 'Pro' : 'Free'}
        </span>
      </div>

      {/* 프로필 편집 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-800">프로필 편집</h2>
        <ProfileForm
          name={dbUser?.name ?? null}
          birth_year={dbUser?.birth_year ?? null}
          menopause_stage={dbUser?.menopause_stage ?? null}
          last_period_date={dbUser?.last_period_date ?? null}
        />
      </div>

      {/* 플랜 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">현재 플랜</h2>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: isPro ? '#800020' : '#f3f4f6',
              color: isPro ? 'white' : '#6b7280',
            }}
          >
            {isPro ? 'Pro' : 'Free'}
          </span>
        </div>

        {!isPro && (
          <div className="space-y-2">
            <div className="text-sm text-gray-500 space-y-1">
              <p>✓ 증상 10개 추적, 주간 차트, SOS</p>
              <p className="text-gray-300">✗ 트리거 분석, 감정 저널, PDF 리포트</p>
            </div>
            <button
              disabled
              className="w-full py-2.5 rounded-xl text-sm font-medium border-2 opacity-50 cursor-not-allowed"
              style={{ borderColor: '#800020', color: '#800020' }}
            >
              Pro 업그레이드 — 4,900원/월 (준비 중)
            </button>
          </div>
        )}

        {isPro && (
          <div className="text-sm text-gray-500 space-y-1">
            <p>✓ 증상 30개+ 추적</p>
            <p>✓ 트리거 분석, 감정 저널</p>
            <p>✓ PDF 리포트 무제한</p>
            <p>✓ 90일 차트, 전문가 콘텐츠</p>
          </div>
        )}
      </div>

      {/* 알림 설정 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="font-semibold text-gray-800">알림</h2>
        <PushPermissionButton />
      </div>

      {/* 앱 정보 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
        <h2 className="font-semibold text-gray-800">앱 정보</h2>
        <div className="text-sm text-gray-500 space-y-1">
          <p>버전 0.1.0</p>
          <p>meno(폐경) + a(again) — 갱년기 건강을 다시 찾아드립니다</p>
        </div>
        <div className="flex gap-4 pt-1">
          <a href="/terms" className="text-xs text-gray-400 hover:text-gray-600 underline">이용약관</a>
          <a href="/privacy" className="text-xs text-gray-400 hover:text-gray-600 underline">개인정보처리방침</a>
        </div>
      </div>

      {/* 위험 구역: 로그아웃 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="font-semibold text-gray-800">계정</h2>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full py-3 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: '#fca5a5', color: '#ef4444' }}
          >
            로그아웃
          </button>
        </form>
      </div>
    </div>
  );
}
