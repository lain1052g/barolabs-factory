export default function AdminEvidenceLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-xl" />
      ))}
    </div>
  );
}
