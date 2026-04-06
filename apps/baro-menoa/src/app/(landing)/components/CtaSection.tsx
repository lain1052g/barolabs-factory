import Link from 'next/link';

export function CtaSection() {
  return (
    <section className="py-24 px-4" style={{ backgroundColor: '#fdf6f7' }}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-4xl mb-6">🌸</div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          오늘부터 시작해보세요
        </h2>
        <p className="mt-4 text-gray-500 text-lg">
          갱년기는 질병이 아닙니다. 올바른 관리로 더 건강하고 활기찬 삶이 가능합니다.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 text-base font-semibold text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            style={{ backgroundColor: '#800020' }}
          >
            지금 무료로 시작하기
          </Link>
        </div>
        <p className="mt-5 text-sm text-gray-400">
          카카오 · 구글 · 네이버로 3초 만에 가입
        </p>
      </div>
    </section>
  );
}
