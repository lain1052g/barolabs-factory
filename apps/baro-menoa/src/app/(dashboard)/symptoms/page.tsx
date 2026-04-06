import { getSymptomLogsByDate, getRecentSymptomSummary } from '@/actions/symptoms';
import Link from 'next/link';

export const revalidate = 30;

const SEVERITY_COLOR = ['', '#22c55e', '#84cc16', '#f59e0b', '#ef4444', '#dc2626'];

export default async function SymptomsPage() {
  const today = new Date().toISOString().split('T')[0];
  const [todayLogs, summary] = await Promise.all([
    getSymptomLogsByDate(today),
    getRecentSymptomSummary(14),
  ]);

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">증상 기록</h1>
        <Link
          href="/symptoms/log"
          className="px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: '#800020' }}
        >
          + 오늘 기록
        </Link>
      </div>

      {/* 오늘의 증상 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500 mb-3">오늘</p>
        {todayLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">오늘 기록된 증상이 없습니다</p>
            <Link
              href="/symptoms/log"
              className="inline-block mt-3 px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ backgroundColor: '#800020' }}
            >
              지금 기록하기
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {todayLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-800">{log.symptom_name}</span>
                  {log.note && <p className="text-xs text-gray-400 mt-0.5">{log.note}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <div key={n} className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: n <= log.severity ? SEVERITY_COLOR[log.severity] : '#e5e7eb' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 최근 2주 히스토리 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500 mb-3">최근 14일 기록</p>
        {summary.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">아직 기록이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {summary.map(entry => (
              <div key={entry.log_date} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(entry.log_date + 'T00:00:00').toLocaleDateString('ko-KR', {
                      month: 'short', day: 'numeric', weekday: 'short',
                    })}
                  </p>
                  <p className="text-xs text-gray-400">{Number(entry.count)}개 증상 기록</p>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <div key={n} className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: n <= Number(entry.max_severity) ? SEVERITY_COLOR[Number(entry.max_severity)] : '#e5e7eb' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
