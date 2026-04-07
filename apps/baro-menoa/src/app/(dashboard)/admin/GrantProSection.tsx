'use client';

import { useState, useTransition } from 'react';
import { grantProToAll } from '@/actions/admin';

export function GrantProSection() {
  const [expiresAt, setExpiresAt] = useState('2026-12-31');
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!expiresAt) return;
    const date = new Date(`${expiresAt}T23:59:59Z`);
    setResult(null);
    startTransition(async () => {
      const res = await grantProToAll(date);
      if ('error' in res) {
        setResult(`오류: ${res.error}`);
      } else {
        setResult(`완료! ${res.count}명의 Free 유저에게 Pro 기한이 적용되었습니다.`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1" htmlFor="grant-expires-at">
            Pro 만료일
          </label>
          <input
            id="grant-expires-at"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--c-brand)]"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 whitespace-nowrap"
          style={{ backgroundColor: 'var(--c-brand)' }}
        >
          {isPending ? '적용 중...' : '전원 적용'}
        </button>
      </div>
      {result && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{result}</p>
      )}
    </form>
  );
}
