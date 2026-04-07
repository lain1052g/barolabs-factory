import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관 | 메노아',
};

export default function TermsPage() {
  return (
    <div className="text-gray-700">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">이용약관</h1>
      <p className="text-xs text-gray-400 mb-8">시행일: 2025년 1월 1일 | 운영사: 바로랩스</p>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">제1조 (목적)</h2>
        <p className="text-sm leading-relaxed">
          이 약관은 바로랩스(이하 &ldquo;회사&rdquo;)가 제공하는 메노아 서비스(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여
          회사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">제2조 (정의)</h2>
        <ul className="text-sm leading-relaxed space-y-2">
          <li>
            <strong>&ldquo;서비스&rdquo;</strong>란 회사가 운영하는 갱년기 증상 추적 및 건강 관리 앱
            &ldquo;메노아&rdquo;(menoa.barolabs.kr)를 의미합니다.
          </li>
          <li>
            <strong>&ldquo;이용자&rdquo;</strong>란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.
          </li>
          <li>
            <strong>&ldquo;회원&rdquo;</strong>이란 소셜 로그인을 통해 회원가입을 완료하고 서비스를 이용하는 자를 말합니다.
          </li>
          <li>
            <strong>&ldquo;유료 서비스(Pro)&rdquo;</strong>란 회사가 유료로 제공하는 추가 기능 플랜을 말합니다.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">제3조 (서비스 이용)</h2>
        <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
          <li>서비스는 갱년기·폐경기 건강 관리를 위한 참고 도구로 제공됩니다.</li>
          <li>서비스는 만 19세 이상 이용자를 대상으로 합니다.</li>
          <li>이용자는 서비스 이용 과정에서 정확한 정보를 입력할 책임이 있습니다.</li>
          <li>회사는 서비스 운영상 필요 시 기능을 변경·추가·중단할 수 있으며, 사전 공지합니다.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">제4조 (회원가입 및 탈퇴)</h2>
        <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
          <li>회원가입은 Google, 카카오, 네이버 소셜 로그인을 통해 이루어집니다.</li>
          <li>이용자는 언제든지 앱 내 설정 &gt; 계정 삭제 기능을 통해 탈퇴할 수 있습니다.</li>
          <li>탈퇴 시 회원의 모든 개인정보 및 건강 기록은 즉시 삭제됩니다.</li>
          <li>회사는 서비스 약관을 위반한 회원에 대해 이용을 제한하거나 강제 탈퇴 처리할 수 있습니다.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">제5조 (유료 서비스 및 환불)</h2>
        <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
          <li>유료 서비스(Pro 플랜)는 월 구독 방식으로 제공됩니다.</li>
          <li>결제 금액 및 결제 수단은 서비스 내 결제 페이지에서 확인할 수 있습니다.</li>
          <li>환불은 콘텐츠 이용 전 요청 시 전액 환불하며, 이용 후에는 남은 기간에 해당하는 금액을 일할 계산하여 환불합니다.</li>
          <li>환불 요청은 support@barolabs.kr로 문의하시기 바랍니다.</li>
          <li>관련 법령(전자상거래 등에서의 소비자보호에 관한 법률)에 따른 소비자 권리는 보장됩니다.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">제6조 (개인정보 보호)</h2>
        <p className="text-sm leading-relaxed">
          회사는 이용자의 개인정보를 &ldquo;개인정보처리방침&rdquo;에 따라 처리합니다.
          회사는 개인정보보호법 등 관련 법령을 준수하며, 이용자의 건강 기록은
          서비스 제공 목적으로만 사용됩니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">제7조 (면책 조항)</h2>
        <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
          <li>
            <strong>본 서비스는 의료 서비스가 아닙니다.</strong> 서비스에서 제공하는 정보는
            건강 관리 참고용이며, 의사의 진단이나 치료를 대체하지 않습니다.
          </li>
          <li>갱년기 증상에 대한 의료적 판단은 반드시 전문 의료진과 상담하시기 바랍니다.</li>
          <li>회사는 이용자가 서비스 정보를 근거로 내린 의료적 결정에 대해 책임을 지지 않습니다.</li>
          <li>회사는 천재지변, 서비스 장애 등 불가항력적 사유로 인한 손해에 대해 책임을 지지 않습니다.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">제8조 (준거법 및 관할)</h2>
        <p className="text-sm leading-relaxed">
          이 약관은 대한민국 법률을 준거법으로 합니다.
          서비스 이용과 관련한 분쟁은 대한민국 법원을 전속 관할 법원으로 합니다.
        </p>
      </section>

      <div className="mt-10 pt-6 border-t border-gray-100 text-xs text-gray-400 space-y-1">
        <p>시행일: 2025년 1월 1일</p>
        <p>바로랩스 | 문의: support@barolabs.kr</p>
      </div>
    </div>
  );
}
