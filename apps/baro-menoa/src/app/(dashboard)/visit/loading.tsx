export default function VisitLoading() {
  return (
    <div className="px-4 py-6 space-y-4 animate-pulse">
      <div className="h-7 w-32 bg-gray-200 rounded" />
      <div className="flex gap-2">
        {[1,2,3,4].map(n => <div key={n} className="h-8 w-16 bg-gray-200 rounded-full" />)}
      </div>
      <div className="h-32 bg-gray-200 rounded-2xl" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="h-40 bg-gray-200 rounded-2xl" />
    </div>
  );
}
