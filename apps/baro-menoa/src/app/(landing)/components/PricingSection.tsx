import Link from 'next/link';

const freeFeatures = [
  '27가지 증상 추적',
  '하루 10개 증상 기록',
  '7일 추세 차트',
  'SOS 대처법 4가지',
  '소셜 로그인 (카카오/구글/네이버)',
];

const proFeatures = [
  '증상 기록 무제한 (30개+)',
  '기분 & 트리거 기록',
  'PDF 월간/분기 리포트',
  '증상 알림 (푸시)',
  '우선 고객 지원',
  'Free 플랜의 모든 기능',
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">간단한 요금제</h2>
          <p className="mt-4 text-gray-500">무료로 시작하고, 필요할 때 업그레이드하세요.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="rounded-3xl border-2 border-gray-100 bg-white p-8">
            <h3 className="text-xl font-bold text-gray-800">Free</h3>
            <div className="mt-3">
              <span className="text-4xl font-bold text-gray-900">₩0</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">영원히 무료</p>

            <ul className="mt-7 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span style={{ color: '#800020' }} className="mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="mt-8 block w-full py-3 rounded-xl text-center text-sm font-semibold border-2 border-gray-200 text-gray-700 hover:border-gray-300 transition-colors"
            >
              무료로 시작
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-3xl border-2 p-8 relative text-white" style={{ borderColor: '#800020', backgroundColor: '#800020' }}>
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1.5 rounded-full bg-white" style={{ color: '#800020' }}>
              출시 예정
            </span>
            <h3 className="text-xl font-bold">Pro</h3>
            <div className="mt-3">
              <span className="text-4xl font-bold">₩4,900</span>
            </div>
            <p className="text-sm opacity-70 mt-1">월 구독</p>

            <ul className="mt-7 space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm opacity-90">
                  <span className="mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8 w-full py-3 rounded-xl text-center text-sm font-semibold bg-white/20 border border-white/30">
              사업자 등록 후 오픈 예정
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Pro 플랜은 사업자 등록 완료 후 결제 기능이 활성화됩니다.
        </p>
      </div>
    </section>
  );
}
