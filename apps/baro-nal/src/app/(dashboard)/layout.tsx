import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminPlanToggle } from '@/components/AdminPlanToggle';
import { signOut } from '@/actions/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="bg-[#3C3489] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="28" height="28">
            <rect width="1024" height="1024" rx="180" fill="#3C3489"/>
            <ellipse cx="512" cy="362" rx="189" ry="430" transform="rotate(0,512,362)" fill="#AFA9EC"/>
            <ellipse cx="622" cy="437" rx="189" ry="430" transform="rotate(60,622,437)" fill="rgba(175,169,236,0.20)"/>
            <ellipse cx="622" cy="587" rx="189" ry="430" transform="rotate(120,622,587)" fill="#AFA9EC"/>
            <ellipse cx="512" cy="662" rx="189" ry="430" transform="rotate(180,512,662)" fill="#AFA9EC"/>
            <ellipse cx="402" cy="587" rx="189" ry="430" transform="rotate(240,402,587)" fill="rgba(175,169,236,0.20)"/>
            <ellipse cx="402" cy="437" rx="189" ry="430" transform="rotate(300,402,437)" fill="#AFA9EC"/>
            <circle cx="512" cy="512" r="90" fill="#3C3489"/>
            <circle cx="512" cy="512" r="68" fill="#AFA9EC"/>
            <circle cx="512" cy="512" r="38" fill="#3C3489"/>
          </svg>
          <span className="font-bold text-[#EEEDFE]">날</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#AFA9EC]">{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-xs text-[#AFA9EC] hover:text-[#EEEDFE]">
              로그아웃
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
      <AdminPlanToggle />
    </div>
  );
}
