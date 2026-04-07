// src/db/schema.ts — baro-menoa (메노아)
// DB prefix: br-s15_menoa_
// 갱년기 여성 증상 추적 앱 | Free / Pro 4,900원/월 · 39,900원/년

import {
  pgTable,
  text,
  integer,
  timestamp,
  date,
  boolean,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// ─────────────────────────────────────────────
// 1. USERS
// ─────────────────────────────────────────────
export const menoa_users = pgTable(
  'br-s15_menoa_users',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    supabase_id: text('supabase_id').notNull().unique(),
    email: text('email').notNull().unique(),
    name: text('name'),
    plan: text('plan', { enum: ['free', 'pro'] }).default('free').notNull(),
    role: text('role', { enum: ['admin', 'user'] }).default('user').notNull(),
    menopause_stage: text('menopause_stage', {
      enum: ['pre', 'peri', 'post'],
    }),
    last_period_date: date('last_period_date'),
    birth_year: integer('birth_year'),
    pro_expires_at: timestamp('pro_expires_at'),
    // plan 제한 체크용 — 월별 PDF 발급 횟수 (Free: 월 1회, Pro: 무제한)
    upload_count: integer('upload_count').default(0).notNull(),
    // 이메일 마케팅 수신 동의 (선택) — 온보딩/설정에서 설정
    // DB 마이그레이션: src/db/migrations/add_email_marketing_agreed.sql 실행 필요
    email_marketing_agreed: boolean('email_marketing_agreed').default(false),
    // 알림 시간 설정 (0~23) — daily-reminder cron이 이 값을 참조
    // DB 마이그레이션: src/db/migrations/add_notification_hour.sql 실행 필요
    notification_hour: integer('notification_hour').default(11),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('menoa_users_supabase_id_idx').on(t.supabase_id),
    index('menoa_users_plan_idx').on(t.plan),
  ],
);

export type MenoaUser = InferSelectModel<typeof menoa_users>;
export type NewMenoaUser = InferInsertModel<typeof menoa_users>;

// ─────────────────────────────────────────────
// 2. SYMPTOM CATEGORIES (마스터)
// ─────────────────────────────────────────────
export const menoa_symptom_categories = pgTable(
  'br-s15_menoa_symptom_categories',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),        // 신체증상, 정서/인지, 수면, 성건강
    name_en: text('name_en').notNull(), // physical, emotional, sleep, sexual
    sort_order: integer('sort_order').default(0).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
);

export type MenoaSymptomCategory = InferSelectModel<typeof menoa_symptom_categories>;
export type NewMenoaSymptomCategory = InferInsertModel<typeof menoa_symptom_categories>;

// ─────────────────────────────────────────────
// 3. SYMPTOMS (증상 마스터 — 30+ 항목)
// ─────────────────────────────────────────────
export const menoa_symptoms = pgTable(
  'br-s15_menoa_symptoms',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    category_id: text('category_id')
      .notNull()
      .references(() => menoa_symptom_categories.id, { onDelete: 'restrict' }),
    name: text('name').notNull(), // 안면홍조, 야간발한, 불면, 관절통...
    name_en: text('name_en'),
    description: text('description'),
    sort_order: integer('sort_order').default(0).notNull(),
    is_active: boolean('is_active').default(true).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('menoa_symptoms_category_idx').on(t.category_id),
  ],
);

export type MenoaSymptom = InferSelectModel<typeof menoa_symptoms>;
export type NewMenoaSymptom = InferInsertModel<typeof menoa_symptoms>;

// ─────────────────────────────────────────────
// 4. SYMPTOM LOGS (날짜별 증상 기록)
// ─────────────────────────────────────────────
// Free: 최대 10개 증상 추적 (Server Action에서 체크)
// Pro: 30개+ 증상 추적
// isNull(deleted_at) 필터 필수
export const menoa_symptom_logs = pgTable(
  'br-s15_menoa_symptom_logs',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    author_id: text('author_id')
      .notNull()
      .references(() => menoa_users.id, { onDelete: 'cascade' }),
    author_supabase_id: text('author_supabase_id').notNull(),
    symptom_id: text('symptom_id')
      .notNull()
      .references(() => menoa_symptoms.id, { onDelete: 'restrict' }),
    log_date: date('log_date').notNull(),
    severity: integer('severity').notNull(), // 1~5
    note: text('note'),
    deleted_at: timestamp('deleted_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('menoa_symptom_logs_author_idx').on(t.author_id),
    index('menoa_symptom_logs_supabase_idx').on(t.author_supabase_id),
    index('menoa_symptom_logs_date_idx').on(t.log_date),
    index('menoa_symptom_logs_deleted_idx').on(t.deleted_at),
    index('menoa_symptom_logs_author_date_idx').on(t.author_id, t.log_date),
  ],
);

export type MenoaSymptomLog = InferSelectModel<typeof menoa_symptom_logs>;
export type NewMenoaSymptomLog = InferInsertModel<typeof menoa_symptom_logs>;

// ─────────────────────────────────────────────
// 5. TRIGGER LOGS (카페인/수면/스트레스/운동)
// ─────────────────────────────────────────────
// Pro 전용 — trigger analysis
// isNull(deleted_at) 필터 필수
export const menoa_trigger_logs = pgTable(
  'br-s15_menoa_trigger_logs',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    author_id: text('author_id')
      .notNull()
      .references(() => menoa_users.id, { onDelete: 'cascade' }),
    author_supabase_id: text('author_supabase_id').notNull(),
    log_date: date('log_date').notNull(),
    caffeine_cups: integer('caffeine_cups').default(0).notNull(),
    alcohol_units: integer('alcohol_units').default(0).notNull(),
    sleep_minutes: integer('sleep_minutes').default(0).notNull(), // 420 = 7h
    stress_level: integer('stress_level'),                        // 1~5
    exercise_minutes: integer('exercise_minutes').default(0).notNull(),
    note: text('note'),
    deleted_at: timestamp('deleted_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('menoa_trigger_logs_author_idx').on(t.author_id),
    index('menoa_trigger_logs_supabase_idx').on(t.author_supabase_id),
    index('menoa_trigger_logs_date_idx').on(t.log_date),
    index('menoa_trigger_logs_deleted_idx').on(t.deleted_at),
    index('menoa_trigger_logs_author_date_idx').on(t.author_id, t.log_date),
    uniqueIndex('menoa_trigger_logs_unique_date').on(t.author_id, t.log_date),
  ],
);

export type MenoaTriggerLog = InferSelectModel<typeof menoa_trigger_logs>;
export type NewMenoaTriggerLog = InferInsertModel<typeof menoa_trigger_logs>;

// ─────────────────────────────────────────────
// 6. SOS LOGS (SOS 사용 이력 — append-only)
// ─────────────────────────────────────────────
// Free + Pro 모두 사용 가능 / 이력 테이블 — 삭제 없음
export const menoa_sos_logs = pgTable(
  'br-s15_menoa_sos_logs',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    author_id: text('author_id')
      .notNull()
      .references(() => menoa_users.id, { onDelete: 'cascade' }),
    author_supabase_id: text('author_supabase_id').notNull(),
    triggered_at: timestamp('triggered_at').defaultNow().notNull(),
    symptom_type: text('symptom_type'),
    content_shown: text('content_shown'),
    duration_seconds: integer('duration_seconds'),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('menoa_sos_logs_author_idx').on(t.author_id),
    index('menoa_sos_logs_supabase_idx').on(t.author_supabase_id),
    index('menoa_sos_logs_triggered_idx').on(t.triggered_at),
  ],
);

export type MenoaSosLog = InferSelectModel<typeof menoa_sos_logs>;
export type NewMenoaSosLog = InferInsertModel<typeof menoa_sos_logs>;

// ─────────────────────────────────────────────
// 7. MOOD LOGS (감정 저널 — Pro)
// ─────────────────────────────────────────────
// isNull(deleted_at) 필터 필수
export const menoa_mood_logs = pgTable(
  'br-s15_menoa_mood_logs',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    author_id: text('author_id')
      .notNull()
      .references(() => menoa_users.id, { onDelete: 'cascade' }),
    author_supabase_id: text('author_supabase_id').notNull(),
    log_date: date('log_date').notNull(),
    mood_emoji: text('mood_emoji').notNull(), // 😊😐😢😠😰
    mood_score: integer('mood_score').notNull(), // 1~5
    note: text('note'),
    deleted_at: timestamp('deleted_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('menoa_mood_logs_author_idx').on(t.author_id),
    index('menoa_mood_logs_supabase_idx').on(t.author_supabase_id),
    index('menoa_mood_logs_date_idx').on(t.log_date),
    index('menoa_mood_logs_deleted_idx').on(t.deleted_at),
    index('menoa_mood_logs_author_date_idx').on(t.author_id, t.log_date),
    uniqueIndex('menoa_mood_logs_unique_date').on(t.author_id, t.log_date),
  ],
);

export type MenoaMoodLog = InferSelectModel<typeof menoa_mood_logs>;
export type NewMenoaMoodLog = InferInsertModel<typeof menoa_mood_logs>;

// ─────────────────────────────────────────────
// 8. EXPERT CONTENTS (전문가 콘텐츠)
// ─────────────────────────────────────────────
// 어드민 등록 / Free: 2편/월, Pro: 무제한
// Supabase Storage: br-s15_menoa_thumbnails
export const menoa_expert_contents = pgTable(
  'br-s15_menoa_expert_contents',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text('title').notNull(),
    body: text('body').notNull(),
    category: text('category', {
      enum: ['nutrition', 'exercise', 'mental', 'medical', 'lifestyle'],
    }).notNull(),
    author_name: text('author_name').notNull(),
    author_title: text('author_title'),
    reviewed_by: text('reviewed_by'),
    reviewed_at: timestamp('reviewed_at'),
    is_published: boolean('is_published').default(false).notNull(),
    is_pro_only: boolean('is_pro_only').default(false).notNull(),
    thumbnail_url: text('thumbnail_url'),
    deleted_at: timestamp('deleted_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('menoa_expert_contents_category_idx').on(t.category),
    index('menoa_expert_contents_published_idx').on(t.is_published),
    index('menoa_expert_contents_deleted_idx').on(t.deleted_at),
  ],
);

export type MenoaExpertContent = InferSelectModel<typeof menoa_expert_contents>;
export type NewMenoaExpertContent = InferInsertModel<typeof menoa_expert_contents>;

// ─────────────────────────────────────────────
// 9. CONTENT BOOKMARKS (콘텐츠 스크랩 — Pro)
// ─────────────────────────────────────────────
// User:Content = N:M 중간 테이블
export const menoa_content_bookmarks = pgTable(
  'br-s15_menoa_content_bookmarks',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    author_id: text('author_id')
      .notNull()
      .references(() => menoa_users.id, { onDelete: 'cascade' }),
    author_supabase_id: text('author_supabase_id').notNull(),
    content_id: text('content_id')
      .notNull()
      .references(() => menoa_expert_contents.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('menoa_bookmarks_unique').on(t.author_id, t.content_id),
    index('menoa_bookmarks_author_idx').on(t.author_id),
    index('menoa_bookmarks_supabase_idx').on(t.author_supabase_id),
  ],
);

export type MenoaContentBookmark = InferSelectModel<typeof menoa_content_bookmarks>;
export type NewMenoaContentBookmark = InferInsertModel<typeof menoa_content_bookmarks>;

// ─────────────────────────────────────────────
// 10. PDF REPORTS (리포트 메타)
// ─────────────────────────────────────────────
// Free: 월 1회 / Pro: 무제한
// 실제 파일: Supabase Storage br-s15_menoa_pdfs
export const menoa_pdf_reports = pgTable(
  'br-s15_menoa_pdf_reports',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    author_id: text('author_id')
      .notNull()
      .references(() => menoa_users.id, { onDelete: 'cascade' }),
    author_supabase_id: text('author_supabase_id').notNull(),
    period_start: date('period_start').notNull(),
    period_end: date('period_end').notNull(),
    report_type: text('report_type', {
      enum: ['monthly', 'quarterly', 'custom'],
    }).notNull(),
    file_url: text('file_url').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('menoa_pdf_reports_author_idx').on(t.author_id),
    index('menoa_pdf_reports_supabase_idx').on(t.author_supabase_id),
    index('menoa_pdf_reports_period_idx').on(t.period_start),
  ],
);

export type MenoaPdfReport = InferSelectModel<typeof menoa_pdf_reports>;
export type NewMenoaPdfReport = InferInsertModel<typeof menoa_pdf_reports>;

// ─────────────────────────────────────────────
// 11. SUBSCRIPTIONS (구독 정보)
// ─────────────────────────────────────────────
export const menoa_subscriptions = pgTable(
  'br-s15_menoa_subscriptions',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    author_id: text('author_id')
      .notNull()
      .references(() => menoa_users.id, { onDelete: 'cascade' }),
    author_supabase_id: text('author_supabase_id').notNull(),
    plan: text('plan', { enum: ['free', 'pro'] }).notNull(),
    billing_cycle: text('billing_cycle', { enum: ['monthly', 'yearly'] }),
    started_at: timestamp('started_at').defaultNow().notNull(),
    expires_at: timestamp('expires_at'),
    portone_payment_id: text('portone_payment_id'),
    portone_subscription_id: text('portone_subscription_id'),
    status: text('status', {
      enum: ['active', 'cancelled', 'expired'],
    }).default('active').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('menoa_subscriptions_author_idx').on(t.author_id),
    index('menoa_subscriptions_supabase_idx').on(t.author_supabase_id),
    index('menoa_subscriptions_status_idx').on(t.status),
  ],
);

export type MenoaSubscription = InferSelectModel<typeof menoa_subscriptions>;
export type NewMenoaSubscription = InferInsertModel<typeof menoa_subscriptions>;

// ─────────────────────────────────────────────
// 12. PUSH TOKENS (FCM)
// ─────────────────────────────────────────────
export const menoa_push_tokens = pgTable(
  'br-s15_menoa_push_tokens',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    author_id: text('author_id')
      .notNull()
      .references(() => menoa_users.id, { onDelete: 'cascade' }),
    author_supabase_id: text('author_supabase_id').notNull(),
    token: text('token').notNull(),
    platform: text('platform', { enum: ['web', 'android', 'ios'] }).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('menoa_push_tokens_token_unique').on(t.token),
    index('menoa_push_tokens_author_idx').on(t.author_id),
    index('menoa_push_tokens_supabase_idx').on(t.author_supabase_id),
  ],
);

export type MenoaPushToken = InferSelectModel<typeof menoa_push_tokens>;
export type NewMenoaPushToken = InferInsertModel<typeof menoa_push_tokens>;

// ─────────────────────────────────────────────
// 12. HEALTH PROFILES (건강 프로필 — 선택 입력)
// ─────────────────────────────────────────────
export const menoa_health_profiles = pgTable(
  'menoa_health_profiles',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text('user_id')
      .notNull()
      .unique()
      .references(() => menoa_users.id, { onDelete: 'cascade' }),
    // 체크리스트 — 해당하는 항목 ID 배열로 저장
    conditions: text('conditions').array().notNull().default([]),       // 현재 지병
    medical_history: text('medical_history').array().notNull().default([]), // 병력·과거력
    medications: text('medications').array().notNull().default([]),     // 복용 약물
    supplements: text('supplements').array().notNull().default([]),     // 영양제·보조식품
    is_smoker: boolean('is_smoker').notNull().default(false),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('menoa_health_profiles_user_idx').on(t.user_id),
  ],
);

export type MenoaHealthProfile = InferSelectModel<typeof menoa_health_profiles>;
export type NewMenoaHealthProfile = InferInsertModel<typeof menoa_health_profiles>;

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────
export const menoa_users_relations = relations(menoa_users, ({ many, one }) => ({
  symptom_logs: many(menoa_symptom_logs),
  trigger_logs: many(menoa_trigger_logs),
  sos_logs: many(menoa_sos_logs),
  mood_logs: many(menoa_mood_logs),
  content_bookmarks: many(menoa_content_bookmarks),
  pdf_reports: many(menoa_pdf_reports),
  subscriptions: many(menoa_subscriptions),
  push_tokens: many(menoa_push_tokens),
  health_profile: one(menoa_health_profiles, {
    fields: [menoa_users.id],
    references: [menoa_health_profiles.user_id],
  }),
}));

export const menoa_symptom_categories_relations = relations(
  menoa_symptom_categories,
  ({ many }) => ({ symptoms: many(menoa_symptoms) }),
);

export const menoa_symptoms_relations = relations(menoa_symptoms, ({ one, many }) => ({
  category: one(menoa_symptom_categories, {
    fields: [menoa_symptoms.category_id],
    references: [menoa_symptom_categories.id],
  }),
  symptom_logs: many(menoa_symptom_logs),
}));

export const menoa_symptom_logs_relations = relations(menoa_symptom_logs, ({ one }) => ({
  user: one(menoa_users, {
    fields: [menoa_symptom_logs.author_id],
    references: [menoa_users.id],
  }),
  symptom: one(menoa_symptoms, {
    fields: [menoa_symptom_logs.symptom_id],
    references: [menoa_symptoms.id],
  }),
}));

export const menoa_trigger_logs_relations = relations(menoa_trigger_logs, ({ one }) => ({
  user: one(menoa_users, {
    fields: [menoa_trigger_logs.author_id],
    references: [menoa_users.id],
  }),
}));

export const menoa_sos_logs_relations = relations(menoa_sos_logs, ({ one }) => ({
  user: one(menoa_users, {
    fields: [menoa_sos_logs.author_id],
    references: [menoa_users.id],
  }),
}));

export const menoa_mood_logs_relations = relations(menoa_mood_logs, ({ one }) => ({
  user: one(menoa_users, {
    fields: [menoa_mood_logs.author_id],
    references: [menoa_users.id],
  }),
}));

export const menoa_expert_contents_relations = relations(
  menoa_expert_contents,
  ({ many }) => ({ bookmarks: many(menoa_content_bookmarks) }),
);

export const menoa_content_bookmarks_relations = relations(
  menoa_content_bookmarks,
  ({ one }) => ({
    user: one(menoa_users, {
      fields: [menoa_content_bookmarks.author_id],
      references: [menoa_users.id],
    }),
    content: one(menoa_expert_contents, {
      fields: [menoa_content_bookmarks.content_id],
      references: [menoa_expert_contents.id],
    }),
  }),
);

export const menoa_pdf_reports_relations = relations(menoa_pdf_reports, ({ one }) => ({
  user: one(menoa_users, {
    fields: [menoa_pdf_reports.author_id],
    references: [menoa_users.id],
  }),
}));

export const menoa_subscriptions_relations = relations(menoa_subscriptions, ({ one }) => ({
  user: one(menoa_users, {
    fields: [menoa_subscriptions.author_id],
    references: [menoa_users.id],
  }),
}));

export const menoa_push_tokens_relations = relations(menoa_push_tokens, ({ one }) => ({
  user: one(menoa_users, {
    fields: [menoa_push_tokens.author_id],
    references: [menoa_users.id],
  }),
}));
