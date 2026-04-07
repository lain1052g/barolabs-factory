import type { Metadata } from 'next';
import Link from 'next/link';
import { getAdminContents } from '@/actions/admin-content';
import { DeleteContentButton, PublishToggleButton } from './ContentActions';

export const metadata: Metadata = {
  title: '전문가 콘텐츠 관리 | 메노아 어드민',
};

const CATEGORY_LABEL: Record<string, string> = {
  nutrition: '영양',
  exercise: '운동',
  mental: '정신 건강',
  medical: '의학',
  lifestyle: '생활습관',
};

export default async function AdminContentPage() {
  const contents = await getAdminContents();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">전문가 콘텐츠 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            전체 {contents.length}개 콘텐츠
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            ← 어드민
          </Link>
          <Link
            href="/admin/content/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm"
            style={{ backgroundColor: 'var(--c-brand)' }}
          >
            + 새 콘텐츠 작성
          </Link>
        </div>
      </div>

      {/* 목록 테이블 */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
        {contents.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-400">
            <p className="mb-3">아직 콘텐츠가 없습니다.</p>
            <Link
              href="/admin/content/new"
              className="inline-flex items-center gap-1 text-sm font-medium"
              style={{ color: 'var(--c-brand)' }}
            >
              첫 콘텐츠 작성하기 →
            </Link>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">제목</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">카테고리</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">작성자</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">발행</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Pro</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">등록일</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contents.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-800 max-w-[240px]">
                    <span className="line-clamp-1">{c.title}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                      {CATEGORY_LABEL[c.category] ?? c.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    <span>{c.author_name}</span>
                    {c.author_title && (
                      <span className="text-xs text-gray-400 ml-1">({c.author_title})</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <PublishToggleButton id={c.id} isPublished={c.is_published} />
                  </td>
                  <td className="px-4 py-3">
                    {c.is_pro_only ? (
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: 'var(--c-brand)' }}
                      >
                        Pro
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Free</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {c.created_at.toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/content/${c.id}/edit`}
                        className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium"
                      >
                        수정
                      </Link>
                      <DeleteContentButton id={c.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
