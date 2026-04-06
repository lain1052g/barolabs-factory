import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: '#800020' }}
              >
                메
              </div>
              <span className="font-bold text-gray-800">메노아</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              갱년기 증상을 스마트하게 추적하고,<br />건강을 다시 찾아드립니다.
            </p>
          </div>

          <div className="flex gap-12 text-sm">
            <div>
              <p className="font-semibold text-gray-700 mb-3">서비스</p>
              <ul className="space-y-2 text-gray-500">
                <li><a href="#features" className="hover:text-gray-700">기능 소개</a></li>
                <li><a href="#pricing" className="hover:text-gray-700">요금제</a></li>
                <li><Link href="/login" className="hover:text-gray-700">시작하기</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-3">법적 고지</p>
              <ul className="space-y-2 text-gray-500">
                <li><Link href="/terms" className="hover:text-gray-700">이용약관</Link></li>
                <li><Link href="/privacy" className="hover:text-gray-700">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-gray-400">
          <p>© 2025 바로랩스. All rights reserved.</p>
          <p>문의: support@barolabs.kr</p>
        </div>
      </div>
    </footer>
  );
}
