export default function SymptomLogLoading() {
  return (
    <div className="px-4 py-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-gray-200 rounded" />
        <div className="h-6 w-36 bg-gray-200 rounded" />
      </div>
      <div className="h-10 bg-gray-200 rounded-xl" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
    </div>
  );
}
