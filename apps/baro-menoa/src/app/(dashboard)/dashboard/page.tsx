import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSymptomLogsByDate, getRecentSymptomSummary } from '@/actions/symptoms';
import { getTriggerLogByDate } from '@/actions/triggers';
import { getMoodLogByDate } from '@/actions/mood';
import Link from 'next/link';

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

  const [dbUser] = await db
    .select()
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user!.id))
    .limit(1);

  const today = new Date().toISOString().split('T')[0];
  const [todayLogs, summary, todayMood, todayTrigger] = await Promise.all([
    getSymptomLogsByDate(today),
    getRecentSymptomSummary(7),
    getMoodLogByDate(today),
    getTriggerLogByDate(today),
  ]);

  const isPro = dbUser?.plan === 'pro';

  // 오늘 평균 심각도 계산
  const avgSeverity = todayLogs.length > 0
    ? Math.round(todayLogs.reduce((sum, l) => sum + l.severity, 0) / todayLogs.length)
    : 0;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return '좋은 새벽이에요';
    if (h < 12) return '좋은 아침이에요';
    if (h < 18) return '좋은 오후예요';
    return '좋은 저녁이에요';
  })();

  return (
    <div className="px-4 py-6 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
          <h1 className="text-xl font-bold mt-0.5" style={{ color: '#800020' }}>
            {greeting}, {dbUser?.name?.split(' ')[0] ?? '반가워요'} 👋
          </h1>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: isPro ? '#800020' : '#f3f4f6', color: isPro ? 'white' : '#6b7280' }}
        >
          {isPro ? 'Pro' : 'Free'}
        </span>
      </div>

      {/* 오늘 요약 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">오늘 기록한 증상</p>
          <p className="text-3xl font-bold" style={{ color: '#800020' }}>{todayLogs.length}</p>
          <p className="text-xs text-gray-400 mt-1">개</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">평균 심각도</p>
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

      {/* 빠른 기록 버튼 */}
      <Link
        href="/symptoms/log"
        className="block w-full py-4 rounded-2xl text-white text-center font-semibold text-base shadow-sm active:scale-95 transition-transform"
        style={{ background: 'linear-gradient(135deg, #800020, #a50028)' }}
      >
        오늘 증상 기록하기
        {todayLogs.length > 0 && <span className="ml-2 text-sm font-normal opacity-80">({todayLogs.length}개 기록됨)</span>}
      </Link>

      {/* 오늘의 기분 + 트리거 카드 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 기분 카드 */}
        <Link
          href="/mood"
          className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-1.5 active:scale-95 transition-transform"
        >
          <p className="text-xs text-gray-400">오늘의 기분</p>
          {todayMood ? (
            <>
              <p className="text-3xl leading-none">{todayMood.mood_emoji}</p>
              <p className="text-xs font-medium" style={{ color: '#800020' }}>
                {todayMood.mood_score}점
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl leading-none text-gray-200">😐</p>
              <p className="text-xs text-gray-300">기록하기</p>
            </>
          )}
        </Link>

        {/* 트리거 카드 */}
        <Link
          href="/triggers"
          className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-1.5 active:scale-95 transition-transform"
        >
          <p className="text-xs text-gray-400">오늘의 트리거</p>
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
              <p className="text-xs font-medium" style={{ color: '#800020' }}>
                기록됨
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl leading-none text-gray-200">🎯</p>
              <p className="text-xs text-gray-300">기록하기</p>
            </>
          )}
        </Link>
      </div>

      {/* 오늘의 증상 목록 */}
      {todayLogs.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">오늘의 증상</h2>
            <Link
              href="/symptoms/log"
              className="text-xs font-medium"
              style={{ color: '#800020' }}
            >
              수정하기
            </Link>
          </div>
          <div className="space-y-2">
            {todayLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{log.symptom_name}</span>
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
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">최근 7일 증상 추이</h2>
          <Link href="/symptoms" className="text-xs" style={{ color: '#800020' }}>전체 보기</Link>
        </div>
        <div className="flex items-end gap-1.5 h-20">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
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
                  style={{ color: isToday ? '#800020' : '#9ca3af' }}
                >
                  {d.toLocaleDateString('ko-KR', { weekday: 'narrow' })}
                </span>
              </div>
            );
          })}
        </div>
        {summary.length === 0 && (
          <p className="text-gray-400 text-xs text-center mt-2">증상을 기록하면 추이가 표시됩니다</p>
        )}
      </div>

      {/* SOS 버튼 */}
      <Link
        href="/sos"
        className="flex items-center justify-between w-full px-5 py-4 rounded-2xl border-2 active:scale-95 transition-transform"
        style={{ borderColor: '#800020', backgroundColor: '#fff5f7' }}
      >
        <div>
          <p className="font-semibold text-sm" style={{ color: '#800020' }}>SOS — 지금 힘들어요</p>
          <p className="text-xs text-gray-500 mt-0.5">안면홍조·발한 즉각 대처법 안내</p>
        </div>
        <span className="text-2xl">🆘</span>
      </Link>
    </div>
  );
}
