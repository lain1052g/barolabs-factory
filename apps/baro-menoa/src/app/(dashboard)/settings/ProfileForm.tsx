'use client';

import { useActionState, useState } from 'react';
import { updateProfile, type UpdateProfileState } from '@/actions/settings';

type Props = {
  name: string | null;
  birth_year: number | null;
  menopause_stage: 'pre' | 'peri' | 'post' | null;
  last_period_date: string | null;
};

const STAGE_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: 'pre', label: '폐경 전기', desc: 'Pre-menopause' },
  { value: 'peri', label: '폐경 이행기', desc: 'Perimenopause' },
  { value: 'post', label: '폐경 후기', desc: 'Post-menopause' },
];

export function ProfileForm({ name, birth_year, menopause_stage, last_period_date }: Props) {
  const [selectedStage, setSelectedStage] = useState(menopause_stage ?? '');

  const [state, formAction, pending] = useActionState<UpdateProfileState, FormData>(
    updateProfile,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      {/* 저장 결과 메시지 */}
      {state?.success && (
        <div className="px-4 py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-medium">
          프로필이 저장되었습니다.
        </div>
      )}
      {state?.error && (
        <div className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm">
          {state.error}
        </div>
      )}

      {/* 이름 */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">이름</label>
        <input
          type="text"
          name="name"
          defaultValue={name ?? ''}
          placeholder="이름을 입력해주세요"
          maxLength={50}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 placeholder:text-gray-300"
          style={{ '--tw-ring-color': '#800020' } as React.CSSProperties}
        />
      </div>

      {/* 출생연도 */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">출생연도</label>
        <input
          type="number"
          name="birth_year"
          defaultValue={birth_year ?? ''}
          placeholder="예: 1970"
          min={1930}
          max={new Date().getFullYear() - 30}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 placeholder:text-gray-300"
          style={{ '--tw-ring-color': '#800020' } as React.CSSProperties}
        />
      </div>

      {/* 갱년기 단계 */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">갱년기 단계</label>
        <input type="hidden" name="menopause_stage" value={selectedStage} />
        <div className="grid grid-cols-3 gap-2">
          {STAGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedStage(opt.value)}
              className="py-2.5 px-2 rounded-xl border-2 text-left transition-all"
              style={{
                borderColor: selectedStage === opt.value ? '#800020' : '#e5e7eb',
                backgroundColor: selectedStage === opt.value ? '#fdf6f7' : 'white',
              }}
            >
              <p
                className="text-xs font-semibold"
                style={{ color: selectedStage === opt.value ? '#800020' : '#374151' }}
              >
                {opt.label}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 마지막 생리일 */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">마지막 생리일</label>
        <input
          type="date"
          name="last_period_date"
          defaultValue={last_period_date ?? ''}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': '#800020' } as React.CSSProperties}
        />
        <p className="text-[11px] text-gray-400 mt-1">입력하지 않아도 됩니다</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full h-12 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
        style={{ backgroundColor: '#800020' }}
      >
        {pending ? '저장 중...' : '프로필 저장'}
      </button>
    </form>
  );
}
