-- 알림 시간 설정 컬럼 추가
-- 사용자가 원하는 알림 시각(0~23시)을 저장
-- Supabase SQL Editor에서 직접 실행

ALTER TABLE "br-s15_menoa_users"
  ADD COLUMN IF NOT EXISTS notification_hour INTEGER DEFAULT 11;
