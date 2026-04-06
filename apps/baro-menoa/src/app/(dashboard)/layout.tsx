import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { AdminPlanToggle } from '@/components/AdminPlanToggle';
import { InstallBanner } from '@/components/InstallBanner';
import { db } from '@/db';
import { menoa_users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select({ menopause_stage: menoa_users.menopause_stage })
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);

  if (!dbUser?.menopause_stage) redirect('/onboarding');

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main className="max-w-lg mx-auto pb-20">
        {children}
      </main>
      <BottomNav />
      <InstallBanner />
      <AdminPlanToggle />
    </div>
  );
}
