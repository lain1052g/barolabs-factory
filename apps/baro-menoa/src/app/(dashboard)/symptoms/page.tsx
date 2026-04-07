import type { Metadata } from 'next';
import { getSymptomLogsByDateRange } from '@/actions/symptoms';
import Link from 'next/link';
import { SymptomsFilter } from './SymptomsFilter';
import { DeleteSymptomButton } from '@/components/DeleteSymptomButton';

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

  // 이번 달 캘린더 데이터
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=일
  const todayStr = now.toISOString().split('T')[0];
  const recordedSet = new Set(logs.map(l => l.log_date));
  const recordedThisMonth = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return { d, dateStr, recorded: recordedSet.has(dateStr), isToday: dateStr === todayStr };
  });
  const calendarCells = [...Array(firstDayOfWeek).fill(null), ...recordedThisMonth];
  const recordedCount = recordedThisMonth.filter(c => c.recorded).length;

  return (
    <div className="px-4 py-6 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">증상 기록</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/symptoms/stats"
            className="px-3 py-2 rounded-xl text-sm font-medium border"
            style={{ color: 'var(--c-brand)', borderColor: 'var(--c-brand-light)', backgroundColor: 'var(--c-brand-subtle)' }}
          >
            통계 보기
          </Link>
          <Link
            href="/symptoms/log"
            className="px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--c-brand)' }}
          >
            + 오늘 기록
          </Link>
        </div>
      </div>

      {/* 이번 달 캘린더 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {now.toLocaleDateString('ko-KR', { month: 'long' })} 기록
          </p>
          <p className="text-xs text-gray-400">{recordedCount}일 / {daysInMonth}일</p>
        </div>
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-1">
          {['일', '월', '화', '수', '목', '금', '토'].map(d => (
            <p key={d} className="text-center text-[9px] text-gray-300 dark:text-gray-600 py-0.5">{d}</p>
          ))}
        </div>
        {/* 날짜 셀 */}
        <div className="grid grid-cols-7 gap-y-1">
          {calendarCells.map((cell, i) => (
            <div key={i} className="flex flex-col items-center py-0.5">
              {cell ? (
                <>
                  <span
                    className="text-[10px] leading-none"
                    style={{
                      color: cell.isToday ? 'var(--c-brand)' : '#9ca3af',
                      fontWeight: cell.isToday ? 700 : 400,
                    }}
                  >
                    {cell.d}
                  </span>
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-0.5"
                    style={{ backgroundColor: cell.recorded ? 'var(--c-brand)' : 'transparent' }}
                  />
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* 필터 탭 */}
      <SymptomsFilter current={filter} />

      {/* 빈 상태 */}
      {dates.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm dark:shadow-none text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">아직 기록된 증상이 없어요</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">첫 증상을 기록해보세요!</p>
          <Link
            href="/symptoms/log"
            className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--c-brand)' }}
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
              <div key={date} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
                {/* 날짜 헤더 */}
                <div
                  className="px-4 py-2.5 flex items-center justify-between"
                  style={{ backgroundColor: isToday ? '#fdf6f7' : '#fafafa' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: isToday ? 'var(--c-brand)' : '#374151' }}
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
                    <Link
                      href={`/symptoms/log?date=${date}`}
                      className="text-xs font-medium px-2 py-0.5 rounded-lg"
                      style={{ color: 'var(--c-brand)', backgroundColor: isToday ? 'white' : '#f3f4f6' }}
                    >
                      수정하기
                    </Link>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{dayLogs.length}개 기록</span>
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
                <div className="px-4 py-1 divide-y divide-gray-50 dark:divide-gray-700">
                  {dayLogs.map(log => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between py-2.5"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {log.symptom_name}
                        </span>
                        {log.note && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                            {log.note}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
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
                        <DeleteSymptomButton id={log.id} />
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
