// src/app/(dashboard)/symptoms/export/page.tsx
// 리포트 내보내기 페이지 (br-240)

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { ExportButtons } from '@/components/ExportButtons';

export const metadata = {
  title: '리포트 내보내기 | 메노아',
  description: '증상 기록을 PDF 또는 Excel로 내보냅니다.',
};

export default async function ExportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select()
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);

  const plan = dbUser?.plan ?? 'free';
  const isPro = plan === 'pro';
  const uploadCount = dbUser?.upload_count ?? 0;

  return (
    <div className="px-4 py-6 space-y-5 max-w-md mx-auto pb-24">
      {/* 뒤로가기 */}
      <Link
        href="/symptoms"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        증상 기록으로 돌아가기
      </Link>

      {/* 페이지 제목 */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          리포트 내보내기
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          증상 기록을 PDF 또는 Excel 파일로 저장하세요.
        </p>
      </div>

      {/* 플랜 정보 배너 */}
      {isPro ? (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
          <span className="text-amber-500 mt-0.5 flex-shrink-0">
            <StarIcon />
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Pro 플랜 이용 중
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              무제한 PDF + Excel 다운로드가 가능합니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
          <span className="text-gray-400 mt-0.5 flex-shrink-0">
            <InfoIcon />
          </span>
          <div className="space-y-1.5">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Free 플랜
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                월 1회 PDF 다운로드 가능 &mdash; 이번 달{' '}
                <span
                  className={
                    uploadCount >= 1
                      ? 'text-red-600 dark:text-red-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 font-semibold'
                  }
                >
                  {uploadCount >= 1 ? '사용 완료' : '아직 미사용'}
                </span>
              </p>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Excel 내보내기 및 무제한 PDF는{' '}
              <Link
                href="/settings"
                className="underline text-[#800020] dark:text-[#cc3355] font-medium hover:opacity-80"
              >
                Pro 업그레이드
              </Link>{' '}
              후 이용 가능합니다.
            </p>
          </div>
        </div>
      )}

      {/* 내보내기 버튼 영역 */}
      <ExportButtons userPlan={plan} />
    </div>
  );
}

// ── 아이콘 ──────────────────────────────────────────────────────────
function StarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
