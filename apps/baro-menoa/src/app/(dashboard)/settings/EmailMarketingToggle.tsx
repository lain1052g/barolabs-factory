'use client';

import { useState, useTransition } from 'react';
import { updateEmailMarketing } from '@/actions/settings';

interface EmailMarketingToggleProps {
  defaultValue: boolean;
}

export function EmailMarketingToggle({ defaultValue }: EmailMarketingToggleProps) {
  const [agreed, setAgreed] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !agreed;
    setAgreed(next);
    startTransition(async () => {
      await updateEmailMarketing(next);
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={agreed}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60"
      style={{ backgroundColor: agreed ? 'var(--c-brand)' : '#d1d5db' }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform"
        style={{ transform: agreed ? 'translateX(1.375rem)' : 'translateX(0.25rem)' }}
      />
    </button>
  );
}
