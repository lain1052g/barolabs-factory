'use server';

// src/actions/export.ts
// PDF / Excel 내보내기 서버 액션 (br-240)

import { db } from '@/db';
import {
  menoa_symptom_logs,
  menoa_symptoms,
  menoa_users,
} from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, isNull, gte, lte } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import React from 'react';
import { SymptomReport, type SymptomLogRow } from '@/lib/pdf/SymptomReport';
import { VisitReport } from '@/lib/pdf/VisitReport';
import type { VisitSummaryData } from '@/actions/visit-summary';
import { z } from 'zod';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)');

const exportDateRangeSchema = z
  .object({
    fromDate: dateString,
    toDate: dateString,
  })
  .refine((d) => d.fromDate <= d.toDate, {
    message: '시작일이 종료일보다 늦을 수 없습니다.',
    path: ['fromDate'],
  })
  .refine(
    (d) => {
      const diffDays =
        (new Date(d.toDate).getTime() - new Date(d.fromDate).getTime()) /
        (1000 * 60 * 60 * 24);
      return diffDays <= 366;
    },
    {
      message: '최대 1년 범위까지 내보낼 수 있습니다.',
      path: ['toDate'],
    },
  );

// ── 공통: 현재 사용자 + 로그 조회 ────────────────────────────────
async function fetchLogsForExport(fromDate: string, toDate: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // DB에서 사용자 정보 조회
  const dbUserRows = await db
    .select()
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);

  const dbUser = dbUserRows[0];
  if (!dbUser) redirect('/login');

  // 증상 로그 조회 (삭제되지 않은 것만)
  const logs = await db
    .select({
      id: menoa_symptom_logs.id,
      log_date: menoa_symptom_logs.log_date,
      severity: menoa_symptom_logs.severity,
      note: menoa_symptom_logs.note,
      symptom_name: menoa_symptoms.name,
    })
    .from(menoa_symptom_logs)
    .innerJoin(
      menoa_symptoms,
      eq(menoa_symptom_logs.symptom_id, menoa_symptoms.id),
    )
    .where(
      and(
        eq(menoa_symptom_logs.author_supabase_id, user.id),
        isNull(menoa_symptom_logs.deleted_at),
        gte(menoa_symptom_logs.log_date, fromDate),
        lte(menoa_symptom_logs.log_date, toDate),
      ),
    )
    .orderBy(menoa_symptom_logs.log_date, menoa_symptom_logs.created_at);

  return { dbUser, logs };
}

// ── 날짜 유효성 검증 (Zod 래퍼) ──────────────────────────────────
function validateDateRange(fromDate: string, toDate: string): string | null {
  const result = exportDateRangeSchema.safeParse({ fromDate, toDate });
  if (!result.success) {
    return result.error.errors[0]?.message ?? '입력값이 올바르지 않습니다.';
  }
  return null;
}

// ── PDF 생성 ─────────────────────────────────────────────────────
export async function generateSymptomPDF(
  fromDate: string,
  toDate: string,
): Promise<{ data: string; filename: string } | { error: string }> {
  // 날짜 유효성 검사
  const dateError = validateDateRange(fromDate, toDate);
  if (dateError) return { error: dateError };

  const { dbUser, logs } = await fetchLogsForExport(fromDate, toDate);

  // Free 플랜: upload_count 월 1회 제한
  if (dbUser.plan === 'free') {
    if (dbUser.upload_count >= 1) {
      return {
        error:
          'Free 플랜은 월 1회 PDF 다운로드만 가능합니다. Pro로 업그레이드하면 무제한으로 이용할 수 있습니다.',
      };
    }
  }

  // 생성일 포맷
  const generatedAt = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const userName = dbUser.name ?? dbUser.email ?? '사용자';

  const logRows: SymptomLogRow[] = logs.map((l) => ({
    id: l.id,
    log_date: l.log_date,
    symptom_name: l.symptom_name,
    severity: l.severity,
    note: l.note,
  }));

  // 데이터 없으면 PDF 생성 시도하지 않음
  if (logRows.length === 0) {
    return { error: '선택한 기간에 기록된 증상이 없어요. 기간을 바꿔서 다시 시도해 보세요.' };
  }

  // PDF 렌더링
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(
      React.createElement(SymptomReport, {
        userName,
        fromDate,
        toDate,
        logs: logRows,
        generatedAt,
      }) as React.ReactElement<DocumentProps>,
    );
  } catch {
    return { error: 'PDF 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' };
  }

  // Free 플랜: upload_count 증가
  if (dbUser.plan === 'free') {
    await db
      .update(menoa_users)
      .set({ upload_count: dbUser.upload_count + 1 })
      .where(eq(menoa_users.id, dbUser.id));
  }

  const base64 = Buffer.from(pdfBuffer).toString('base64');
  const filename = `메노아_증상리포트_${fromDate}_${toDate}.pdf`;

  return { data: base64, filename };
}

// ── 진료 요약 PDF 생성 ─────────────────────────────────────────────
export async function generateVisitPDF(
  data: VisitSummaryData,
): Promise<{ data: string; filename: string } | { error: string }> {
  if (data.symptoms.length === 0 && !data.triggers && !data.mood) {
    return { error: '기록된 데이터가 없어 PDF를 생성할 수 없어요.' };
  }

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(
      React.createElement(VisitReport, { data }) as React.ReactElement<DocumentProps>,
    );
  } catch {
    return { error: 'PDF 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' };
  }

  const base64 = Buffer.from(pdfBuffer).toString('base64');
  const filename = `메노아_진료요약_${data.periodFrom}_${data.periodTo}.pdf`;

  return { data: base64, filename };
}

// ── Excel 생성 ───────────────────────────────────────────────────
export async function generateSymptomExcel(
  fromDate: string,
  toDate: string,
): Promise<{ data: string; filename: string } | { error: string }> {
  // 날짜 유효성 검사
  const dateError = validateDateRange(fromDate, toDate);
  if (dateError) return { error: dateError };

  const { dbUser, logs } = await fetchLogsForExport(fromDate, toDate);

  // Pro 전용 기능
  if (dbUser.plan !== 'pro') {
    return {
      error: 'Excel 다운로드는 Pro 플랜 전용 기능입니다.',
    };
  }

  // 데이터 없으면 Excel 생성 시도하지 않음
  if (logs.length === 0) {
    return { error: '선택한 기간에 기록된 증상이 없어요. 기간을 바꿔서 다시 시도해 보세요.' };
  }

  // xlsx 동적 임포트 (서버 전용)
  const XLSX = await import('xlsx');

  // 워크시트 데이터 구성
  const wsData: (string | number)[][] = [
    ['날짜', '증상명', '심각도 (1-5)', '심각도 설명', '메모'],
    ...logs.map((l) => {
      const severityLabels: Record<number, string> = {
        1: '매우 약함',
        2: '약함',
        3: '보통',
        4: '강함',
        5: '매우 강함',
      };
      return [
        l.log_date,
        l.symptom_name,
        l.severity,
        severityLabels[l.severity] ?? '',
        l.note ?? '',
      ];
    }),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // 열 너비 설정
  ws['!cols'] = [
    { wch: 14 }, // 날짜
    { wch: 20 }, // 증상명
    { wch: 14 }, // 심각도
    { wch: 14 }, // 심각도 설명
    { wch: 40 }, // 메모
  ];

  // 요약 시트 구성
  const symptomCounts = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.symptom_name] = (acc[l.symptom_name] ?? 0) + 1;
    return acc;
  }, {});

  const avgSeverity =
    logs.length > 0
      ? (logs.reduce((sum, l) => sum + l.severity, 0) / logs.length).toFixed(2)
      : '0';

  const summaryData: (string | number)[][] = [
    ['메노아 증상 리포트 요약'],
    [''],
    ['기간', `${fromDate} ~ ${toDate}`],
    ['작성자', dbUser.name ?? dbUser.email ?? '사용자'],
    ['총 기록 수', logs.length],
    ['평균 심각도', Number(avgSeverity)],
    [''],
    ['증상별 기록 횟수'],
    ['증상명', '기록 횟수'],
    ...Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => [name, count]),
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '증상 기록');
  XLSX.utils.book_append_sheet(wb, wsSummary, '요약');

  const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const base64 = Buffer.from(excelBuffer).toString('base64');
  const filename = `메노아_증상리포트_${fromDate}_${toDate}.xlsx`;

  return { data: base64, filename };
}
