import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded text-white"
            style={{ backgroundColor: '#800020' }}
          >
            ADMIN
          </span>
          <span className="text-sm font-semibold text-gray-700">메노아 관리자</span>
          <span className="text-xs text-gray-400 ml-auto">{user.email}</span>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
