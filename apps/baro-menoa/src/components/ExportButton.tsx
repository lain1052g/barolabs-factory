'use client';

// src/components/ExportButton.tsx
// 증상 통계 페이지용 PDF 내보내기 버튼
// /api/export/symptom-report GET → blob 다운로드 방식

import { useState } from 'react';

interface ExportButtonProps {
  plan: 'free' | 'pro';
}

export function ExportButton({ plan }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    if (plan === 'free') {
      // Free 플랜 안내만 제공 (월 1회 제한은 서버에서 처리)
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/export/symptom-report', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        let msg = 'PDF 생성 중 오류가 발생했습니다.';
        try {
          const json = (await res.json()) as { error?: string; message?: string };
          if (json.message) msg = json.message;
          else if (json.error === 'FREE_LIMIT_EXCEEDED') {
            msg = 'Free 플랜은 월 1회만 PDF를 내보낼 수 있습니다. Pro로 업그레이드하세요.';
          }
        } catch {
          // 파싱 실패 시 기본 메시지 사용
        }
        setError(msg);
        return;
      }

      // Blob으로 받아서 다운로드
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Content-Disposition 헤더에서 파일명 추출 시도
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match = /filename="([^"]+)"/.exec(disposition);
      a.download = match?.[1] ?? 'menoa-symptom-report.pdf';

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--c-brand)' }}
        aria-label="증상 리포트 PDF 내보내기"
      >
        {loading ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            생성 중...
          </>
        ) : (
          <>
            <PdfIcon />
            PDF 내보내기
          </>
        )}
      </button>
      {plan === 'free' && !error && (
        <span className="text-[10px] text-gray-400">Free: 월 1회</span>
      )}
      {error && (
        <span className="text-[11px] text-red-600 dark:text-red-400 max-w-[200px] text-right leading-tight">
          {error}
        </span>
      )}
    </div>
  );
}

function PdfIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}
