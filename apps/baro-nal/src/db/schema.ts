// src/db/schema.ts — baro-nal (날)
// DB prefix: br045_nal_
// 자기탐색 저널 앱 | Free / Pro

import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const br045_nal_users = pgTable('br045_nal_users', {
  supabase_id: text('supabase_id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatar_url: text('avatar_url'),
  plan: varchar('plan', { length: 10 }).notNull().default('free'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// 키워드 선택 기록 (오늘의 사고 기록)
export const br045_nal_records = pgTable('br045_nal_records', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  user_id: text('user_id')
    .notNull()
    .references(() => br045_nal_users.supabase_id, { onDelete: 'cascade' }),
  recorded_date: text('recorded_date').notNull(), // YYYY-MM-DD
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});
