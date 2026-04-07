// 어드민 이메일 목록 (환경변수 또는 하드코드 fallback)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? '')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
