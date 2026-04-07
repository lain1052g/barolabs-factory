export default function HealthLoading() {
  return (
    <div className="px-4 py-6 space-y-4 animate-pulse">
      <div className="h-7 w-24 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4].map(n => <div key={n} className="h-20 bg-gray-200 rounded-2xl" />)}
      </div>
    </div>
  );
}
