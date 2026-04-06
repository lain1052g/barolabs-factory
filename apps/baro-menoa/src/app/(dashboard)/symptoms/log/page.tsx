import { getSymptomCategories, getAllSymptoms, getSymptomLogsByDate } from '@/actions/symptoms';
import { SymptomLogForm } from '@/components/symptoms/SymptomLogForm';
import Link from 'next/link';

export default async function SymptomLogPage() {
  const today = new Date().toISOString().split('T')[0];

  const [categories, symptoms, existingLogs] = await Promise.all([
    getSymptomCategories(),
    getAllSymptoms(),
    getSymptomLogsByDate(today),
  ]);

  if (categories.length === 0) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-20">
          <p className="text-gray-400">증상 데이터가 없습니다.</p>
          <p className="text-xs text-gray-300 mt-1">관리자가 시드 데이터를 먼저 실행해야 합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/symptoms" className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">오늘의 증상 기록</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
            {existingLogs.length > 0 && ` · ${existingLogs.length}개 기록됨`}
          </p>
        </div>
      </div>

      <SymptomLogForm
        categories={categories}
        symptoms={symptoms}
        existingLogs={existingLogs}
        date={today}
      />
    </div>
  );
}
