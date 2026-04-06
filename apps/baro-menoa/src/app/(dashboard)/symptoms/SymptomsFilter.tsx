'use client';

import { useRouter } from 'next/navigation';

type FilterRange = 'week' | 'month' | 'all';

const FILTERS: { value: FilterRange; label: string }[] = [
  { value: 'week', label: '이번 주' },
  { value: 'month', label: '이번 달' },
  { value: 'all', label: '전체' },
];

export function SymptomsFilter({ current }: { current: FilterRange }) {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      {FILTERS.map(f => (
        <button
          key={f.value}
          onClick={() => router.push(`/symptoms?filter=${f.value}`)}
          className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          style={{
            backgroundColor: current === f.value ? '#800020' : '#f3f4f6',
            color: current === f.value ? 'white' : '#6b7280',
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
