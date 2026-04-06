const features = [
  {
    icon: '📊',
    title: '증상 추적',
    desc: '안면홍조, 수면 장애, 관절 통증 등 27가지 증상을 1~5단계 심각도로 매일 기록하세요.',
    badge: '무료',
    badgeColor: '#6b7280',
  },
  {
    icon: '🆘',
    title: 'SOS 대처법',
    desc: '증상이 심할 때 즉각적으로 사용할 수 있는 4가지 과학적 완화 기법을 제공합니다.',
    badge: '무료',
    badgeColor: '#6b7280',
  },
  {
    icon: '📈',
    title: '7일 추세 분석',
    desc: '일주일 증상 변화를 한눈에 파악하고 패턴을 이해하세요.',
    badge: '무료',
    badgeColor: '#6b7280',
  },
  {
    icon: '😊',
    title: '기분 & 트리거 기록',
    desc: '수면, 카페인, 스트레스 등 트리거와 기분을 함께 기록해 증상의 원인을 찾으세요.',
    badge: 'Pro',
    badgeColor: '#800020',
  },
  {
    icon: '📋',
    title: 'PDF 리포트',
    desc: '월별·분기별 건강 리포트를 생성해 주치의와의 상담에 활용하세요.',
    badge: 'Pro',
    badgeColor: '#800020',
  },
  {
    icon: '🔔',
    title: '증상 알림',
    desc: '매일 정해진 시간에 증상 기록을 리마인드해드립니다.',
    badge: 'Pro',
    badgeColor: '#800020',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            갱년기 관리에 필요한 모든 것
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            의학적으로 검증된 방법으로 증상을 추적하고, 패턴을 이해하고, 더 나은 삶을 만들어가세요.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="text-3xl mb-4">{f.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-bold text-gray-800">{f.title}</h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                  style={{ backgroundColor: f.badgeColor }}
                >
                  {f.badge}
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
