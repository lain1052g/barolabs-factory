export default function HealthHistoryLoading() {
  return (
    <div className="px-4 py-6 space-y-3 animate-pulse">
      <div className="h-7 w-24 bg-gray-200 rounded" />
      {[1,2,3,4].map(n => <div key={n} className="h-20 bg-gray-200 rounded-2xl" />)}
    </div>
  );
}
