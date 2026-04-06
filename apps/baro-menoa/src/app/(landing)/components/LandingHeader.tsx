import Link from 'next/link';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: '#800020' }}
          >
            메
          </div>
          <span className="font-bold text-gray-900">메노아</span>
        </Link>

        <nav className="hidden md:flex gap-8 text-sm text-gray-500">
          <a href="#features" className="hover:text-gray-900 transition-colors">기능</a>
          <a href="#how-it-works" className="hover:text-gray-900 transition-colors">사용법</a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors">요금제</a>
        </nav>

        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            로그인
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-white rounded-lg font-medium"
            style={{ backgroundColor: '#800020' }}
          >
            무료로 시작
          </Link>
        </div>
      </div>
    </header>
  );
}
