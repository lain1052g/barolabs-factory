export default function MoodHistoryLoading() {
  return (
    <div className="px-4 py-6 space-y-5 animate-pulse">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-gray-100" />
        <div className="space-y-1.5">
          <div className="h-5 w-36 rounded bg-gray-100" />
          <div className="h-3 w-24 rounded bg-gray-100" />
        </div>
      </div>

      {/* 차트 스켈레톤 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="h-3 w-24 rounded bg-gray-100 mb-3" />
        <div className="flex items-end gap-1 h-16">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-gray-100"
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          ))}
        </div>
      </div>

      {/* 목록 스켈레톤 */}
      <div className="space-y-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="h-3 w-48 rounded bg-gray-100" />
            </div>
            <div className="flex-shrink-0 space-y-1">
              <div className="h-5 w-10 rounded-full bg-gray-100" />
              <div className="h-3 w-12 rounded bg-gray-100 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
