'use client';

import { useState, useTransition } from 'react';
import { saveMoodLog } from '@/actions/mood';
import type { MenoaMoodLog } from '@/db/schema';

type MoodOption = {
  score: number;
  emoji: string;
  label: string;
};

const MOOD_OPTIONS: MoodOption[] = [
  { score: 1, emoji: '😢', label: '매우 나쁨' },
  { score: 2, emoji: '😕', label: '나쁨' },
  { score: 3, emoji: '😐', label: '보통' },
  { score: 4, emoji: '😊', label: '좋음' },
  { score: 5, emoji: '😄', label: '매우 좋음' },
];

type Props = {
  existing: MenoaMoodLog | null;
  date: string;
};

export function MoodLogForm({ existing, date }: Props) {
  const [selectedScore, setSelectedScore] = useState<number>(existing?.mood_score ?? 3);
  const [note, setNote] = useState(existing?.note ?? '');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedMood = MOOD_OPTIONS.find(m => m.score === selectedScore);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await saveMoodLog({
        mood_score: selectedScore,
        mood_emoji: selectedMood?.emoji ?? '😐',
        note: note.trim() || undefined,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기분 선택 */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700 mb-4">오늘 기분이 어떠세요?</p>
        <div className="flex justify-center items-end gap-3">
          {MOOD_OPTIONS.map(mood => {
            const isSelected = selectedScore === mood.score;
            return (
              <button
                key={mood.score}
                type="button"
                onClick={() => { setSelectedScore(mood.score); setSuccess(false); }}
                className="flex flex-col items-center gap-1 transition-all"
                style={{ transform: isSelected ? 'scale(1.2)' : 'scale(1)' }}
              >
                <span
                  className="text-4xl leading-none transition-all"
                  style={{ filter: isSelected ? 'none' : 'grayscale(0.6) opacity(0.6)' }}
                >
                  {mood.emoji}
                </span>
                {isSelected && (
                  <span className="text-[10px] font-semibold" style={{ color: '#800020' }}>
                    {mood.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 점수 바 */}
        <div className="mt-5 mx-auto max-w-xs">
          <div className="flex rounded-full overflow-hidden h-2 bg-gray-100">
            {MOOD_OPTIONS.map(mood => (
              <div
                key={mood.score}
                className="flex-1 transition-all"
                style={{
                  backgroundColor: mood.score <= selectedScore ? '#800020' : 'transparent',
                  opacity: mood.score <= selectedScore ? (0.4 + mood.score * 0.12) : 1,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">😢 1점</span>
            <span className="text-[10px] text-gray-400">😄 5점</span>
          </div>
        </div>
      </div>

      {/* 메모 */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          메모 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="오늘 기분에 대해 기록해보세요..."
          maxLength={500}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 placeholder:text-gray-300"
          style={{ '--tw-ring-color': '#800020' } as React.CSSProperties}
        />
        <p className="text-right text-[10px] text-gray-300 mt-0.5">{note.length}/500</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-green-50 text-green-700 text-sm">기분이 기록되었습니다 ✓</div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-2xl text-white text-sm font-semibold disabled:opacity-40 transition-opacity"
        style={{ backgroundColor: '#800020' }}
      >
        {isPending ? '저장 중...' : existing ? '기분 수정' : '기분 기록 저장'}
      </button>
    </form>
  );
}
