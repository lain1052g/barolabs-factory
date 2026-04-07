'use client';

import { useState, useTransition } from 'react';
import { updateNotificationHour } from '@/actions/settings';

interface Props {
  defaultHour: number;
}

export function NotificationHourSelect({ defaultHour }: Props) {
  const [hour, setHour] = useState(defaultHour);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setHour(Number(e.target.value));
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateNotificationHour(hour);
      if (result.success) setSaved(true);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-700">알림 시간</p>
          <p className="text-xs text-gray-400 mt-0.5">매일 증상 기록 알림을 받을 시각</p>
        </div>
        <select
          value={hour}
          onChange={handleChange}
          className="text-sm rounded-lg border border-gray-200 px-3 py-1.5 text-gray-700 bg-white"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>
              {String(i).padStart(2, '0')}:00
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-colors"
          style={{ backgroundColor: 'var(--c-brand)', color: 'white' }}
        >
          {isPending ? '저장 중...' : '저장'}
        </button>
        {saved && (
          <span className="text-xs text-green-600">저장됐습니다.</span>
        )}
      </div>
    </div>
  );
}
