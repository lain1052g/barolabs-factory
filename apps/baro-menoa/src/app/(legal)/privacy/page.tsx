import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 | 메노아',
};

export default function PrivacyPage() {
  return (
    <div className="text-gray-700">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
      <p className="text-xs text-gray-400 mb-8">시행일: 2025년 1월 1일 | 운영사: 바로랩스</p>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">1. 수집하는 개인정보 항목</h2>
        <p className="text-sm leading-relaxed mb-3">
          메노아는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.
        </p>
        <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
          <li><strong>소셜 로그인 정보:</strong> 이름, 이메일 주소 (Google, 카카오, 네이버 제공)</li>
          <li><strong>건강 기록:</strong> 갱년기 증상 종류, 심각도, 일자별 기록, 노트</li>
          <li><strong>트리거 정보:</strong> 수면 시간, 카페인 섭취 여부, 스트레스 수준, 운동 여부</li>
          <li><strong>프로필 정보:</strong> 출생연도, 갱년기 단계, 마지막 생리일 (이용자가 직접 입력)</li>
          <li><strong>기기 정보:</strong> 푸시 알림 수신을 위한 FCM 토큰 (알림 동의 시에만 수집)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">2. 개인정보 수집 및 이용 목적</h2>
        <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
          <li>갱년기 증상 추적 및 건강 관리 서비스 제공</li>
          <li>맞춤형 증상 분석 및 트리거 리포트 생성</li>
          <li>서비스 개선, 오류 수정 및 사용성 분석</li>
          <li>이용자 식별 및 로그인 관리</li>
          <li>푸시 알림 발송 (이용자가 동의한 경우에 한함)</li>
          <li>유료 서비스 결제 및 고객 지원</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">3. 개인정보 보유 및 이용 기간</h2>
        <p className="text-sm leading-relaxed">
          회원 탈퇴 시까지 보유하며, 탈퇴 즉시 모든 개인정보 및 건강 기록을 삭제합니다.
          단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
        </p>
        <ul className="text-sm leading-relaxed space-y-1 list-disc list-inside mt-3">
          <li>전자상거래 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
          <li>서비스 이용 기록: 3개월 (통신비밀보호법)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">4. 개인정보 제3자 제공</h2>
        <p className="text-sm leading-relaxed">
          회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
          다만 다음의 경우에는 예외로 합니다.
        </p>
        <ul className="text-sm leading-relaxed space-y-1 list-disc list-inside mt-3">
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령의 규정에 의거하거나 수사기관의 적법한 요청이 있는 경우</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">5. 개인정보 처리 위탁</h2>
        <p className="text-sm leading-relaxed mb-3">
          회사는 서비스 제공을 위해 아래 업체에 개인정보 처리를 위탁합니다.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-700">수탁업체</th>
                <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-700">위탁 업무</th>
                <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-700">보유 기간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-3 py-2">Supabase Inc.</td>
                <td className="border border-gray-200 px-3 py-2">회원 인증 및 데이터 저장</td>
                <td className="border border-gray-200 px-3 py-2">회원 탈퇴 시</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="border border-gray-200 px-3 py-2">Google Firebase</td>
                <td className="border border-gray-200 px-3 py-2">푸시 알림 발송</td>
                <td className="border border-gray-200 px-3 py-2">동의 철회 시</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">Vercel Inc.</td>
                <td className="border border-gray-200 px-3 py-2">서비스 호스팅</td>
                <td className="border border-gray-200 px-3 py-2">계약 종료 시</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="border border-gray-200 px-3 py-2">Resend Inc.</td>
                <td className="border border-gray-200 px-3 py-2">이메일 발송</td>
                <td className="border border-gray-200 px-3 py-2">발송 완료 후</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">6. 개인정보의 파기</h2>
        <p className="text-sm leading-relaxed">
          회원 탈퇴 또는 법령에 정한 보유 기간이 도래한 경우, 해당 개인정보를 지체 없이 파기합니다.
          전자적 파일 형태의 정보는 복구 불가능한 방법으로 영구 삭제하며,
          종이 문서의 경우 분쇄기를 이용하여 파기합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">7. 정보주체의 권리</h2>
        <p className="text-sm leading-relaxed mb-3">이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
        <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
          <li>개인정보 열람, 수정, 삭제 요청 권리</li>
          <li>개인정보 처리 정지 요청 권리</li>
          <li>동의 철회 권리 (서비스 탈퇴 시 즉시 처리)</li>
        </ul>
        <p className="text-sm leading-relaxed mt-3">
          권리 행사는 앱 내 설정 &gt; 계정 삭제 기능을 통해 직접 처리하거나,
          아래 개인정보 보호책임자 이메일로 문의하시기 바랍니다.
          회사는 요청 접수 후 10일 이내에 처리합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">8. 개인정보 보호책임자</h2>
        <div className="text-sm leading-relaxed bg-gray-50 rounded-xl p-4 space-y-1">
          <p><strong>회사명:</strong> 바로랩스</p>
          <p><strong>담당 부서:</strong> 서비스 운영팀</p>
          <p>
            <strong>이메일:</strong>{' '}
            <a href="mailto:privacy@barolabs.kr" className="text-blue-600 underline">
              privacy@barolabs.kr
            </a>
          </p>
          <p className="text-xs text-gray-500 pt-1">
            개인정보 침해에 관한 신고 또는 상담은 개인정보분쟁조정위원회(www.kopico.go.kr),
            개인정보침해신고센터(privacy.kisa.or.kr)에 문의하실 수 있습니다.
          </p>
        </div>
      </section>

      <div className="mt-10 pt-6 border-t border-gray-100 text-xs text-gray-400 space-y-1">
        <p>본 방침은 2025년 1월 1일부터 시행됩니다.</p>
        <p>바로랩스 | support@barolabs.kr</p>
      </div>
    </div>
  );
}
