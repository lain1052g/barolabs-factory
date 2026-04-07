/**
 * 유저가 Pro 플랜인지 확인하는 헬퍼.
 * plan === 'pro' 이거나 pro_expires_at이 미래 날짜면 Pro로 취급.
 */
export function isProPlan(plan: string | null, proExpiresAt: Date | null): boolean {
  if (plan === 'pro') return true;
  if (proExpiresAt && new Date(proExpiresAt) > new Date()) return true;
  return false;
}
