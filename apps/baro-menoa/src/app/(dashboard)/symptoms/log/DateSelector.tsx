'use client';

import { useRouter } from 'next/navigation';

export function DateSelector({ currentDate }: { currentDate: string }) {
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];
  // 최대 90일 전까지 선택 가능
  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString().split('T')[0];
  })();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.value;
    if (selected) {
      router.push(`/symptoms/log?date=${selected}`);
    }
  }

  const isToday = currentDate === today;
  const displayDate = new Date(currentDate + 'T00:00:00').toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div
      className="flex items-center gap-2 p-3 rounded-2xl border"
      style={{ backgroundColor: 'var(--c-brand-subtle)', borderColor: 'var(--c-brand-light)' }}
    >
      <div className="flex-1">
        <p className="text-xs font-semibold" style={{ color: 'var(--c-brand)' }}>
          {isToday ? '오늘' : '과거 날짜'}
        </p>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{displayDate}</p>
      </div>
      <div className="flex items-center gap-2">
        {!isToday && (
          <button
            onClick={() => router.push('/symptoms/log')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border"
            style={{ borderColor: 'var(--c-brand-light)', color: 'var(--c-brand)', backgroundColor: 'white' }}
          >
            오늘로
          </button>
        )}
        <label
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white cursor-pointer"
          style={{ backgroundColor: 'var(--c-brand)' }}
        >
          📅 날짜 변경
          <input
            type="date"
            value={currentDate}
            min={minDate}
            max={today}
            onChange={handleChange}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
}
