export default function TermsPage() {
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      <h1 className="text-xl font-bold text-gray-900 mb-6">서비스 이용약관</h1>
      <p className="text-xs text-gray-400 mb-8">최종 수정일: 2025년 1월 1일</p>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">제1조 (목적)</h2>
        <p className="text-sm leading-relaxed">
          본 약관은 바로랩스(이하 "회사")가 제공하는 메노아 서비스(이하 "서비스")의 이용과 관련하여
          회사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">제2조 (정의)</h2>
        <p className="text-sm leading-relaxed">
          "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 자를 의미합니다.<br />
          "서비스"란 회사가 제공하는 갱년기 증상 추적 및 건강 관리 앱을 의미합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">제3조 (약관의 효력)</h2>
        <p className="text-sm leading-relaxed">
          본 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.
          회사는 관련 법령에 위배되지 않는 범위에서 약관을 변경할 수 있으며,
          변경 시 서비스 내 공지를 통해 7일 전에 안내합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">제4조 (서비스 이용)</h2>
        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1">
          <li>서비스는 성인(만 19세 이상) 여성을 대상으로 합니다.</li>
          <li>본 서비스는 의료 서비스가 아니며, 의사의 진료를 대체하지 않습니다.</li>
          <li>이용자는 서비스를 통해 기록된 건강 정보를 직접 관리할 책임이 있습니다.</li>
          <li>회사는 무료 플랜과 유료 플랜(Pro)을 제공합니다.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">제5조 (금지 행위)</h2>
        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1">
          <li>서비스의 비정상적인 이용 (자동화 도구, 크롤링 등)</li>
          <li>타인의 개인정보 무단 수집 또는 이용</li>
          <li>서비스의 안정적 운영을 방해하는 행위</li>
          <li>관련 법령을 위반하는 행위</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">제6조 (서비스 중단)</h2>
        <p className="text-sm leading-relaxed">
          회사는 시스템 점검, 장애 등의 사유로 서비스 제공을 일시적으로 중단할 수 있습니다.
          이 경우 사전에 공지하며, 불가피한 경우 사후에 공지합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">제7조 (면책 조항)</h2>
        <p className="text-sm leading-relaxed">
          본 서비스는 갱년기 관련 정보를 제공하는 참고용 서비스입니다.
          의료적 판단이나 치료를 위해서는 반드시 전문 의료진과 상담하시기 바랍니다.
          서비스 내 정보로 인한 의료적 결정에 대해 회사는 책임을 지지 않습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">제8조 (분쟁 해결)</h2>
        <p className="text-sm leading-relaxed">
          서비스 이용과 관련하여 분쟁이 발생한 경우, 대한민국 법률을 준거법으로 하며
          대한민국 법원을 관할 법원으로 합니다.
        </p>
      </section>

      <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
        <p>바로랩스 | 문의: support@barolabs.kr</p>
      </div>
    </div>
  );
}
