'use client';

import { useTransition } from 'react';
import { deleteExpertContent, publishExpertContent } from '@/actions/admin-content';
import { useRouter } from 'next/navigation';

export function DeleteContentButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까? 복구할 수 없습니다.')) return;
    startTransition(async () => {
      await deleteExpertContent(id);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors font-medium"
    >
      {isPending ? '삭제 중...' : '삭제'}
    </button>
  );
}

export function PublishToggleButton({
  id,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle() {
    startTransition(async () => {
      await publishExpertContent(id, !isPublished);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50 ${
        isPublished
          ? 'bg-green-50 text-green-700 hover:bg-green-100'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {isPending ? '...' : isPublished ? '발행됨' : '비발행'}
    </button>
  );
}
