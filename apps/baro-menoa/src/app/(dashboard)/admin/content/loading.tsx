export default function AdminContentLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-36 bg-gray-200 rounded" />
        <div className="h-9 w-24 bg-gray-200 rounded-xl" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-xl" />
      ))}
    </div>
  );
}
