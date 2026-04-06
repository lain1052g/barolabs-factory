export default function MoodLoading() {
  return (
    <div className="px-4 py-6 space-y-5">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-gray-100 animate-pulse" />
        <div className="space-y-1.5">
          <div className="w-24 h-5 rounded-lg bg-gray-100 animate-pulse" />
          <div className="w-36 h-3 rounded bg-gray-100 animate-pulse" />
        </div>
      </div>

      {/* 이모지 선택 스켈레톤 */}
      <div className="flex justify-center gap-4 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
        ))}
      </div>

      {/* 바 스켈레톤 */}
      <div className="h-2 rounded-full bg-gray-100 animate-pulse mx-auto max-w-xs" />

      {/* 텍스트 영역 스켈레톤 */}
      <div className="h-24 rounded-xl bg-gray-50 animate-pulse" />

      {/* 버튼 스켈레톤 */}
      <div className="h-12 rounded-2xl bg-gray-100 animate-pulse" />
    </div>
  );
}
