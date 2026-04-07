// ─────────────────────────────────────────────────────────────
// 메노아 뱃지 시스템
//
// totalDays(누적 기록일) 기준으로 배지 해금.
// 연속이 아닌 누적이라 더 부담 없음.
// ─────────────────────────────────────────────────────────────

export interface Badge {
  id: string;
  emoji: string;
  label: string;
  unlockAt: number; // 해금에 필요한 누적 기록일
}

export const BADGES: Badge[] = [
  { id: 'first',   emoji: '🌱', label: '첫 기록',    unlockAt: 1  },
  { id: 'week',    emoji: '🌸', label: '7일 달성',   unlockAt: 7  },
  { id: 'half',    emoji: '🌺', label: '15일 달성',  unlockAt: 15 },
  { id: 'thirty',  emoji: '🌷', label: '30일 마스터', unlockAt: 30 },
  { id: 'ninety',  emoji: '💎', label: '90일 전문가', unlockAt: 90 },
];

export function getUnlockedBadges(totalDays: number): Badge[] {
  return BADGES.filter(b => totalDays >= b.unlockAt);
}

export function getNextBadge(totalDays: number): Badge | null {
  return BADGES.find(b => totalDays < b.unlockAt) ?? null;
}

// 스트릭 길이별 칭찬 문구
export function getStreakCelebration(streak: number): string {
  if (streak >= 30) return '30일 마스터예요 🏆';
  if (streak >= 14) return `${streak}일째 지속 중! 대단해요 💪`;
  if (streak >= 7)  return '일주일 개근! 이쯤이면 습관이에요 🔥';
  if (streak >= 3)  return `${streak}일 연속 기록 중 🌸`;
  return '잘하셨어요! 🎉';
}
