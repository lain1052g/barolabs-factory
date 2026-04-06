export default function TriggersLoading() {
  return (
    <div className="px-4 py-6 space-y-5">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-gray-100 animate-pulse" />
        <div className="space-y-1.5">
          <div className="w-28 h-5 rounded-lg bg-gray-100 animate-pulse" />
          <div className="w-40 h-3 rounded bg-gray-100 animate-pulse" />
        </div>
      </div>

      {/* 배너 스켈레톤 */}
      <div className="h-20 rounded-2xl bg-gray-50 animate-pulse" />

      {/* 그리드 스켈레톤 */}
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-50 animate-pulse" />
        ))}
      </div>

      {/* 버튼 스켈레톤 */}
      <div className="h-12 rounded-2xl bg-gray-100 animate-pulse" />
    </div>
  );
}
