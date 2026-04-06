import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendWeeklyReport } from '@/actions/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Pro 유저 전체 조회
    const proUsers = await db
      .select({ supabase_id: menoa_users.supabase_id })
      .from(menoa_users)
      .where(eq(menoa_users.plan, 'pro'));

    const results = await Promise.allSettled(
      proUsers.map(({ supabase_id }) => sendWeeklyReport(supabase_id)),
    );

    const sent = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped,
    ).length;
    const skipped = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success && r.value.skipped,
    ).length;
    const failed = results.filter(
      (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success),
    ).length;

    console.warn(`[cron] weekly-report: sent=${sent}, skipped=${skipped}, failed=${failed}`);

    return Response.json({ ok: true, sent, skipped, failed });
  } catch (err) {
    console.error('[cron] weekly-report exception:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
