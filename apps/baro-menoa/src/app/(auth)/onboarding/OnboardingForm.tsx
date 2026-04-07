'use client';

import { useActionState } from 'react';
import { saveOnboarding } from '@/actions/onboarding';

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(saveOnboarding, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{state.error}</p>
      )}

      {/* 갱년기 단계 */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">현재 단계를 선택해주세요</p>

        {[
          { value: 'pre', label: '폐경 전기', desc: '생리가 규칙적이지만 증상이 시작되는 시기' },
          { value: 'peri', label: '폐경 이행기 (갱년기)', desc: '생리 불규칙, 안면홍조, 수면 장애 등 증상 경험' },
          { value: 'post', label: '폐경 후기', desc: '마지막 생리 후 12개월 이상 경과' },
        ].map(({ value, label, desc }, i) => (
          <label key={value} className="block cursor-pointer">
            <input
              type="radio"
              name="menopause_stage"
              value={value}
              className="sr-only peer"
              defaultChecked={i === 1}
            />
            <div className="peer-checked:border-[var(--c-brand)] peer-checked:bg-[var(--c-brand)]/5 border-2 border-gray-200 rounded-2xl p-4 transition-all">
              <p className="font-semibold text-gray-800 text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* 마지막 생리일 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700" htmlFor="last_period_date">
          마지막 생리 시작일 <span className="font-normal text-gray-400">(선택)</span>
        </label>
        <input
          type="date"
          id="last_period_date"
          name="last_period_date"
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[var(--c-brand)]"
        />
      </div>

      {/* 이메일 수신 동의 */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="email_marketing"
          className="mt-0.5 w-4 h-4 accent-[var(--c-brand)]"
        />
        <span className="text-xs text-gray-500 leading-relaxed">
          주간 건강 요약 등 유용한 정보를 이메일로 받겠습니다. (선택)
        </span>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: 'var(--c-brand)' }}
      >
        {isPending ? '저장 중...' : '시작하기'}
      </button>

      <p className="text-xs text-center text-gray-400">이 정보는 맞춤형 건강 분석에만 사용됩니다</p>
    </form>
  );
}
