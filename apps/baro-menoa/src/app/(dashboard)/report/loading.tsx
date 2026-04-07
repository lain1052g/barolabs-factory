export default function WeeklyReportLoading() {
  return (
    <div className="px-4 py-6 space-y-4 max-w-md mx-auto animate-pulse">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>

      {/* 탭 스켈레톤 */}
      <div className="flex gap-2">
        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
      </div>

      {/* 기간 스켈레톤 */}
      <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded" />

      {/* 요약 카드 3개 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      </div>

      {/* Top 증상 스켈레톤 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none space-y-3">
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="h-4 w-12 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full" />
          </div>
        ))}
      </div>

      {/* 일별 테이블 스켈레톤 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm dark:shadow-none space-y-3">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex gap-4 py-1">
            <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-4 flex-1 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-4 w-8 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
