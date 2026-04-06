// 증상 카테고리 + 증상 마스터 데이터 시드
// 실행: npx tsx src/db/seed.ts

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { db } from './index';
import { menoa_symptom_categories, menoa_symptoms } from './schema';

const categories = [
  { id: 'cat-physical',  name: '신체증상',  name_en: 'physical',  sort_order: 1 },
  { id: 'cat-emotional', name: '정서/인지', name_en: 'emotional', sort_order: 2 },
  { id: 'cat-sleep',     name: '수면',      name_en: 'sleep',     sort_order: 3 },
  { id: 'cat-sexual',    name: '성건강',    name_en: 'sexual',    sort_order: 4 },
];

const symptoms = [
  { category_id: 'cat-physical', name: '안면홍조',   name_en: 'hot_flashes',     sort_order: 1 },
  { category_id: 'cat-physical', name: '야간발한',   name_en: 'night_sweats',    sort_order: 2 },
  { category_id: 'cat-physical', name: '두통',       name_en: 'headache',        sort_order: 3 },
  { category_id: 'cat-physical', name: '관절통',     name_en: 'joint_pain',      sort_order: 4 },
  { category_id: 'cat-physical', name: '근육통',     name_en: 'muscle_pain',     sort_order: 5 },
  { category_id: 'cat-physical', name: '피로감',     name_en: 'fatigue',         sort_order: 6 },
  { category_id: 'cat-physical', name: '심계항진',   name_en: 'palpitations',    sort_order: 7 },
  { category_id: 'cat-physical', name: '체중증가',   name_en: 'weight_gain',     sort_order: 8 },
  { category_id: 'cat-physical', name: '피부건조',   name_en: 'dry_skin',        sort_order: 9 },
  { category_id: 'cat-physical', name: '어지러움',   name_en: 'dizziness',       sort_order: 10 },
  { category_id: 'cat-physical', name: '손발저림',   name_en: 'numbness',        sort_order: 11 },
  { category_id: 'cat-physical', name: '소화불량',   name_en: 'indigestion',     sort_order: 12 },
  { category_id: 'cat-emotional', name: '불안',       name_en: 'anxiety',        sort_order: 1 },
  { category_id: 'cat-emotional', name: '우울감',     name_en: 'depression',     sort_order: 2 },
  { category_id: 'cat-emotional', name: '감정기복',   name_en: 'mood_swings',    sort_order: 3 },
  { category_id: 'cat-emotional', name: '집중력저하', name_en: 'poor_focus',     sort_order: 4 },
  { category_id: 'cat-emotional', name: '기억력저하', name_en: 'memory_loss',    sort_order: 5 },
  { category_id: 'cat-emotional', name: '짜증',       name_en: 'irritability',   sort_order: 6 },
  { category_id: 'cat-sleep', name: '불면',     name_en: 'insomnia',        sort_order: 1 },
  { category_id: 'cat-sleep', name: '수면중단', name_en: 'sleep_interrupt', sort_order: 2 },
  { category_id: 'cat-sleep', name: '조기각성', name_en: 'early_waking',    sort_order: 3 },
  { category_id: 'cat-sleep', name: '수면과다', name_en: 'oversleeping',    sort_order: 4 },
  { category_id: 'cat-sexual', name: '질건조',   name_en: 'vaginal_dryness',    sort_order: 1 },
  { category_id: 'cat-sexual', name: '성욕감퇴', name_en: 'low_libido',         sort_order: 2 },
  { category_id: 'cat-sexual', name: '성교통',   name_en: 'painful_sex',        sort_order: 3 },
  { category_id: 'cat-sexual', name: '요실금',   name_en: 'incontinence',       sort_order: 4 },
  { category_id: 'cat-sexual', name: '빈뇨',     name_en: 'frequent_urination', sort_order: 5 },
];

async function seed() {
  console.log('🌱 시드 데이터 삽입 시작...');

  await db.insert(menoa_symptom_categories)
    .values(categories)
    .onConflictDoNothing();

  await db.insert(menoa_symptoms)
    .values(symptoms.map(s => ({ ...s, id: crypto.randomUUID(), is_active: true })))
    .onConflictDoNothing();

  console.log('✅ 시드 완료 — 카테고리 4개, 증상 27개');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
