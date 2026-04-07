// src/app/api/export/symptom-report/route.ts
// 증상 리포트 PDF 내보내기 API Route
// - Free: 최근 30일, 월 1회 제한
// - Pro: 최근 90일, 무제한
// @react-pdf/renderer는 Node.js 환경에서만 동작 → API Route 사용

import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import React from 'react';
import { db } from '@/db';
import {
  menoa_symptom_logs,
  menoa_symptoms,
  menoa_users,
} from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, isNull, gte, lte, desc } from 'drizzle-orm';
import { SymptomReport } from '@/lib/pdf/SymptomReport';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]!;
}

function formatKoreanDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${year}년 ${month}월 ${day}일`;
}

export async function GET(): Promise<Response> {
  try {
    // ── 1. 인증 체크 ───────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. 유저 정보 및 플랜 조회 ─────────────────────
    const [dbUser] = await db
      .select({
        id: menoa_users.id,
        name: menoa_users.name,
        email: menoa_users.email,
        plan: menoa_users.plan,
        upload_count: menoa_users.upload_count,
      })
      .from(menoa_users)
      .where(eq(menoa_users.supabase_id, user.id))
      .limit(1);

    if (!dbUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const plan = (dbUser.plan ?? 'free') as 'free' | 'pro';

    // ── 3. Free 플랜 월 1회 제한 체크 ────────────────
    if (plan === 'free' && dbUser.upload_count >= 1) {
      return Response.json(
        {
          error: 'FREE_LIMIT_EXCEEDED',
          message: 'Free 플랜은 월 1회만 PDF를 내보낼 수 있습니다. Pro로 업그레이드하세요.',
        },
        { status: 403 },
      );
    }

    // ── 4. 날짜 범위 계산 ─────────────────────────────
    // Free: 최근 30일, Pro: 최근 90일
    const daysBack = plan === 'free' ? 30 : 90;
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - daysBack);
    fromDate.setHours(0, 0, 0, 0);

    const fromStr = toDateStr(fromDate);
    const toStr = toDateStr(toDate);

    // ── 5. 증상 기록 조회 ─────────────────────────────
    const rows = await db
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
          gte(menoa_symptom_logs.log_date, fromStr),
          lte(menoa_symptom_logs.log_date, toStr),
          isNull(menoa_symptom_logs.deleted_at),
        ),
      )
      .orderBy(
        desc(menoa_symptom_logs.log_date),
        menoa_symptoms.name,
      );

    // ── 6. PDF 렌더링 ─────────────────────────────────
    const userName = dbUser.name ?? dbUser.email;
    const now = new Date();
    const generatedAt = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

    const pdfBuffer = await renderToBuffer(
      React.createElement(SymptomReport, {
        userName,
        fromDate: formatKoreanDate(fromStr),
        toDate: formatKoreanDate(toStr),
        logs: rows.map((r) => ({
          id: r.id,
          log_date: r.log_date,
          symptom_name: r.symptom_name,
          severity: r.severity,
          note: r.note,
        })),
        generatedAt,
      }) as React.ReactElement<DocumentProps>,
    );

    // ── 7. Free 플랜 upload_count 증가 ───────────────
    if (plan === 'free') {
      await db
        .update(menoa_users)
        .set({ upload_count: (dbUser.upload_count ?? 0) + 1 })
        .where(eq(menoa_users.supabase_id, user.id));
    }

    // ── 8. PDF Response 반환 ──────────────────────────
    const fileName = `menoa-symptom-report-${toStr}.pdf`;
    // Buffer → base64 string → 다시 binary string으로 변환 없이
    // ReadableStream으로 감싸서 Response에 전달
    const base64 = pdfBuffer.toString('base64');
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    return new Response(bytes.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(pdfBuffer.byteLength),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[export/symptom-report] error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
