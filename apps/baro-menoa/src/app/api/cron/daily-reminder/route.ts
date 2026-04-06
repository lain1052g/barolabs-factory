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
    // KST 기준 오늘 날짜 (UTC+9)
    const nowUtc = new Date();
    const kstOffsetMs = 9 * 60 * 60 * 1000;
    const kstNow = new Date(nowUtc.getTime() + kstOffsetMs);
    const todayKst = kstNow.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // 푸시 토큰이 있는 유저 목록 조회 (중복 제거)
    const usersWithTokens = await db
      .selectDistinct({ supabase_id: menoa_push_tokens.author_supabase_id })
      .from(menoa_push_tokens);

    if (usersWithTokens.length === 0) {
      return Response.json({ ok: true, sent: 0 });
    }

    const supabaseIds = usersWithTokens.map((u) => u.supabase_id);

    // 오늘 증상 기록이 있는 유저의 supabase_id 목록
    const usersWithLogsToday = await db
      .selectDistinct({ supabase_id: menoa_symptom_logs.author_supabase_id })
      .from(menoa_symptom_logs)
      .where(
        and(
          eq(menoa_symptom_logs.log_date, todayKst),
          isNull(menoa_symptom_logs.deleted_at),
        ),
      );

    const loggedTodaySet = new Set(usersWithLogsToday.map((u) => u.supabase_id));

    // 오늘 기록이 없는 유저만 필터링
    const targets = supabaseIds.filter((id) => !loggedTodaySet.has(id));

    if (targets.length === 0) {
      console.warn('[cron] daily-reminder: 모든 유저가 오늘 증상을 기록했습니다.');
      return Response.json({ ok: true, sent: 0 });
    }

    // 유저 정보 조회 (알림 발송 가능 여부 확인 — 탈퇴 유저 제외)
    const activeUsers = await db
      .select({ supabase_id: menoa_users.supabase_id })
      .from(menoa_users)
      .where(inArray(menoa_users.supabase_id, targets));

    const results = await Promise.allSettled(
      activeUsers.map(({ supabase_id }) =>
        sendPushNotification(
          supabase_id,
          '오늘 증상을 기록해요 💊',
          '오늘 증상을 기록하지 않았어요 💊 지금 바로 기록해보세요.',
          '/dashboard',
        ),
      ),
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.warn(`[cron] daily-reminder: sent=${sent}, failed=${failed}`);

    return Response.json({ ok: true, sent, failed });
  } catch (err) {
    console.error('[cron] daily-reminder exception:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
