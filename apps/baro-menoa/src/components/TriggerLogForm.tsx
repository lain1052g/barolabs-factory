'use client';

import { useState, useTransition } from 'react';
import { saveTriggerLog } from '@/actions/triggers';
import type { MenoaTriggerLog } from '@/db/schema';

// Trigger items map to DB fields via category
// "음식" → caffeine_cups increase
// "음주" → alcohol_units
// "스트레스" → stress_level (1~5)
// "날씨" → note 태그
// "수면부족" → sleep_minutes (< 6h = 360min)
// "운동" → exercise_minutes
// "기타" → note 태그

type TriggerCategory = {
  key: string;
  label: string;
  emoji: string;
  description: string;
};

const TRIGGER_CATEGORIES: TriggerCategory[] = [
  { key: 'caffeine', label: '카페인/음식', emoji: '☕', description: '커피·음료·특정 음식' },
  { key: 'alcohol', label: '음주', emoji: '🍷', description: '알코올 섭취' },
  { key: 'stress', label: '스트레스', emoji: '😤', description: '심리적 스트레스' },
  { key: 'weather', label: '날씨', emoji: '🌡️', description: '온도·습도 변화' },
  { key: 'sleep', label: '수면 부족', emoji: '😴', description: '6시간 미만 수면' },
  { key: 'exercise', label: '운동', emoji: '🏃', description: '격렬한 신체 활동' },
  { key: 'other', label: '기타', emoji: '📝', description: '그 외 원인' },
];

type Props = {
  existing: MenoaTriggerLog | null;
  date: string;
};

export function TriggerLogForm({ existing, date }: Props) {
  // Selected trigger categories (multi-select)
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (!existing) return new Set();
    const s = new Set<string>();
    if (existing.caffeine_cups > 0) s.add('caffeine');
    if (existing.alcohol_units > 0) s.add('alcohol');
    if (existing.stress_level !== null) s.add('stress');
    if (existing.exercise_minutes > 0) s.add('exercise');
    // sleep deprivation: < 360 minutes (6h) or stored value shows issue
    if (existing.sleep_minutes > 0 && existing.sleep_minutes < 360) s.add('sleep');
    if (existing.note?.includes('#날씨')) s.add('weather');
    if (existing.note?.includes('#기타')) s.add('other');
    return s;
  });

  // Detail fields
  const [caffeineCups, setCaffeineCups] = useState(existing?.caffeine_cups ?? 1);
  const [alcoholUnits, setAlcoholUnits] = useState(existing?.alcohol_units ?? 1);
  const [stressLevel, setStressLevel] = useState(existing?.stress_level ?? 3);
  const [exerciseMinutes, setExerciseMinutes] = useState(existing?.exercise_minutes ?? 30);
  const [note, setNote] = useState(() => {
    if (!existing?.note) return '';
    return existing.note.replace(/#날씨/g, '').replace(/#기타/g, '').trim();
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function toggleCategory(key: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setSuccess(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Build note with weather/other tags
    const tags: string[] = [];
    if (selected.has('weather')) tags.push('#날씨');
    if (selected.has('other')) tags.push('#기타');
    const fullNote = [note.trim(), ...tags].filter(Boolean).join(' ');

    startTransition(async () => {
      const result = await saveTriggerLog({
        caffeine_cups: selected.has('caffeine') ? caffeineCups : 0,
        alcohol_units: selected.has('alcohol') ? alcoholUnits : 0,
        sleep_minutes: selected.has('sleep') ? 300 : 0, // 5h = 300min (수면 부족 표시)
        stress_level: selected.has('stress') ? stressLevel : null,
        exercise_minutes: selected.has('exercise') ? exerciseMinutes : 0,
        note: fullNote || undefined,
        log_date: date,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 트리거 선택 */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          오늘 해당하는 트리거를 선택하세요 <span className="text-gray-400 font-normal">(복수 선택 가능)</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TRIGGER_CATEGORIES.map(cat => {
            const isSelected = selected.has(cat.key);
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => toggleCategory(cat.key)}
                className="flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: isSelected ? 'var(--c-brand)' : '#e5e7eb',
                  backgroundColor: isSelected ? '#fdf6f7' : 'white',
                }}
              >
                <span className="text-xl leading-none mt-0.5">{cat.emoji}</span>
                <div>
                  <p
                    className="text-sm font-semibold leading-tight"
                    style={{ color: isSelected ? 'var(--c-brand)' : '#374151' }}
                  >
                    {cat.label}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{cat.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 세부 입력: 카페인 */}
      {selected.has('caffeine') && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
          <p className="text-sm font-medium text-gray-700">카페인 음료 잔 수</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCaffeineCups(Math.max(1, caffeineCups - 1))}
              className="w-9 h-9 rounded-full border border-gray-200 text-gray-600 font-bold text-lg flex items-center justify-center"
            >
              −
            </button>
            <span className="text-2xl font-bold w-8 text-center" style={{ color: 'var(--c-brand)' }}>
              {caffeineCups}
            </span>
            <button
              type="button"
              onClick={() => setCaffeineCups(Math.min(20, caffeineCups + 1))}
              className="w-9 h-9 rounded-full border border-gray-200 text-gray-600 font-bold text-lg flex items-center justify-center"
            >
              +
            </button>
            <span className="text-sm text-gray-400">잔</span>
          </div>
        </div>
      )}

      {/* 세부 입력: 음주 */}
      {selected.has('alcohol') && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
          <p className="text-sm font-medium text-gray-700">음주량 (단위)</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAlcoholUnits(Math.max(1, alcoholUnits - 1))}
              className="w-9 h-9 rounded-full border border-gray-200 text-gray-600 font-bold text-lg flex items-center justify-center"
            >
              −
            </button>
            <span className="text-2xl font-bold w-8 text-center" style={{ color: 'var(--c-brand)' }}>
              {alcoholUnits}
            </span>
            <button
              type="button"
              onClick={() => setAlcoholUnits(Math.min(20, alcoholUnits + 1))}
              className="w-9 h-9 rounded-full border border-gray-200 text-gray-600 font-bold text-lg flex items-center justify-center"
            >
              +
            </button>
            <span className="text-sm text-gray-400">단위</span>
          </div>
          <p className="text-[11px] text-gray-400">1단위 = 맥주 1캔 / 소주 1잔 / 와인 1잔</p>
        </div>
      )}

      {/* 세부 입력: 스트레스 */}
      {selected.has('stress') && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
          <p className="text-sm font-medium text-gray-700">스트레스 정도</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setStressLevel(n)}
                className="flex-1 h-10 rounded-xl text-sm font-bold transition-all"
                style={{
                  backgroundColor: stressLevel === n ? 'var(--c-brand)' : '#f3f4f6',
                  color: stressLevel === n ? 'white' : '#9ca3af',
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 px-1">
            <span>낮음</span>
            <span>높음</span>
          </div>
        </div>
      )}

      {/* 세부 입력: 운동 */}
      {selected.has('exercise') && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
          <p className="text-sm font-medium text-gray-700">운동 시간</p>
          <div className="flex gap-2 flex-wrap">
            {[15, 30, 45, 60, 90, 120].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setExerciseMinutes(m)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: exerciseMinutes === m ? 'var(--c-brand)' : '#f3f4f6',
                  color: exerciseMinutes === m ? 'white' : '#6b7280',
                }}
              >
                {m}분
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 메모 */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          메모 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="트리거에 대한 메모를 남겨보세요..."
          maxLength={300}
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 placeholder:text-gray-300"
          style={{ '--tw-ring-color': 'var(--c-brand)' } as React.CSSProperties}
        />
        <p className="text-right text-[10px] text-gray-300 mt-0.5">{note.length}/300</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-green-50 text-green-700 text-sm">저장되었습니다 ✓</div>
      )}

      <button
        type="submit"
        disabled={isPending || selected.size === 0}
        className="w-full h-12 rounded-2xl text-white text-sm font-semibold disabled:opacity-40 transition-opacity"
        style={{ backgroundColor: 'var(--c-brand)' }}
      >
        {isPending ? '저장 중...' : existing ? '수정 저장' : '트리거 기록 저장'}
      </button>

      {selected.size === 0 && (
        <p className="text-center text-xs text-gray-400">트리거를 하나 이상 선택해주세요</p>
      )}
    </form>
  );
}
