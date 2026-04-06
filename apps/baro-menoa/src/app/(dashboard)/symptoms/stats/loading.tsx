export default function StatsLoading() {
  return (
    <div className="px-4 py-6 space-y-4">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-28 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-5 w-16 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      {/* 요약 카드 스켈레톤 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
      </div>

      {/* 도넛차트 스켈레톤 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="h-4 w-36 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="flex gap-4 items-center">
          <div className="w-28 h-28 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-3/5" />
          </div>
        </div>
      </div>

      {/* Top 5 스켈레톤 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${80 - i * 10}%` }} />
                <div className="h-1.5 bg-gray-100 rounded animate-pulse" style={{ width: `${70 - i * 8}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 주별 추이 스켈레톤 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-20 h-3 bg-gray-100 rounded animate-pulse flex-shrink-0" />
              <div className="flex-1 h-2 bg-gray-100 rounded animate-pulse" />
              <div className="w-7 h-3 bg-gray-100 rounded animate-pulse flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
