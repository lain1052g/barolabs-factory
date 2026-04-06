export default function PrivacyPage() {
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      <h1 className="text-xl font-bold text-gray-900 mb-6">개인정보처리방침</h1>
      <p className="text-xs text-gray-400 mb-8">최종 수정일: 2025년 1월 1일</p>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">1. 수집하는 개인정보</h2>
        <p className="text-sm leading-relaxed mb-2">
          메노아는 서비스 제공을 위해 다음과 같은 정보를 수집합니다.
        </p>
        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1">
          <li><strong>소셜 로그인 정보:</strong> 이름, 이메일 주소 (Google, Kakao, Naver 제공)</li>
          <li><strong>건강 기록:</strong> 갱년기 증상 기록, 증상 심각도, 노트</li>
          <li><strong>트리거 정보:</strong> 수면 시간, 카페인 섭취, 스트레스 수준, 운동 여부</li>
          <li><strong>기기 정보:</strong> 푸시 알림 토큰 (알림 서비스 이용 시)</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">2. 수집 목적</h2>
        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1">
          <li>갱년기 증상 추적 및 건강 관리 서비스 제공</li>
          <li>맞춤형 분석 및 리포트 생성</li>
          <li>서비스 개선 및 오류 수정</li>
          <li>푸시 알림 발송 (동의한 경우)</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">3. 보유 기간</h2>
        <p className="text-sm leading-relaxed">
          회원 탈퇴 시까지 보유하며, 탈퇴 즉시 모든 개인정보 및 건강 기록을 삭제합니다.
          단, 관련 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보관합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">4. 제3자 제공</h2>
        <p className="text-sm leading-relaxed">
          회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
          단, 다음의 경우는 예외입니다.
        </p>
        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1">
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령의 규정에 의거하거나 수사기관의 요청이 있는 경우</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">5. 위탁 처리</h2>
        <div className="text-sm leading-relaxed">
          <table className="w-full border-collapse text-xs mt-2">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-2 py-1.5 text-left">수탁업체</th>
                <th className="border border-gray-200 px-2 py-1.5 text-left">위탁 업무</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-2 py-1.5">Supabase Inc.</td>
                <td className="border border-gray-200 px-2 py-1.5">회원 인증 및 데이터 저장</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1.5">Google Firebase</td>
                <td className="border border-gray-200 px-2 py-1.5">푸시 알림 발송</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1.5">Vercel Inc.</td>
                <td className="border border-gray-200 px-2 py-1.5">서비스 호스팅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">6. 이용자 권리</h2>
        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1">
          <li>개인정보 열람, 수정, 삭제 요청 권리</li>
          <li>동의 철회 권리 (서비스 탈퇴 시 즉시 처리)</li>
          <li>개인정보 처리 정지 요청 권리</li>
        </ul>
        <p className="text-sm leading-relaxed mt-2">
          권리 행사는 설정 &gt; 로그아웃 후 계정 삭제 기능을 통해 직접 처리하거나,
          support@barolabs.kr로 문의하시기 바랍니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">7. 쿠키 및 분석 도구</h2>
        <p className="text-sm leading-relaxed">
          서비스 개선을 위해 Google Analytics 4를 사용합니다.
          수집되는 데이터는 익명화되며, 개인 식별에 사용되지 않습니다.
          브라우저 설정을 통해 쿠키 수집을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">8. 개인정보 보호책임자</h2>
        <div className="text-sm leading-relaxed">
          <p>성명: 바로랩스 개인정보 보호팀</p>
          <p>이메일: privacy@barolabs.kr</p>
        </div>
      </section>

      <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
        <p>본 방침은 2025년 1월 1일부터 시행됩니다.</p>
        <p className="mt-1">바로랩스 | support@barolabs.kr</p>
      </div>
    </div>
  );
}
