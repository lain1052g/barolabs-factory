'use client';

// src/components/ExportButtons.tsx
// PDF / Excel 내보내기 버튼 컴포넌트 (br-240)

import { useState } from 'react';
import { generateSymptomPDF, generateSymptomExcel } from '@/actions/export';

type DatePreset = 'this_month' | 'last_month' | 'custom';

function getThisMonthRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function getLastMonthRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = new Date(now.getFullYear(), now.getMonth(), 0);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

// base64 → Blob → 파일 다운로드
function triggerDownload(base64: string, filename: string, mimeType: string) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const blob = new Blob([byteNumbers], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface ExportButtonsProps {
  userPlan: 'free' | 'pro';
}

export function ExportButtons({ userPlan }: ExportButtonsProps) {
  const thisMonth = getThisMonthRange();

  const [preset, setPreset] = useState<DatePreset>('this_month');
  const [fromDate, setFromDate] = useState(thisMonth.from);
  const [toDate, setToDate] = useState(thisMonth.to);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [excelError, setExcelError] = useState<string | null>(null);

  function handlePresetChange(p: DatePreset) {
    setPreset(p);
    setPdfError(null);
    setExcelError(null);
    if (p === 'this_month') {
      const r = getThisMonthRange();
      setFromDate(r.from);
      setToDate(r.to);
    } else if (p === 'last_month') {
      const r = getLastMonthRange();
      setFromDate(r.from);
      setToDate(r.to);
    }
    // 'custom' → 현재 날짜 유지
  }

  async function handlePdfDownload() {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const result = await generateSymptomPDF(fromDate, toDate);
      if ('error' in result) {
        setPdfError(result.error);
        return;
      }
      triggerDownload(result.data, result.filename, 'application/pdf');
    } catch {
      setPdfError('PDF 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleExcelDownload() {
    setExcelLoading(true);
    setExcelError(null);
    try {
      const result = await generateSymptomExcel(fromDate, toDate);
      if ('error' in result) {
        setExcelError(result.error);
        return;
      }
      triggerDownload(
        result.data,
        result.filename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    } catch {
      setExcelError('Excel 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setExcelLoading(false);
    }
  }

  const presets: { value: DatePreset; label: string }[] = [
    { value: 'this_month', label: '이번 달' },
    { value: 'last_month', label: '지난 달' },
    { value: 'custom', label: '직접 선택' },
  ];

  return (
    <div className="space-y-6">
      {/* ── 기간 선택 ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">기간 선택</h2>

        {/* 프리셋 탭 */}
        <div className="flex gap-2">
          {presets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => handlePresetChange(p.value)}
              className={[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                preset === p.value
                  ? 'bg-[var(--c-brand)] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
              ].join(' ')}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 날짜 입력 (직접 선택 또는 확인용) */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">시작일</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPreset('custom');
                setPdfError(null);
                setExcelError(null);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]/30 focus:border-[var(--c-brand)]"
            />
          </div>
          <div className="flex items-end pb-2 text-gray-400">~</div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">종료일</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPreset('custom');
                setPdfError(null);
                setExcelError(null);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]/30 focus:border-[var(--c-brand)]"
            />
          </div>
        </div>
      </div>

      {/* ── PDF 다운로드 ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              PDF 리포트
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {userPlan === 'free'
                ? '증상 기록을 PDF로 저장 (Free: 월 1회)'
                : '증상 기록을 PDF로 저장 (무제한)'}
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
            Free
          </span>
        </div>

        {pdfError && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            {pdfError}
          </div>
        )}

        <button
          type="button"
          onClick={handlePdfDownload}
          disabled={pdfLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--c-brand)] hover:bg-[#600018] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {pdfLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              PDF 생성 중...
            </>
          ) : (
            <>
              <PdfIcon />
              PDF 다운로드
            </>
          )}
        </button>
      </div>

      {/* ── Excel 다운로드 ── */}
      <div
        className={[
          'bg-white dark:bg-gray-900 border rounded-xl p-5 space-y-3',
          userPlan === 'pro'
            ? 'border-gray-200 dark:border-gray-700'
            : 'border-gray-200 dark:border-gray-700 opacity-80',
        ].join(' ')}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Excel 내보내기
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              증상 기록 + 요약 통계를 Excel로 내보내기
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
            Pro
          </span>
        </div>

        {userPlan !== 'pro' && (
          <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            Excel 다운로드는 Pro 플랜 전용 기능입니다.
          </div>
        )}

        {excelError && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            {excelError}
          </div>
        )}

        <button
          type="button"
          onClick={handleExcelDownload}
          disabled={excelLoading || userPlan !== 'pro'}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {excelLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Excel 생성 중...
            </>
          ) : (
            <>
              <ExcelIcon />
              엑셀 다운로드
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── 아이콘 ──────────────────────────────────────────────────────────
function PdfIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function ExcelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
      <line x1="10" y1="9" x2="14" y2="9" />
    </svg>
  );
}
