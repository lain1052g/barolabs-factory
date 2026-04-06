export default function SymptomsLoading() {
  return (
    <div className="px-4 py-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-24 bg-gray-200 rounded" />
        <div className="h-9 w-24 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );
}
