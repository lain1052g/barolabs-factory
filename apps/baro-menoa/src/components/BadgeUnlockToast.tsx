'use client';

import { useEffect, useState } from 'react';
import type { Badge } from '@/lib/badges';

const SEEN_KEY = 'menoa_seen_badges';

function hasSeenBadge(id: string): boolean {
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as string[];
    return seen.includes(id);
  } catch {
    return false;
  }
}

function markBadgeSeen(id: string): void {
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as string[];
    if (!seen.includes(id)) {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id]));
    }
  } catch {
    // localStorage 접근 불가 환경(SSR 등) — 무시
  }
}

export function BadgeUnlockToast({ badge }: { badge: Badge }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 이미 본 뱃지면 표시하지 않음 (재방문 시 중복 방지)
    if (hasSeenBadge(badge.id)) return;

    markBadgeSeen(badge.id);

    const show = setTimeout(() => setVisible(true), 700);
    const hide = setTimeout(() => setVisible(false), 4700);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [badge.id]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl animate-menoa-slide-top"
      style={{
        backgroundColor: 'var(--c-brand)',
        maxWidth: '320px',
        width: 'calc(100% - 32px)',
      }}
    >
      <span className="text-2xl flex-shrink-0">{badge.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold">새 뱃지 획득!</p>
        <p className="text-white/80 text-xs mt-0.5">{badge.label} 달성했어요 🎉</p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-white/60 hover:text-white text-lg leading-none flex-shrink-0 ml-1"
        aria-label="닫기"
      >
        ✕
      </button>
    </div>
  );
}
