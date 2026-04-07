export default function ContentDetailLoading() {
  return (
    <div className="px-4 py-6 space-y-5 max-w-lg mx-auto animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="h-4 w-16 bg-gray-100 rounded-full" />
      <div className="h-7 w-4/5 bg-gray-200 rounded-lg" />
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
        <div className="w-10 h-10 bg-gray-100 rounded-full" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 bg-gray-100 rounded w-full" />
        ))}
        <div className="h-4 bg-gray-100 rounded w-3/4" />
      </div>
    </div>
  );
}
