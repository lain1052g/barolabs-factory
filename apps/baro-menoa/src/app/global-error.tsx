'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="ko">
      <body>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold">오류가 발생했습니다</h2>
            <button onClick={reset} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm">
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
