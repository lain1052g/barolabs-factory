import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentForm } from '@/components/admin/ContentForm';
import { createExpertContent } from '@/actions/admin-content';

export const metadata: Metadata = {
  title: '새 콘텐츠 작성 | 메노아 어드민',
};

export default function NewContentPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">새 콘텐츠 작성</h1>
          <p className="text-sm text-gray-500 mt-0.5">전문가 콘텐츠를 새로 등록합니다</p>
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
        <ContentForm action={createExpertContent} submitLabel="콘텐츠 등록" />
      </div>
    </div>
  );
}
