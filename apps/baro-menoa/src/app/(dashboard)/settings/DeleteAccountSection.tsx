'use client';

import { useState, useTransition } from 'react';
import { deleteAccount } from '@/actions/auth';

export function DeleteAccountSection() {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleClick() {
    setShowConfirm(true);
  }

  function handleCancel() {
    setShowConfirm(false);
  }

  function handleConfirm() {
    startTransition(async () => {
      await deleteAccount();
    });
  }

  if (showConfirm) {
    return (
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ backgroundColor: '#fff5f5', border: '1px solid #fca5a5' }}
      >
        <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
          정말 탈퇴하시겠습니까?
        </p>
        <p className="text-xs text-gray-500">
          모든 데이터(증상 기록, 감정 저널, PDF 리포트 등)가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors"
            style={{ borderColor: '#d1d5db', color: '#6b7280' }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: '#ef4444', color: 'white' }}
          >
            {isPending ? '처리 중...' : '탈퇴 확인'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full py-3 rounded-xl border text-sm font-medium transition-colors"
      style={{ borderColor: '#fca5a5', color: '#ef4444' }}
    >
      회원탈퇴
    </button>
  );
}
