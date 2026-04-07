import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getExpertContent } from '@/actions/content';
import { CATEGORY_LABEL } from '@/lib/content-categories';
import { BookmarkButton } from './BookmarkButton';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const content = await getExpertContent(id);
  if (!content || 'error' in content) return { title: '메노아' };
  return {
    title: `${content.title} | 메노아`,
    description: content.body.slice(0, 120).replace(/\n/g, ' '),
  };
}

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = await getExpertContent(id);

  if (!content || 'error' in content) notFound();

  const paragraphs = content.body.split('\n').filter(Boolean);

  return (
    <div className="px-4 py-6 space-y-5 max-w-lg mx-auto pb-24">
      {/* 뒤로가기 */}
      <Link
        href="/content"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        전문가 콘텐츠
      </Link>

      {/* 카테고리 + Pro 배지 */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ backgroundColor: 'var(--c-brand-subtle)', color: 'var(--c-brand)' }}
        >
          {CATEGORY_LABEL[content.category] ?? content.category}
        </span>
        {content.is_pro_only && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
            Pro
          </span>
        )}
      </div>

      {/* 제목 */}
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug">{content.title}</h1>

      {/* 저자 + 북마크 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{content.author_name}</p>
          {content.author_title && (
            <p className="text-xs text-gray-400 dark:text-gray-500">{content.author_title}</p>
          )}
        </div>
        <BookmarkButton contentId={content.id} isBookmarked={content.is_bookmarked} />
      </div>

      {/* 검토자 */}
      {content.reviewed_by && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
          style={{ backgroundColor: 'var(--c-brand-subtle)', color: 'var(--c-brand)' }}
        >
          <span>✅</span>
          <span>의학 검토: <strong>{content.reviewed_by}</strong></span>
        </div>
      )}

      {/* 본문 */}
      <div className="prose prose-sm max-w-none space-y-4">
        {paragraphs.map((p: string, i: number) => (
          <p key={i} className="text-gray-700 dark:text-gray-200 leading-relaxed text-sm">
            {p}
          </p>
        ))}
      </div>

      {/* 작성일 */}
      <p className="text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-4">
        {content.created_at.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      {/* 면책 */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
        이 콘텐츠는 일반적인 건강 정보 제공 목적으로 작성되었으며, 의사의 진단 및 치료를 대체하지 않습니다.
      </div>
    </div>
  );
}
