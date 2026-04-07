// src/app/api/cron/send-notification/route.ts
// 매시 정각 실행 — 현재 KST 시각 기준으로 notification_hour가 일치하는 사용자에게만 푸시 발송
// vercel.json: { "path": "/api/cron/send-notification", "schedule": "0 * * * *" }

import { db } from '@/db';
import { menoa_users, menoa_symptom_logs, menoa_push_tokens } from '@/db/schema';
import { and, eq, isNull, inArray } from 'drizzle-orm';
import { sendPushNotification } from '@/actions/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 현재 KST 시각 계산 (UTC+9)
    const nowUtc = new Date();
    const kstOffsetMs = 9 * 60 * 60 * 1000;
    const kstNow = new Date(nowUtc.getTime() + kstOffsetMs);
    const kstHour = kstNow.getUTCHours(); // KST 기준 현재 시(0~23)
    const todayKst = kstNow.toISOString().split('T')[0]; // "YYYY-MM-DD"

    console.warn(`[cron] send-notification: kstHour=${kstHour}, todayKst=${todayKst}`);

    // notification_hour가 현재 KST 시각과 일치하는 활성 유저 조회
    const targetUsers = await db
      .select({
        supabase_id: menoa_users.supabase_id,
      })
      .from(menoa_users)
      .where(eq(menoa_users.notification_hour, kstHour));

    if (targetUsers.length === 0) {
      console.warn(`[cron] send-notification: kstHour=${kstHour}에 설정된 유저 없음`);
      return Response.json({ ok: true, sent: 0, hour: kstHour });
    }

    const supabaseIds = targetUsers.map((u) => u.supabase_id);

    // 해당 유저 중 푸시 토큰이 있는 유저만 필터링
    const usersWithTokens = await db
      .selectDistinct({ supabase_id: menoa_push_tokens.author_supabase_id })
      .from(menoa_push_tokens)
      .where(inArray(menoa_push_tokens.author_supabase_id, supabaseIds));

    if (usersWithTokens.length === 0) {
      console.warn(`[cron] send-notification: 푸시 토큰 보유 유저 없음 (hour=${kstHour})`);
      return Response.json({ ok: true, sent: 0, hour: kstHour });
    }

    const tokenOwnerIds = usersWithTokens.map((u) => u.supabase_id);

    // 오늘 이미 증상 기록한 유저 제외
    const usersWithLogsToday = await db
      .selectDistinct({ supabase_id: menoa_symptom_logs.author_supabase_id })
      .from(menoa_symptom_logs)
      .where(
        and(
          eq(menoa_symptom_logs.log_date, todayKst),
          isNull(menoa_symptom_logs.deleted_at),
          inArray(menoa_symptom_logs.author_supabase_id, tokenOwnerIds),
        ),
      );

    const loggedTodaySet = new Set(usersWithLogsToday.map((u) => u.supabase_id));
    const finalTargets = tokenOwnerIds.filter((id) => !loggedTodaySet.has(id));

    if (finalTargets.length === 0) {
      console.warn(`[cron] send-notification: hour=${kstHour} 대상 유저 전원 오늘 기록 완료`);
      return Response.json({ ok: true, sent: 0, hour: kstHour });
    }

    // KST 날짜 포맷 (예: 4월 7일)
    const month = kstNow.getUTCMonth() + 1;
    const day = kstNow.getUTCDate();
    const dateLabel = `${month}월 ${day}일`;

    // 푸시 발송
    const results = await Promise.allSettled(
      finalTargets.map((supabase_id) =>
        sendPushNotification(
          supabase_id,
          '오늘 증상을 기록해보세요 💊',
          `${dateLabel} 오늘의 증상을 아직 기록하지 않았어요. 지금 바로 기록해보세요.`,
          '/symptoms/log',
        ),
      ),
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.warn(`[cron] send-notification: hour=${kstHour}, sent=${sent}, failed=${failed}`);

    return Response.json({ ok: true, sent, failed, hour: kstHour });
  } catch (err) {
    console.error('[cron] send-notification exception:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
