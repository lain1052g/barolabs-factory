import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { signOut } from '@/actions/auth';
import { isProPlan } from '@/lib/plan';
import { isAdmin } from '@/lib/admin';
import { getStreakData } from '@/actions/streak';
import { getUnlockedBadges, getNextBadge, BADGES } from '@/lib/badges';
import { PushPermissionButton } from '@/components/PushPermissionButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileForm } from './ProfileForm';
import { DeleteAccountSection } from './DeleteAccountSection';
import { EmailMarketingToggle } from './EmailMarketingToggle';
import { PlanChangeButton } from '../admin/PlanChangeButton';

export const metadata: Metadata = {
  title: '설정 | 메노아',
  description: '프로필, 알림, 계정 설정을 관리하세요.',
};

export const revalidate = 0;

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db.select()
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);

  const isPro = isProPlan(dbUser?.plan ?? null, dbUser?.pro_expires_at ?? null);
  const showAdmin = isAdmin(user.email);
  const streak = await getStreakData();
  const unlockedBadges = getUnlockedBadges(streak.totalDays);
  const nextBadge = getNextBadge(streak.totalDays);

  return (
    <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">설정</h1>

      {/* 프로필 아바타 + 뱃지 통합 카드 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style={{ backgroundColor: 'var(--c-brand)' }}
          >
            {(dbUser?.name ?? user.user_metadata?.full_name ?? user.email ?? '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
              {dbUser?.name ?? user.user_metadata?.full_name ?? '이름 없음'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
            style={{
              backgroundColor: isPro ? 'var(--c-brand)' : '#f3f4f6',
              color: isPro ? 'white' : '#6b7280',
            }}
          >
            {isPro ? 'Pro' : 'Free'}
          </span>
        </div>

        {/* 뱃지 */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] text-gray-400 mb-2">획득한 뱃지 · 누적 {streak.totalDays}일 기록</p>
          <div className="flex items-center gap-3 flex-wrap">
            {BADGES.map(badge => {
              const unlocked = unlockedBadges.some(b => b.id === badge.id);
              return (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-0.5"
                  title={badge.label}
                >
                  <span
                    className="text-2xl"
                    style={{ filter: unlocked ? 'none' : 'grayscale(1)', opacity: unlocked ? 1 : 0.2 }}
                  >
                    {badge.emoji}
                  </span>
                  <span className="text-[9px] text-gray-400">{badge.label}</span>
                </div>
              );
            })}
          </div>
          {nextBadge && (
            <p className="text-[10px] text-gray-400 mt-2.5">
              다음 뱃지: {nextBadge.emoji} {nextBadge.label} — {nextBadge.unlockAt - streak.totalDays}일 남았어요
            </p>
          )}
        </div>
      </div>

      {/* 프로필 편집 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">프로필 편집</h2>
        <ProfileForm
          name={dbUser?.name ?? null}
          birth_year={dbUser?.birth_year ?? null}
          menopause_stage={dbUser?.menopause_stage ?? null}
          last_period_date={dbUser?.last_period_date ?? null}
        />
      </div>

      {/* 플랜 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">현재 플랜</h2>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: isPro ? 'var(--c-brand)' : '#f3f4f6',
              color: isPro ? 'white' : '#6b7280',
            }}
          >
            {isPro ? 'Pro' : 'Free'}
          </span>
        </div>

        {!isPro && (
          <div className="space-y-2">
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>✓ 증상 10개 추적, 주간 차트, SOS</p>
              <p className="text-gray-300 dark:text-gray-600">✗ 트리거 분석, 감정 저널, PDF 리포트</p>
            </div>
            <button
              disabled
              className="w-full py-2.5 rounded-xl text-sm font-medium border-2 opacity-50 cursor-not-allowed"
              style={{ borderColor: 'var(--c-brand)', color: 'var(--c-brand)' }}
            >
              Pro 업그레이드 — 4,900원/월 (준비 중)
            </button>
          </div>
        )}

        {isPro && (
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>✓ 증상 30개+ 추적</p>
            <p>✓ 트리거 분석, 감정 저널</p>
            <p>✓ PDF 리포트 무제한</p>
            <p>✓ 90일 차트, 전문가 콘텐츠</p>
          </div>
        )}
      </div>

      {/* 알림 설정 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-3">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">알림</h2>
        <PushPermissionButton />
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">이메일 수신</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">주간 건강 요약 이메일</p>
          </div>
          <EmailMarketingToggle defaultValue={dbUser?.email_marketing_agreed ?? false} />
        </div>
      </div>

      {/* 화면 설정 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-3">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">화면</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-200">다크 모드</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">☀️ 라이트 → 🌙 다크 → ⚙️ 시스템</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* 앱 정보 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-2">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">앱 정보</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>버전 0.1.0</p>
          <p>meno(폐경) + a(again) — 갱년기 건강을 다시 찾아드립니다</p>
        </div>
        <div className="flex gap-4 pt-1">
          <a href="/terms" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 underline">이용약관</a>
          <a href="/privacy" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 underline">개인정보처리방침</a>
        </div>
      </div>

      {/* 건강 프로필 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
        <Link
          href="/health"
          className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: 'var(--c-brand-subtle)' }}
            >
              🩺
            </span>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                건강 프로필
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                지병 · 병력 · 약물 · 영양제 입력 (선택)
              </p>
            </div>
          </div>
          <span className="text-gray-400">→</span>
        </Link>
      </div>

      {/* 진료 요약 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
        <Link
          href="/visit"
          className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
            <span className="text-xl flex-shrink-0">🩺</span>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                진료 요약
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                전문의에게 보여줄 내 증상 요약 보고서
              </p>
            </div>
            <svg className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </Link>
      </div>

      {/* 주간 리포트 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
        <Link
          href="/report"
          className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: 'var(--c-brand-subtle)' }}
            >
              📊
            </span>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                주간 리포트
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                이번 주 증상 요약 보기 · PDF 인쇄
              </p>
            </div>
          </div>
          <span className="text-gray-400">→</span>
        </Link>
      </div>

      {/* 약관 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
        <div className="px-5 pt-4 pb-2">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">약관</h2>
        </div>
        <div className="space-y-1 px-2 pb-2">
          <Link href="/terms" className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            이용약관 <span className="text-gray-400">→</span>
          </Link>
          <Link href="/privacy" className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            개인정보처리방침 <span className="text-gray-400">→</span>
          </Link>
        </div>
      </div>

      {/* 관리자 메뉴 — 관리자 계정에만 표시 */}
      {showAdmin && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none overflow-hidden border-2 border-dashed" style={{ borderColor: 'var(--c-brand)' }}>
          <div className="px-5 pt-4 pb-2 flex items-center gap-2">
            <span className="text-base">⚙️</span>
            <h2 className="font-semibold" style={{ color: 'var(--c-brand)' }}>관리자 메뉴</h2>
            <span className="text-xs text-gray-400 ml-auto">관리자 전용 · 본인에게만 표시</span>
          </div>
          <div className="space-y-px px-2 pb-2">
            {/* 대시보드 */}
            <Link href="/admin" className="flex items-center justify-between px-4 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <span>📊 관리자 대시보드 (통계 · 가입자 목록)</span>
              <span className="text-gray-400">→</span>
            </Link>
            {/* 콘텐츠 관리 */}
            <Link href="/admin/content" className="flex items-center justify-between px-4 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <span>📝 전문가 콘텐츠 관리</span>
              <span className="text-gray-400">→</span>
            </Link>
            {/* 의학적 근거 */}
            <Link href="/admin/evidence" className="flex items-center justify-between px-4 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <span>🔬 의학적 근거 자료</span>
              <span className="text-gray-400">→</span>
            </Link>
            {/* 가중치 관리 */}
            <Link href="/admin/weights" className="flex items-center justify-between px-4 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <span>⚖️ 요인 가중치 관리</span>
              <span className="text-gray-400">→</span>
            </Link>
            {/* 판단 로직 문서 */}
            <Link href="/admin/logic" className="flex items-center justify-between px-4 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <span>🔄 판단 로직 문서</span>
              <span className="text-gray-400">→</span>
            </Link>
            {/* 내 계정 플랜 전환 */}
            {dbUser && (
              <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200">내 계정 플랜</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">현재: <span className="font-semibold">{isPro ? 'Pro' : 'Free'}</span></p>
                </div>
                <PlanChangeButton userId={dbUser.id} currentPlan={isPro ? 'pro' : 'free'} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 위험 구역: 로그아웃 / 회원탈퇴 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-3">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">계정</h2>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full py-3 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: '#fca5a5', color: '#ef4444' }}
          >
            로그아웃
          </button>
        </form>
        <DeleteAccountSection />
      </div>
    </div>
  );
}
