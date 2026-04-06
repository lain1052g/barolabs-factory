'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#fdf6f7' }}>
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-4xl">🌸</p>
        <h2 className="text-lg font-semibold text-gray-800">일시적인 오류가 발생했습니다</h2>
        <p className="text-sm text-gray-500">잠시 후 다시 시도해주세요.</p>
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: '#800020' }}
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
