import { signInWithGoogle } from '@/actions/auth';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-sm p-8 bg-white dark:bg-[#3C3489] rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col items-center gap-2 mb-6">
          {/* 로고 */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="56" height="56">
            <rect width="1024" height="1024" rx="180" fill="#3C3489"/>
            <rect x="1.5" y="1.5" width="1021" height="1021" rx="179" fill="none" stroke="#7F77DD" strokeWidth="3"/>
            <ellipse cx="512" cy="362" rx="189" ry="430" transform="rotate(0,512,362)" fill="#AFA9EC"/>
            <ellipse cx="622" cy="437" rx="189" ry="430" transform="rotate(60,622,437)" fill="rgba(175,169,236,0.20)"/>
            <ellipse cx="622" cy="587" rx="189" ry="430" transform="rotate(120,622,587)" fill="#AFA9EC"/>
            <ellipse cx="512" cy="662" rx="189" ry="430" transform="rotate(180,512,662)" fill="#AFA9EC"/>
            <ellipse cx="402" cy="587" rx="189" ry="430" transform="rotate(240,402,587)" fill="rgba(175,169,236,0.20)"/>
            <ellipse cx="402" cy="437" rx="189" ry="430" transform="rotate(300,402,437)" fill="#AFA9EC"/>
            <circle cx="512" cy="512" r="90" fill="#3C3489"/>
            <circle cx="512" cy="512" r="68" fill="#AFA9EC"/>
            <circle cx="512" cy="512" r="38" fill="#3C3489"/>
          </svg>
          <h1 className="text-2xl font-bold text-[#EEEDFE]">날</h1>
          <p className="text-sm text-[#AFA9EC]">나를 날마다</p>
        </div>

        {/* Google */}
        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 transition-colors text-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 시작하기
          </button>
        </form>

        {/* Kakao */}
        <a
          href="/auth/kakao"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] rounded-xl text-sm font-medium text-[#191919] hover:bg-[#fdd800] transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.628 1.607 4.937 4.037 6.31-.168.615-.606 2.22-.695 2.565-.109.432.159.426.333.31.137-.09 2.173-1.473 3.052-2.076.41.057.83.087 1.273.087 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
          </svg>
          카카오로 시작하기
        </a>

        {/* Naver */}
        <a
          href="/auth/naver"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#03C75A] rounded-xl text-sm font-medium text-white hover:bg-[#02b351] transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
            <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
          </svg>
          네이버로 시작하기
        </a>
      </div>
    </div>
  );
}
