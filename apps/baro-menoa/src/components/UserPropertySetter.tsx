'use client';

import { useEffect } from 'react';
import { setUserProperty } from '@/lib/analytics';

export function UserPropertySetter({ stage, plan }: { stage: string | null; plan: string }) {
  useEffect(() => {
    if (stage) setUserProperty('menopause_stage', stage);
    setUserProperty('plan', plan);
  }, [stage, plan]);

  return null;
}
