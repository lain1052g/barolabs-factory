import type { Metadata } from 'next';
import { getSymptomLogsByDateRange } from '@/actions/symptoms';
import Link from 'next/link';
import { SymptomsFilter } from './SymptomsFilter';

export const metadata: Metadata = {
  title: '증상 기록 | 메노아',
  description: '기간별 갱년기 증상 기록을 확인하고 PDF/Excel로 내보내세요.',
};

export const revalidate = 30;

type FilterRange = 'week' | 'month' | 'all';

const SEVERITY_COLOR = ['', '#22c55e', '#84cc16', '#f59e0b', '#ef4444', '#dc2626'];

function getDateRange(filter: FilterRange): { from: string; to: string } {
  const to = new Date().toISOString().split('T')[0];
  const from = new Date();
  if (filter === 'week') {
    from.setDate(from.getDate() - 6);
  } else if (filter === 'month') {
    from.setDate(from.getDate() - 29);
  } else {
    from.setFullYear(from.getFullYear() - 1);
  }
  return { from: from.toISOString().split('T')[0], to };
}

export default async function SymptomsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: rawFilter } = await searchParams;
  const filter: FilterRange =
    rawFilter === 'week' || rawFilter === 'all' ? rawFilter : 'month';

  const { from, to } = getDateRange(filter);
  const logs = await getSymptomLogsByDateRange(from, to);

  // 날짜별 그룹핑
  const grouped = logs.reduce<Record<string, typeof logs>>((acc, log) => {
    const key = log.log_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});

  // 날짜 내림차순 정렬
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="px-4 py-6 space-y-4">
      {/* 헤더 */}
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

      {/* 필터 탭 */}
      <SymptomsFilter current={filter} />

      {/* 빈 상태 */}
      {dates.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-600 font-medium mb-1">아직 기록된 증상이 없어요</p>
          <p className="text-sm text-gray-400 mb-4">첫 증상을 기록해보세요!</p>
          <Link
            href="/symptoms/log"
            className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: '#800020' }}
          >
            첫 증상 기록하기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {dates.map(date => {
            const dayLogs = grouped[date];
            const maxSev = Math.max(...dayLogs.map(l => l.severity));
            const d = new Date(date + 'T00:00:00');
            const isToday = date === new Date().toISOString().split('T')[0];

            return (
              <div key={date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* 날짜 헤더 */}
                <div
                  className="px-4 py-2.5 flex items-center justify-between"
                  style={{ backgroundColor: isToday ? '#fdf6f7' : '#fafafa' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: isToday ? '#800020' : '#374151' }}
                    >
                      {isToday ? '오늘 · ' : ''}
                      {d.toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{dayLogs.length}개 기록</span>
                    {/* 최고 심각도 도트 */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <div
                          key={n}
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              n <= maxSev ? SEVERITY_COLOR[maxSev] : '#e5e7eb',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 증상 목록 */}
                <div className="px-4 py-1 divide-y divide-gray-50">
                  {dayLogs.map(log => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between py-2.5"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-800">
                          {log.symptom_name}
                        </span>
                        {log.note && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {log.note}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <div
                            key={n}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                n <= log.severity
                                  ? SEVERITY_COLOR[log.severity]
                                  : '#e5e7eb',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
