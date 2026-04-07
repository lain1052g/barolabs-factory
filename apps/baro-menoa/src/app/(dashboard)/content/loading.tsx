export default function ContentLoading() {
  return (
    <div className="px-4 py-6 space-y-4">
      <div className="h-7 w-36 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 animate-pulse">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
