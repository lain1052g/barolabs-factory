import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { gt } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await db
      .update(menoa_users)
      .set({ upload_count: 0, updated_at: new Date() })
      .where(gt(menoa_users.upload_count, 0));

    const reset = (result as unknown as { rowCount?: number }).rowCount ?? 0;

    console.warn(`[cron] reset-upload-count: reset=${reset}`);

    return Response.json({ ok: true, reset });
  } catch (err) {
    console.error('[cron] reset-upload-count exception:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
