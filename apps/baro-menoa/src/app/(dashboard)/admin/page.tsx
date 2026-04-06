import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import {
  menoa_users,
  menoa_symptom_logs,
  menoa_symptoms,
} from '@/db/schema';
import { eq, gte, sql, isNull, desc } from 'drizzle-orm';
import Link from 'next/link';
import { PlanChangeButton } from './PlanChangeButton';

const STAGE_LABEL: Record<string, string> = {
  pre: '폐경 전',
  peri: '폐경 이행기',
  post: '폐경 후',
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  // ── 오늘 자정 (KST → UTC 보정 없이 DB 시간 기준)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // ── 통계 쿼리 (병렬)
  const [
    totalUsersResult,
    todayUsersResult,
    totalLogsResult,
    proUsersResult,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(menoa_users),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(menoa_users)
      .where(gte(menoa_users.created_at, todayStart)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(menoa_symptom_logs)
      .where(isNull(menoa_symptom_logs.deleted_at)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(menoa_users)
      .where(eq(menoa_users.plan, 'pro')),
  ]);

  const totalUsers = totalUsersResult[0]?.count ?? 0;
  const todayUsers = todayUsersResult[0]?.count ?? 0;
  const totalLogs = totalLogsResult[0]?.count ?? 0;
  const proUsers = proUsersResult[0]?.count ?? 0;

  // ── 최근 가입자 20명
  const recentUsers = await db
    .select({
      id: menoa_users.id,
      email: menoa_users.email,
      name: menoa_users.name,
      plan: menoa_users.plan,
      menopause_stage: menoa_users.menopause_stage,
      created_at: menoa_users.created_at,
    })
    .from(menoa_users)
    .orderBy(desc(menoa_users.created_at))
    .limit(20);

  // ── 증상별 기록 Top 5
  const topSymptoms = await db
    .select({
      symptom_id: menoa_symptom_logs.symptom_id,
      symptom_name: menoa_symptoms.name,
      count: sql<number>`count(*)::int`,
    })
    .from(menoa_symptom_logs)
    .innerJoin(menoa_symptoms, eq(menoa_symptom_logs.symptom_id, menoa_symptoms.id))
    .where(isNull(menoa_symptom_logs.deleted_at))
    .groupBy(menoa_symptom_logs.symptom_id, menoa_symptoms.name)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  const stats = [
    { label: '전체 가입자 수', value: totalUsers, suffix: '명' },
    { label: '오늘 가입자', value: todayUsers, suffix: '명' },
    { label: '전체 증상 기록', value: totalLogs, suffix: '건' },
    { label: 'Pro 플랜 사용자', value: proUsers, suffix: '명' },
  ];

  return (
    <div className="space-y-8">
      {/* 통계 카드 */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">개요</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: '#800020' }}>
                {s.value.toLocaleString()}
                <span className="text-sm font-normal text-gray-500 ml-1">{s.suffix}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Top 5 증상 */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">인기 증상 Top 5</h2>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {topSymptoms.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">아직 기록이 없습니다.</p>
          ) : (
            <ol className="divide-y divide-gray-100">
              {topSymptoms.map((s, i) => (
                <li key={s.symptom_id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: '#800020' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-800 flex-1">{s.symptom_name}</span>
                  <span className="text-sm font-semibold text-gray-600">
                    {s.count.toLocaleString()}건
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* 최근 가입자 테이블 */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">최근 가입자 (20명)</h2>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">이메일</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">이름</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">플랜</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">갱년기 단계</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">가입일</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-800 max-w-[180px] truncate">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.plan === 'pro'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      style={u.plan === 'pro' ? { backgroundColor: '#800020' } : undefined}
                    >
                      {u.plan === 'pro' ? 'Pro' : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {u.menopause_stage ? STAGE_LABEL[u.menopause_stage] ?? u.menopause_stage : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {u.created_at.toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <PlanChangeButton userId={u.id} currentPlan={u.plan} />
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400 text-sm">
                    가입자가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
