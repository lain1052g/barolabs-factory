'use client';

import { useState, useTransition } from 'react';
import { saveHealthSection } from '@/actions/health-profile';
import type { HealthItem } from '@/lib/health-profile-items';

type Section = 'conditions' | 'medical_history' | 'medications' | 'supplements';

interface HealthChecklistProps {
  section: Section;
  items: HealthItem[];
  savedItems: string[];
  showSmokingToggle?: boolean;
  savedIsSmoker?: boolean;
}

export function HealthChecklist({
  section,
  items,
  savedItems,
  showSmokingToggle,
  savedIsSmoker,
}: HealthChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set(savedItems));
  const [isSmoker, setIsSmoker] = useState(savedIsSmoker ?? false);
  const [isPending, startTransition] = useTransition();
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSaveState('idle');
  };

  const handleSave = () => {
    startTransition(async () => {
      await saveHealthSection(
        section,
        Array.from(checked),
        showSmokingToggle ? isSmoker : undefined,
      );
      setSaveState('saved');
    });
  };

  return (
    <div className="space-y-2">
      {/* 흡연 토글 (생활습관 섹션에만 표시) */}
      {showSmokingToggle && (
        <label className="flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <input
            type="checkbox"
            checked={isSmoker}
            onChange={e => {
              setIsSmoker(e.target.checked);
              setSaveState('idle');
            }}
            className="w-5 h-5 rounded"
            style={{ accentColor: 'var(--c-brand)' }}
          />
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">흡연 중</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">흡연은 안면홍조·골다공증 위험을 높여요</p>
          </div>
        </label>
      )}

      {/* 체크리스트 항목 */}
      {items.map(item => (
        <label
          key={item.id}
          className="flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <input
            type="checkbox"
            checked={checked.has(item.id)}
            onChange={() => toggle(item.id)}
            className="w-5 h-5 rounded flex-shrink-0"
            style={{ accentColor: 'var(--c-brand)' }}
          />
          <span className="text-sm text-gray-800 dark:text-gray-100 leading-snug">
            {item.label}
          </span>
        </label>
      ))}

      {/* 해당 없음 안내 */}
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-1">
        해당하는 항목만 체크하세요. 없으면 빈 채로 저장하면 됩니다.
      </p>

      {/* 저장 버튼 */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="w-full mt-2 py-3.5 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
        style={{
          backgroundColor: saveState === 'saved' ? '#22c55e' : 'var(--c-brand)',
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? '저장 중...' : saveState === 'saved' ? '✓ 저장되었습니다' : '저장하기'}
      </button>
    </div>
  );
}
