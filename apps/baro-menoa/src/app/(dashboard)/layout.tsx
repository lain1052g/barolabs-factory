import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { AdminPlanToggle } from '@/components/AdminPlanToggle';
import { InstallBanner } from '@/components/InstallBanner';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6f7' }}>
      <main className="max-w-lg mx-auto pb-20">
        {children}
      </main>
      <BottomNav />
      <InstallBanner />
      <AdminPlanToggle />
    </div>
  );
}
