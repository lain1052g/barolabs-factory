import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ backgroundColor: 'var(--c-brand-subtle)' }}>
      <div className="bg-white rounded-2xl p-8 shadow-sm space-y-4 max-w-sm w-full">
        <p className="text-5xl">🌿</p>
        <h1 className="text-xl font-bold text-gray-800">페이지를 찾을 수 없어요</h1>
        <p className="text-sm text-gray-500">주소를 다시 확인하거나 홈으로 돌아가세요.</p>
        <Link
          href="/dashboard"
          className="block w-full h-11 rounded-xl text-white text-sm font-medium flex items-center justify-center transition-opacity"
          style={{ backgroundColor: 'var(--c-brand)' }}
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
