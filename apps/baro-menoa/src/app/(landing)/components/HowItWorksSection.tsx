const steps = [
  {
    step: '01',
    title: '소셜 로그인으로 가입',
    desc: '카카오, 구글, 네이버로 3초 만에 가입하세요. 별도 설정 없이 바로 사용 가능합니다.',
  },
  {
    step: '02',
    title: '갱년기 단계 설정',
    desc: '현재 갱년기 단계(전기/이행기/후기)를 선택하면 맞춤형 증상 목록이 준비됩니다.',
  },
  {
    step: '03',
    title: '매일 증상 기록',
    desc: '아프거나 불편한 증상을 탭 한 번으로 기록하세요. 심각도 1~5단계로 표현할 수 있습니다.',
  },
  {
    step: '04',
    title: '패턴 파악 & 대처',
    desc: '7일 추세로 내 몸의 패턴을 이해하고, 심할 때는 SOS 대처법을 활용해보세요.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4" style={{ backgroundColor: '#fdf6f7' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">이렇게 사용하세요</h2>
          <p className="mt-4 text-gray-500">복잡하지 않습니다. 딱 4단계면 충분합니다.</p>
        </div>

        <div className="space-y-6">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-5 items-start bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: '#800020' }}
              >
                {s.step}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-base">{s.title}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
