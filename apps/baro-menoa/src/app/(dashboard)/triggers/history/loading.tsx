export default function TriggerHistoryLoading() {
  return (
    <div className="px-4 py-6 space-y-5 animate-pulse">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-gray-100" />
        <div className="space-y-1.5">
          <div className="h-5 w-44 rounded bg-gray-100" />
          <div className="h-3 w-24 rounded bg-gray-100" />
        </div>
      </div>

      {/* 카드 스켈레톤 */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* 날짜 헤더 */}
            <div className="px-4 py-2.5 bg-gray-50 flex items-center justify-between">
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="h-3 w-16 rounded bg-gray-100" />
            </div>
            {/* 배지 영역 */}
            <div className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-6 w-20 rounded-full bg-gray-100" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
