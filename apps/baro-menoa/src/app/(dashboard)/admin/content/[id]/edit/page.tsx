import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContentForm } from '@/components/admin/ContentForm';
import { getAdminContent, updateExpertContent } from '@/actions/admin-content';

export const metadata: Metadata = {
  title: '콘텐츠 수정 | 메노아 어드민',
};

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = await getAdminContent(id);

  if (!content) {
    notFound();
  }

  // id를 고정한 바운드 액션 생성
  const boundAction = updateExpertContent.bind(null, id);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">콘텐츠 수정</h1>
          <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">{content.title}</p>
        </div>
        <Link
          href="/admin/content"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ← 목록
        </Link>
      </div>

      {/* 폼 */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <ContentForm
          action={boundAction}
          defaultValues={{
            title: content.title,
            body: content.body,
            category: content.category,
            author_name: content.author_name,
            author_title: content.author_title,
            reviewed_by: content.reviewed_by,
            thumbnail_url: content.thumbnail_url,
            is_pro_only: content.is_pro_only,
            is_published: content.is_published,
          }}
          submitLabel="수정 저장"
        />
      </div>
    </div>
  );
}
