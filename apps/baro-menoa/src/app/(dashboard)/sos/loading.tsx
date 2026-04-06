export default function SosLoading() {
  return (
    <div className="px-4 py-6 space-y-4 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded" />
      <div className="h-40 bg-gray-200 rounded-2xl" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
