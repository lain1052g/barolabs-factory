import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { br045_nal_users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { setPlan } from '@/actions/settings';

export async function AdminPlanToggle() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? '').split(',');
  if (!user || !adminEmails.includes(user.email ?? '')) return null;

  const [dbUser] = await db
    .select({ plan: br045_nal_users.plan })
    .from(br045_nal_users)
    .where(eq(br045_nal_users.supabase_id, user.id))
    .limit(1);
  const currentPlan = dbUser?.plan ?? 'free';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <form action={setPlan.bind(null, currentPlan === 'free' ? 'pro' : 'free')}>
        <button
          type="submit"
          className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg hover:bg-gray-700"
        >
          플랜: {currentPlan} → {currentPlan === 'free' ? 'pro' : 'free'}
        </button>
      </form>
    </div>
  );
}
