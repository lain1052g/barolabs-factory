export default function SettingsLoading() {
  return (
    <div className="px-4 py-6 space-y-4 animate-pulse">
      <div className="h-6 w-24 bg-gray-200 rounded" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="h-10 bg-gray-200 rounded-xl" />
    </div>
  );
}
