import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getSymptomLogsByDate, getRecentSymptomSummary } from '@/actions/symptoms';
import { getTriggerLogByDate } from '@/actions/triggers';
import { getMoodLogByDate } from '@/actions/mood';
import { getStreakData } from '@/actions/streak';
import { getDailyTip, getTriggerBasedTip } from '@/lib/daily-tips';
import { BADGES } from '@/lib/badges';
import { BadgeUnlockToast } from '@/components/BadgeUnlockToast';
import { UserPropertySetter } from '@/components/UserPropertySetter';
import Link from 'next/link';
import { InfoIcon } from '@/components/InfoIcon';

export const metadata: Metadata = {
  title: '오늘의 증상 | 메노아',
  description: '오늘의 갱년기 증상을 기록하고 건강 상태를 확인하세요.',
};

export const revalidate = 30;

const SEVERITY_COLOR = ['', '#22c55e', '#84cc16', '#f59e0b', '#ef4444', '#dc2626'];
const SEVERITY_LABEL = ['', '매우 약함', '약함', '보통', '심함', '매우 심함'];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select()
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);

  if (!dbUser) redirect('/login');

  // KST 기준 현재 시각
  const kstHour = parseInt(
    new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour: 'numeric', hour12: false }),
    10,
  );
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }); // YYYY-MM-DD (KST)

  const [todayLogs, summary, todayMood, todayTrigger, streak] = await Promise.all([
    getSymptomLogsByDate(today),
    getRecentSymptomSummary(7),
    getMoodLogByDate(today),
    getTriggerLogByDate(today),
    getStreakData(),
  ]);

  // 트리거 기반 개인화 팁 우선, 없으면 증상 기반 일반 팁
  const triggerTip = todayTrigger
    ? getTriggerBasedTip({
        caffeine: todayTrigger.caffeine_cups,
        alcohol: todayTrigger.alcohol_units,
        sleepMinutes: todayTrigger.sleep_minutes,
        stress: todayTrigger.stress_level ?? undefined,
        exerciseMinutes: todayTrigger.exercise_minutes,
      })
    : null;

  const tip = triggerTip ?? getDailyTip(
    todayLogs.some(l => l.symptom_name.includes('안면홍조') || l.symptom_name.includes('발한')) ? 'hotflash'
    : todayLogs.some(l => l.symptom_name.includes('수면') || l.symptom_name.includes('불면')) ? 'sleep'
    : todayLogs.some(l => l.symptom_name.includes('기분') || l.symptom_name.includes('우울') || l.symptom_name.includes('불안')) ? 'mood'
    : null,
  );

  const isPro = dbUser.plan === 'pro';

  // 오늘 평균 심각도
  const avgSeverity = todayLogs.length > 0
    ? Math.round(todayLogs.reduce((sum, l) => sum + l.severity, 0) / todayLogs.length)
    : 0;

  // KST 기준 인사말
  const greeting = (() => {
    if (kstHour < 6) return '좋은 새벽이에요';
    if (kstHour < 12) return '좋은 아침이에요';
    if (kstHour < 18) return '좋은 오후예요';
    return '좋은 저녁이에요';
  })();

  // 오늘 뱃지 해금 여부 (totalDays가 정확히 해금 기준과 일치할 때)
  const newBadge = BADGES.find(b => b.unlockAt === streak.totalDays) ?? null;

  return (
    <div className="px-4 py-6 space-y-4">
      {/* GA4 사용자 속성 */}
      <UserPropertySetter stage={dbUser.menopause_stage ?? null} plan={dbUser.plan ?? 'free'} />
      {/* 뱃지 해금 토스트 */}
      {newBadge && <BadgeUnlockToast badge={newBadge} />}

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
          <h1 className="text-xl font-bold mt-0.5" style={{ color: 'var(--c-brand)' }}>
            {greeting}, {dbUser.name?.split(' ')[0] ?? '반가워요'} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {streak.current >= 2 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
              🔥 {streak.current}일
            </span>
          )}
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: isPro ? 'var(--c-brand)' : '#f3f4f6', color: isPro ? 'white' : '#6b7280' }}
          >
            {isPro ? 'Pro' : 'Free'}
          </span>
        </div>
      </div>

      {/* 오늘 요약 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">오늘 기록한 증상</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--c-brand)' }}>{todayLogs.length}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">개</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-1 mb-1">
            <p className="text-xs text-gray-400 dark:text-gray-500">평균 심각도</p>
            <InfoIcon
              title="심각도 점수란?"
              body={'1점 = 거의 느껴지지 않음\n2점 = 약간 불편함\n3점 = 신경 쓰이는 수준\n4점 = 꽤 힘듦\n5점 = 일상생활이 어려울 정도\n\n매일 기록하면 증상이 언제 심해지는지 패턴을 파악할 수 있어요.'}
              evidenceId="severity-scale"
            />
          </div>
          {avgSeverity > 0 ? (
            <>
              <p className="text-3xl font-bold" style={{ color: SEVERITY_COLOR[avgSeverity] }}>{avgSeverity}</p>
              <p className="text-xs mt-1" style={{ color: SEVERITY_COLOR[avgSeverity] }}>{SEVERITY_LABEL[avgSeverity]}</p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-200">—</p>
              <p className="text-xs text-gray-300 mt-1">기록 없음</p>
            </>
          )}
        </div>
      </div>

      {/* 기록 진행 현황 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{streak.current >= 1 ? '🔥' : '📅'}</span>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {streak.current >= 1 ? `${streak.current}일 연속 기록 중` : '오늘 첫 기록을 시작해보세요'}
            </p>
          </div>
          <p className="text-xs text-gray-400">{streak.totalDays}일 누적</p>
        </div>
        <div className="relative w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all"
            style={{ width: `${streak.progressTo30}%`, backgroundColor: 'var(--c-brand)' }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">
          {streak.progressTo30 < 100
            ? `트리거 분석 잠금 해제까지 ${streak.daysRemaining}일 남았어요`
            : '🎉 트리거 분석이 준비됐어요!'}
        </p>
      </div>

      {/* 빠른 기록 버튼 */}
      <Link
        href="/symptoms/log"
        className="block w-full py-4 rounded-2xl text-white text-center font-semibold text-base shadow-sm active:scale-95 transition-transform hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #800020, #a50028)' }}
      >
        오늘 증상 기록하기
        {todayLogs.length > 0 && <span className="ml-2 text-sm font-normal opacity-80">({todayLogs.length}개 기록됨)</span>}
      </Link>

      {/* 기분이 안 좋을 때 응원 메시지 */}
      {todayMood && todayMood.mood_score <= 2 && (
        <div className="rounded-2xl px-4 py-3 flex items-start gap-2.5" style={{ backgroundColor: 'var(--c-brand-subtle)', border: '1px solid #f5c6cc' }}>
          <span className="text-lg flex-shrink-0">💗</span>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            오늘 많이 힘드셨군요. 기록한 것만으로도 충분히 잘 하고 계세요.
          </p>
        </div>
      )}

      {/* 오늘의 기분 + 트리거 */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/mood"
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none flex flex-col gap-1.5 active:scale-95 transition-transform hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 dark:text-gray-500">오늘의 기분</p>
            <span className="text-xs text-gray-300">→</span>
          </div>
          {todayMood ? (
            <>
              <p className="text-3xl leading-none">{todayMood.mood_emoji}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--c-brand)' }}>
                {todayMood.mood_score}점 · 탭해서 수정
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl leading-none text-gray-200">😐</p>
              <p className="text-xs font-medium" style={{ color: 'var(--c-brand)' }}>탭해서 기록하기</p>
            </>
          )}
        </Link>

        <Link
          href="/triggers"
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none flex flex-col gap-1.5 active:scale-95 transition-transform hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-400 dark:text-gray-500">오늘의 트리거</p>
              <InfoIcon
                title="트리거란?"
                body={'증상에 영향을 줄 수 있는 생활 요인을 기록해요.\n\n☕ 카페인\n🍷 음주\n😤 스트레스\n😴 수면 시간\n🏃 운동\n🌡️ 날씨\n\n매일 기록하면 나만의 패턴을 찾을 수 있어요.'}
                evidenceId="triggers"
              />
            </div>
            <span className="text-xs text-gray-300">→</span>
          </div>
          {todayTrigger ? (
            <>
              <div className="flex flex-wrap gap-1">
                {todayTrigger.caffeine_cups > 0 && <span className="text-base">☕</span>}
                {todayTrigger.alcohol_units > 0 && <span className="text-base">🍷</span>}
                {todayTrigger.stress_level !== null && <span className="text-base">😤</span>}
                {todayTrigger.sleep_minutes > 0 && todayTrigger.sleep_minutes < 360 && (
                  <span className="text-base">😴</span>
                )}
                {todayTrigger.exercise_minutes > 0 && <span className="text-base">🏃</span>}
                {todayTrigger.note?.includes('#날씨') && <span className="text-base">🌡️</span>}
                {todayTrigger.note?.includes('#기타') && <span className="text-base">📝</span>}
              </div>
              <p className="text-xs font-medium" style={{ color: 'var(--c-brand)' }}>
                기록됨 · 탭해서 수정
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl leading-none text-gray-200">🎯</p>
              <p className="text-xs font-medium" style={{ color: 'var(--c-brand)' }}>탭해서 기록하기</p>
            </>
          )}
        </Link>
      </div>

      {/* 오늘의 증상 목록 */}
      {todayLogs.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">오늘의 증상</h2>
              <InfoIcon
                title="심각도 점 표시 보는 법"
                body={'오른쪽 점 5개가 심각도예요.\n● 초록 1개 = 거의 괜찮음\n●●●●● 빨간 5개 = 매우 심함\n\n점이 채워질수록 증상이 심한 거예요.'}
                evidenceId="severity-scale"
              />
            </div>
            <Link
              href="/symptoms/log"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
              style={{ backgroundColor: 'var(--c-brand-subtle)', color: 'var(--c-brand)' }}
            >
              수정하기 →
            </Link>
          </div>
          <div className="space-y-2">
            {todayLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <span className="text-sm text-gray-700 dark:text-gray-200">{log.symptom_name}</span>
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(n => (
                    <div
                      key={n}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: n <= log.severity ? SEVERITY_COLOR[log.severity] : '#e5e7eb' }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최근 7일 증상 추이 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">최근 7일 증상 추이</h2>
            <InfoIcon
              title="이 차트는 뭔가요?"
              body={'지난 7일간 매일 가장 심한 증상의 강도를 막대로 보여줘요.\n\n막대 위 숫자 = 그날 기록한 증상 수\n색깔 = 그날 가장 심한 증상 정도\n  초록 → 약함\n  노랑 → 보통\n  빨강 → 심함\n\n규칙적으로 기록할수록 패턴이 잘 보여요.'}
            />
          </div>
          <Link
            href="/symptoms"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--c-brand-subtle)', color: 'var(--c-brand)' }}
          >
            전체 보기 →
          </Link>
        </div>
        <div className="flex items-end gap-1.5 h-20">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toLocaleDateString('sv-SE');
            const entry = summary.find(s => s.log_date === dateStr);
            const maxSev = entry ? Number(entry.max_severity) : 0;
            const barHeight = maxSev > 0 ? Math.max(16, (maxSev / 5) * 100) : 4;
            const isToday = dateStr === today;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                {entry && (
                  <span className="text-[8px] text-gray-400">{Number(entry.count)}</span>
                )}
                <div className="w-full flex items-end" style={{ height: 64 }}>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${barHeight}%`,
                      backgroundColor: maxSev > 0 ? SEVERITY_COLOR[maxSev] : '#e5e7eb',
                      opacity: isToday ? 1 : 0.7,
                    }}
                  />
                </div>
                <span
                  className="text-[9px] font-medium"
                  style={{ color: isToday ? 'var(--c-brand)' : '#9ca3af' }}
                >
                  {d.toLocaleDateString('ko-KR', { weekday: 'narrow' })}
                </span>
              </div>
            );
          })}
        </div>
        {summary.length === 0 && (
          <p className="text-gray-400 dark:text-gray-500 text-xs text-center mt-2">증상을 기록하면 추이가 표시됩니다</p>
        )}
        {summary.length >= 2 && (() => {
          const best = summary.reduce((min, s) =>
            Number(s.max_severity) < Number(min.max_severity) ? s : min,
          );
          const d = new Date(best.log_date + 'T00:00:00');
          const isToday2 = best.log_date === today;
          const dayLabel = isToday2 ? '오늘' : d.toLocaleDateString('ko-KR', { weekday: 'long' });
          return (
            <p className="text-[11px] text-gray-400 mt-2 text-center">
              🌟 이번 주 증상이 가장 약했던 날은 <span className="font-semibold" style={{ color: 'var(--c-brand)' }}>{dayLabel}</span>이에요
            </p>
          );
        })()}
      </div>

      {/* 진료 요약 */}
      <Link
        href="/visit"
        className="flex items-center justify-between w-full px-5 py-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none active:scale-95 transition-transform hover:shadow-md"
      >
        <div>
          <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">🩺 진료 요약</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">전문의에게 보여줄 내 증상 요약 →</p>
        </div>
        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
      </Link>

      {/* SOS 버튼 */}
      <Link
        href="/sos"
        className="flex items-center justify-between w-full px-5 py-4 rounded-2xl border-2 active:scale-95 transition-transform hover:shadow-md"
        style={{ borderColor: 'var(--c-brand)', backgroundColor: 'var(--c-brand-subtle)' }}
      >
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--c-brand)' }}>SOS — 지금 힘들어요</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">안면홍조·발한 즉각 대처법 → 탭해서 열기</p>
        </div>
        <span className="text-2xl">🆘</span>
      </Link>

      {/* 오늘의 팁 */}
      <div
        className="rounded-2xl p-4 space-y-1.5"
        style={{ backgroundColor: 'var(--c-brand-subtle)', border: '1px solid #f5c6cc' }}
      >
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">오늘의 건강 상식</p>
        <div className="flex items-start gap-2.5">
          <span className="text-xl flex-shrink-0 mt-0.5">{tip.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{tip.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{tip.body}</p>
          </div>
        </div>
        <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">일반적인 건강 상식이며 의학적 조언이 아닙니다</p>
      </div>
    </div>
  );
}
