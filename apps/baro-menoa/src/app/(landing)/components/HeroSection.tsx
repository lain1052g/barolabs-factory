import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="min-h-[88vh] flex flex-col items-center justify-center text-center px-4 py-20" style={{ backgroundColor: '#fdf6f7' }}>
      {/* 배지 */}
      <span
        className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full mb-8"
        style={{ backgroundColor: '#800020', color: 'white', opacity: 0.9 }}
      >
        🌸 갱년기 건강 파트너
      </span>

      {/* 헤드라인 */}
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 max-w-3xl leading-tight">
        갱년기, 이제<br />
        <span style={{ color: '#800020' }}>혼자 버티지 마세요</span>
      </h1>

      <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-xl leading-relaxed">
        증상 추적부터 SOS 대처법까지.<br />
        메노아가 갱년기의 모든 순간을 함께합니다.
      </p>

      {/* CTA */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
        <Link
          href="/login"
          className="px-8 py-3.5 text-base font-semibold text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          style={{ backgroundColor: '#800020' }}
        >
          무료로 시작하기
        </Link>
        <a
          href="#features"
          className="px-8 py-3.5 text-base font-medium text-gray-600 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors bg-white"
        >
          기능 보기 →
        </a>
      </div>

      <p className="mt-5 text-sm text-gray-400">
        신용카드 불필요 · 무료로 시작 · 언제든 취소 가능
      </p>

      {/* 앱 미리보기 카드 */}
      <div className="mt-16 w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 text-left">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-gray-400">오늘의 증상</p>
              <p className="font-bold text-gray-800 mt-0.5">2025년 4월 6일</p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: '#800020' }}
            >
              3
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { name: '안면홍조', severity: 4, color: '#ef4444' },
              { name: '수면 장애', severity: 3, color: '#f97316' },
              { name: '관절 통증', severity: 2, color: '#eab308' },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50">
                <span className="text-sm text-gray-700">{s.name}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: i <= s.severity ? s.color : '#e5e7eb' }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-4 w-full py-2.5 rounded-xl text-center text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #800020, #c0005a)' }}
          >
            🆘 SOS — 지금 바로 완화하기
          </div>
        </div>
      </div>
    </section>
  );
}
