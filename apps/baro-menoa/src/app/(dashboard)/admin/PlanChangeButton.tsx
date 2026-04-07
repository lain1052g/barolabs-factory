'use client';

import { useTransition } from 'react';
import { changeUserPlan } from '@/actions/admin';

interface Props {
  userId: string;
  currentPlan: 'free' | 'pro';
}

export function PlanChangeButton({ userId, currentPlan }: Props) {
  const [isPending, startTransition] = useTransition();

  const nextPlan = currentPlan === 'pro' ? 'free' : 'pro';

  function handleClick() {
    startTransition(async () => {
      await changeUserPlan(userId, nextPlan);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs px-2.5 py-1 rounded border font-medium transition-colors disabled:opacity-50"
      style={
        nextPlan === 'pro'
          ? { borderColor: 'var(--c-brand)', color: 'var(--c-brand)' }
          : { borderColor: '#6b7280', color: '#6b7280' }
      }
    >
      {isPending ? '변경 중...' : nextPlan === 'pro' ? 'Pro로 변경' : 'Free로 변경'}
    </button>
  );
}
