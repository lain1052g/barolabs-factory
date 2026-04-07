'use client';

import { useState, useTransition } from 'react';
import { deleteSymptomLog } from '@/actions/symptoms';

export function DeleteSymptomButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      await deleteSymptomLog(id);
      setShowConfirm(false);
    });
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={isPending}
          aria-label="삭제 확인"
          className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white font-medium disabled:opacity-50 transition-opacity"
        >
          {isPending ? '삭제 중…' : '삭제'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          aria-label="삭제 취소"
          className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      aria-label="증상 기록 삭제"
      className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </button>
  );
}
