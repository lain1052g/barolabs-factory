export default function SupplementsLoading() {
  return (
    <div className="px-4 py-6 space-y-3 animate-pulse">
      <div className="h-7 w-28 bg-gray-200 rounded" />
      {[1,2,3].map(n => <div key={n} className="h-16 bg-gray-200 rounded-2xl" />)}
    </div>
  );
}
