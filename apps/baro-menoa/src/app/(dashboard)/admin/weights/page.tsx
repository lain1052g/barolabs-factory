import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import {
  CONDITIONS,
  MEDICAL_HISTORY,
  MEDICATIONS,
  SUPPLEMENTS,
  HIGH_THRESHOLD,
  SUPPRESS_BELOW,
  type HealthItem,
} from '@/lib/health-profile-items';

export const metadata: Metadata = {
  title: '요인 가중치 관리 | 메노아 어드민',
};

const WEIGHT_META: Record<number, { label: string; color: string; bg: string; desc: string }> = {
  5: { label: 'Critical', color: '#dc2626', bg: '#fef2f2', desc: '리포트 해석 전체가 달라짐. 무조건 최우선 표시.' },
  4: { label: 'High',     color: '#ea580c', bg: '#fff7ed', desc: '증상에 강하게 영향. 상위에 표시.' },
  3: { label: 'Medium',   color: '#ca8a04', bg: '#fefce8', desc: 'Critical/High 없을 때 다룸.' },
  2: { label: 'Low',      color: '#16a34a', bg: '#f0fdf4', desc: '보조적 요인.' },
  1: { label: 'Minor',    color: '#6b7280', bg: '#f9fafb', desc: 'Critical/High 요인 없을 때만 언급.' },
};

const SECTIONS: { title: string; emoji: string; items: HealthItem[] }[] = [
  { title: '질병 기록',        emoji: '🏥', items: CONDITIONS },
  { title: '병력 기록',        emoji: '📋', items: MEDICAL_HISTORY },
  { title: '복용 약물',        emoji: '💊', items: MEDICATIONS },
  { title: '영양제·보조식품',  emoji: '🌿', items: SUPPLEMENTS },
];

export default async function WeightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect('/dashboard');

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8 pb-16">

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">⚖️ 요인 가중치 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            건강 프로필 각 항목이 리포트 분석에 미치는 영향도
          </p>
        </div>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
          ← 어드민
        </Link>
      </div>

      {/* 억제 규칙 설명 */}
      <div className="rounded-2xl border-2 border-dashed border-orange-300 p-5 space-y-2 bg-orange-50">
        <p className="font-semibold text-orange-800 text-sm">📌 억제 규칙 (Suppression Rule)</p>
        <p className="text-sm text-orange-700">
          사용자에게 <strong>weight ≥ {HIGH_THRESHOLD} (High/Critical)</strong> 요인이 있으면,
          <strong> weight ≤ {SUPPRESS_BELOW} (Minor)</strong> 요인은 리포트 상위에 노출하지 않습니다.
        </p>
        <p className="text-xs text-orange-600 mt-1">
          예: 음주를 많이 하는 사람(트리거 기록)에게 &ldquo;아연 영양제가 부족해서 아파요&rdquo; 라고 하지 않음.
          Heavy 요인이 있을 때 Minor 요인이 원인인 것처럼 보이는 오류 방지.
        </p>
      </div>

      {/* 가중치 범례 */}
      <div className="grid grid-cols-1 gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">가중치 기준</p>
        {Object.entries(WEIGHT_META).reverse().map(([w, meta]) => (
          <div
            key={w}
            className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ backgroundColor: meta.bg }}
          >
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white flex-shrink-0 mt-0.5"
              style={{ backgroundColor: meta.color }}
            >
              {w}
            </span>
            <div>
              <span className="text-sm font-bold" style={{ color: meta.color }}>{meta.label}</span>
              <span className="text-sm text-gray-600 ml-2">{meta.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 섹션별 항목 테이블 */}
      {SECTIONS.map(section => (
        <div key={section.title} className="space-y-3">
          <h2 className="font-bold text-gray-800 text-base">
            {section.emoji} {section.title}
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium w-8">W</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">항목</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium hidden md:table-cell">분석 참고 메모</th>
                </tr>
              </thead>
              <tbody>
                {[...section.items]
                  .sort((a, b) => b.weight - a.weight)
                  .map((item, i) => {
                    const meta = WEIGHT_META[item.weight];
                    return (
                      <tr
                        key={item.id}
                        className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: meta.color }}
                          >
                            {item.weight}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-800">{item.label}</p>
                            <p className="text-xs font-semibold mt-0.5" style={{ color: meta.color }}>
                              {meta.label}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 hidden md:table-cell leading-relaxed">
                          {item.note ?? '—'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* 수정 안내 */}
      <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5 space-y-2">
        <p className="font-semibold text-gray-700 text-sm">🛠️ 가중치 수정 방법</p>
        <p className="text-sm text-gray-500">
          가중치 변경이 필요하면 개발자에게 요청하거나 아래 파일을 직접 수정 후 배포하세요.
        </p>
        <code className="block text-xs bg-gray-100 rounded-lg px-3 py-2 text-gray-600 mt-2">
          src/lib/health-profile-items.ts
        </code>
        <p className="text-xs text-gray-400 mt-1">
          각 항목의 <code>weight</code> 값을 1~5 사이로 변경하고 배포하면 즉시 반영됩니다.
        </p>
      </div>

    </div>
  );
}
