'use client';

import { useState } from 'react';
import Link from 'next/link';

interface InfoIconProps {
  title: string;
  body: string;
  evidenceId?: string;
}

export function InfoIcon({ title, body, evidenceId }: InfoIconProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold flex-shrink-0 cursor-pointer"
        style={{ backgroundColor: '#f0e6ea', color: 'var(--c-brand)' }}
        aria-label={`${title} 설명 보기`}
      >
        i
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-snug">
                {title}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 ml-3 flex-shrink-0 text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
              {body}
            </p>
            {evidenceId && (
              <Link
                href={`/admin/evidence#${evidenceId}`}
                onClick={() => setOpen(false)}
                className="mt-4 block text-xs font-medium text-center py-2.5 rounded-xl transition-colors hover:opacity-80"
                style={{ backgroundColor: 'var(--c-brand-subtle)', color: 'var(--c-brand)' }}
              >
                의학적 근거 자세히 보기 →
              </Link>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full text-xs text-gray-400 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
