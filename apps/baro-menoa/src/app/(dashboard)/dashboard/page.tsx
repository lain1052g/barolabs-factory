import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSymptomLogsByDate, getRecentSymptomSummary } from '@/actions/symptoms';
import Link from 'next/link';

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
  const [todayLogs, summary] = await Promise.all([
    getSymptomLogsByDate(today),
    getRecentSymptomSummary(7),
  ]);

  const isPro = dbUser?.plan === 'pro';

  return (
    <div className="px-4 py-6 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
          <h1 className="text-xl font-bold mt-0.5" style={{ color: '#800020' }}>메노아</h1>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: isPro ? '#800020' : '#f3f4f6', color: isPro ? 'white' : '#6b7280' }}
        >
          {isPro ? 'Pro' : 'Free'}
        </span>
      </div>

      {/* SOS 버튼 */}
      <Link
        href="/sos"
        className="block w-full py-5 rounded-2xl text-white text-center font-bold text-lg shadow-sm active:scale-95 transition-transform"
        style={{ background: 'linear-gradient(135deg, #800020, #a50028)' }}
      >
        <span className="block text-2xl mb-1">🆘</span>
        SOS — 지금 힘들어요
      </Link>

      {/* 오늘의 증상 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">오늘의 증상</h2>
          <Link
            href="/symptoms/log"
            className="text-sm font-medium px-3 py-1.5 rounded-xl"
            style={{ color: '#800020', backgroundColor: '#fdf6f7' }}
          >
            + 기록하기
          </Link>
        </div>

        {todayLogs.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">오늘 기록된 증상이 없습니다</p>
            <Link
              href="/symptoms/log"
              className="inline-block mt-3 px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ backgroundColor: '#800020' }}
            >
              첫 증상 기록하기
            </Link>
          </div>
        ) : (
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
        )}
      </div>

      {/* 최근 7일 요약 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-3">최근 7일 증상 추이</h2>
        {summary.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">데이터를 쌓으면 추이가 표시됩니다</p>
        ) : (
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const dateStr = d.toISOString().split('T')[0];
              const entry = summary.find(s => s.log_date === dateStr);
              const height = entry ? Math.max(20, (entry.max_severity / 5) * 100) : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${height}%`,
                      minHeight: entry ? 8 : 0,
                      backgroundColor: entry ? SEVERITY_COLOR[entry.max_severity] : 'transparent',
                    }}
                  />
                  <span className="text-[9px] text-gray-400">
                    {d.toLocaleDateString('ko-KR', { weekday: 'narrow' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
