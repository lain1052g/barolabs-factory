import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import { INPUTS, DIAGNOSES, SOLUTIONS, FLOW } from '@/lib/decision-logic';
import { LogicClient } from './LogicClient';

export const metadata: Metadata = {
  title: '판단 로직 문서 | 메노아 어드민',
};

export default async function LogicPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect('/dashboard');

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 pb-16">

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🔄 판단 로직 문서</h1>
          <p className="text-sm text-gray-500 mt-1">
            수집 정보 → 상황 분류 → 솔루션 전체 매핑
          </p>
        </div>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
          ← 어드민
        </Link>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '수집 정보', value: INPUTS.length, color: '#6366f1' },
          { label: '상황 분류', value: DIAGNOSES.length, color: 'var(--c-brand)' },
          { label: '솔루션', value: SOLUTIONS.length, color: '#16a34a' },
          { label: '흐름 규칙', value: FLOW.length, color: '#ca8a04' },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-sm text-center">
            <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* 안내 */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 leading-relaxed">
        <p className="font-bold mb-1">📌 이 페이지에 대해</p>
        <p>앱이 사용자 데이터를 어떻게 해석하고 무엇을 제안하는지 전체 로직을 문서화한 것입니다.</p>
        <p className="mt-1">전문가 자문 후 기준값을 바꾸고 싶으면 개발자에게 전달하거나 아래 파일을 수정하세요:</p>
        <code className="block bg-amber-100 rounded px-2 py-1 mt-1 font-mono">src/lib/decision-logic.ts</code>
      </div>

      {/* 탭 클라이언트 */}
      <LogicClient />

    </div>
  );
}
