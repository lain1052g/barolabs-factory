// ─────────────────────────────────────────────────────────────────────────
// 메노아 판단 로직 문서 (Decision Logic Registry)
//
// 목적:
//   앱이 수집한 정보를 바탕으로 어떤 상황인지 분류하고,
//   그에 맞는 솔루션을 제안하는 전체 로직을 목록화.
//
// 사용 방법:
//   - 전문가 자문 후 기준값(threshold) 수정
//   - 새 규칙 추가 시 DIAGNOSES + FLOW에 동시에 추가
//   - 솔루션 내용 개선 시 SOLUTIONS만 수정
//
// 구현 상태:
//   'documented' = 로직은 정의됨, 앱에 아직 미구현
//   'implemented' = 앱에 구현 완료
// ─────────────────────────────────────────────────────────────────────────

// ── 타입 정의 ────────────────────────────────────────────────────────────

export type DiagnosisLevel = 1 | 2 | 3 | 4;
export type ImplementationStatus = 'implemented' | 'documented';
export type SolutionCategory =
  | 'immediate'     // 즉각 대처 (SOS)
  | 'lifestyle'     // 생활습관 개선
  | 'nutrition'     // 식이·영양
  | 'medical'       // 의료적 개입 (병원)
  | 'monitoring';   // 모니터링 유지

export interface InputItem {
  id: string;
  group: string;
  label: string;
  type: string;       // 수집 방식
  status: ImplementationStatus;
}

export interface Diagnosis {
  id: string;         // 예: D1, D2 ...
  level: DiagnosisLevel;
  title: string;
  description: string;
  rules: string[];    // 판단 기준 (자연어 — 나중에 코드로 구현)
  inputs_used: string[]; // InputItem.id 참조
  note?: string;      // 전문가 자문 필요 항목 등
  status: ImplementationStatus;
}

export interface Solution {
  id: string;         // 예: S1, S2 ...
  category: SolutionCategory;
  title: string;
  detail: string;
  evidence?: string;  // 근거 (출처)
  status: ImplementationStatus;
}

export interface FlowRule {
  inputs: string[];       // InputItem.id 목록
  diagnosis_id: string;   // Diagnosis.id
  solution_ids: string[]; // Solution.id 목록
  priority: number;       // 낮을수록 먼저 평가
}

// ── 레벨 정의 ─────────────────────────────────────────────────────────────
export const DIAGNOSIS_LEVELS: Record<DiagnosisLevel, { label: string; color: string; desc: string }> = {
  1: { label: '병원 방문 필요',    color: '#dc2626', desc: '즉시 또는 가급적 빨리 전문의 상담 필요' },
  2: { label: '전문가 상담 권장',  color: '#ea580c', desc: '수 주 내 산부인과·관련 전문과 방문 권장' },
  3: { label: '생활습관 개선',     color: '#ca8a04', desc: '앱 내 가이드로 관리 가능한 수준' },
  4: { label: '모니터링',          color: '#16a34a', desc: '현재는 양호 — 지속 추적 권장' },
};

// ── 1. 수집 정보 목록 ────────────────────────────────────────────────────
export const INPUTS: InputItem[] = [
  // 기본 프로필
  { id: 'profile_age',            group: '기본 프로필', label: '나이 (생년월일 기반)',       type: '가입 시 1회', status: 'implemented' },
  { id: 'profile_stage',          group: '기본 프로필', label: '폐경 단계 (pre/peri/post)', type: '가입 시 1회', status: 'implemented' },
  { id: 'profile_last_period',    group: '기본 프로필', label: '마지막 생리 날짜',           type: '가입 시 1회', status: 'implemented' },
  { id: 'profile_name',           group: '기본 프로필', label: '이름',                       type: '가입 시 1회', status: 'implemented' },

  // 일일 증상 기록
  { id: 'symptom_hotflash',       group: '일일 증상', label: '안면홍조 심각도 (1~5)',     type: '매일', status: 'implemented' },
  { id: 'symptom_nightsweat',     group: '일일 증상', label: '야간발한 심각도 (1~5)',     type: '매일', status: 'implemented' },
  { id: 'symptom_sleep',          group: '일일 증상', label: '수면장애 심각도 (1~5)',     type: '매일', status: 'implemented' },
  { id: 'symptom_mood',           group: '일일 증상', label: '감정기복 심각도 (1~5)',     type: '매일', status: 'implemented' },
  { id: 'symptom_fatigue',        group: '일일 증상', label: '피로감 심각도 (1~5)',       type: '매일', status: 'implemented' },
  { id: 'symptom_brainfog',       group: '일일 증상', label: '브레인포그 심각도 (1~5)',   type: '매일', status: 'implemented' },
  { id: 'symptom_joint',          group: '일일 증상', label: '관절·근육통 심각도 (1~5)', type: '매일', status: 'implemented' },
  { id: 'symptom_vaginal',        group: '일일 증상', label: '질 건조·통증 심각도 (1~5)', type: '매일', status: 'implemented' },
  { id: 'symptom_headache',       group: '일일 증상', label: '두통 심각도 (1~5)',         type: '매일', status: 'implemented' },
  { id: 'symptom_palpitation',    group: '일일 증상', label: '두근거림 심각도 (1~5)',     type: '매일', status: 'implemented' },
  { id: 'symptom_others',         group: '일일 증상', label: '기타 증상 17개 (1~5)',      type: '매일', status: 'implemented' },

  // 일일 트리거
  { id: 'trigger_caffeine',       group: '일일 트리거', label: '카페인 섭취 (잔 수)',   type: '매일', status: 'implemented' },
  { id: 'trigger_alcohol',        group: '일일 트리거', label: '음주 (단위 수)',         type: '매일', status: 'implemented' },
  { id: 'trigger_stress',         group: '일일 트리거', label: '스트레스 수준 (1~5)',   type: '매일', status: 'implemented' },
  { id: 'trigger_sleep_min',      group: '일일 트리거', label: '수면 시간 (분)',         type: '매일', status: 'implemented' },
  { id: 'trigger_exercise_min',   group: '일일 트리거', label: '운동 시간 (분)',         type: '매일', status: 'implemented' },
  { id: 'trigger_weather',        group: '일일 트리거', label: '날씨 영향 여부',         type: '매일', status: 'implemented' },

  // 일일 기분
  { id: 'mood_score',             group: '일일 기분', label: '기분 점수 (1~5)',          type: '매일', status: 'implemented' },
  { id: 'mood_emoji',             group: '일일 기분', label: '기분 이모지',              type: '매일', status: 'implemented' },

  // SOS
  { id: 'sos_type',               group: 'SOS 기록', label: 'SOS 유형 (호흡/냉각/그라운딩/스트레칭)', type: '사용 시 자동', status: 'implemented' },
  { id: 'sos_duration',           group: 'SOS 기록', label: 'SOS 지속 시간 (초)',       type: '사용 시 자동', status: 'implemented' },

  // 건강 프로필 — 지병
  { id: 'hp_thyroid',             group: '건강프로필 · 지병', label: '갑상선 기능 이상',              type: '선택 입력', status: 'implemented' },
  { id: 'hp_diabetes',            group: '건강프로필 · 지병', label: '당뇨 / 혈당 이상',              type: '선택 입력', status: 'implemented' },
  { id: 'hp_obesity',             group: '건강프로필 · 지병', label: '비만 (BMI 30+)',                type: '선택 입력', status: 'implemented' },
  { id: 'hp_depression',          group: '건강프로필 · 지병', label: '우울증 / 불안장애',             type: '선택 입력', status: 'implemented' },
  { id: 'hp_osteoporosis',        group: '건강프로필 · 지병', label: '골다공증',                      type: '선택 입력', status: 'implemented' },
  { id: 'hp_migraine',            group: '건강프로필 · 지병', label: '편두통',                        type: '선택 입력', status: 'implemented' },
  { id: 'hp_sleep_apnea',         group: '건강프로필 · 지병', label: '수면무호흡증',                  type: '선택 입력', status: 'implemented' },
  { id: 'hp_hypertension',        group: '건강프로필 · 지병', label: '고혈압',                        type: '선택 입력', status: 'implemented' },
  { id: 'hp_cardiovascular',      group: '건강프로필 · 지병', label: '심혈관 질환',                   type: '선택 입력', status: 'implemented' },
  { id: 'hp_ibs',                 group: '건강프로필 · 지병', label: '과민성장증후군 (IBS)',           type: '선택 입력', status: 'implemented' },
  { id: 'hp_autoimmune',          group: '건강프로필 · 지병', label: '자가면역질환',                  type: '선택 입력', status: 'implemented' },

  // 건강 프로필 — 병력
  { id: 'hp_surgical_menopause',  group: '건강프로필 · 병력', label: '수술적 폐경',                   type: '선택 입력', status: 'implemented' },
  { id: 'hp_breast_cancer',       group: '건강프로필 · 병력', label: '유방암 / 부인과암 과거력',      type: '선택 입력', status: 'implemented' },
  { id: 'hp_chemotherapy',        group: '건강프로필 · 병력', label: '항암 치료 이력',                type: '선택 입력', status: 'implemented' },
  { id: 'hp_early_menopause_fam', group: '건강프로필 · 병력', label: '가족 중 이른 폐경',             type: '선택 입력', status: 'implemented' },

  // 건강 프로필 — 약물
  { id: 'hp_hrt',                 group: '건강프로필 · 약물', label: 'HRT (호르몬 치료) 복용 중',     type: '선택 입력', status: 'implemented' },
  { id: 'hp_antidepressants',     group: '건강프로필 · 약물', label: '항우울제 복용 중',              type: '선택 입력', status: 'implemented' },
  { id: 'hp_thyroid_meds',        group: '건강프로필 · 약물', label: '갑상선 약 복용 중',             type: '선택 입력', status: 'implemented' },
  { id: 'hp_bp_meds',             group: '건강프로필 · 약물', label: '혈압약 복용 중',               type: '선택 입력', status: 'implemented' },
  { id: 'hp_statins',             group: '건강프로필 · 약물', label: '스타틴 복용 중',               type: '선택 입력', status: 'implemented' },
  { id: 'hp_sleep_meds',          group: '건강프로필 · 약물', label: '수면제 / 진정제 복용 중',      type: '선택 입력', status: 'implemented' },

  // 건강 프로필 — 영양제
  { id: 'hp_vit_d',               group: '건강프로필 · 영양제', label: '비타민 D 복용 중',            type: '선택 입력', status: 'implemented' },
  { id: 'hp_calcium',             group: '건강프로필 · 영양제', label: '칼슘 복용 중',                type: '선택 입력', status: 'implemented' },
  { id: 'hp_magnesium',           group: '건강프로필 · 영양제', label: '마그네슘 복용 중',            type: '선택 입력', status: 'implemented' },
  { id: 'hp_omega3',              group: '건강프로필 · 영양제', label: '오메가-3 복용 중',            type: '선택 입력', status: 'implemented' },
  { id: 'hp_isoflavone',          group: '건강프로필 · 영양제', label: '이소플라본 복용 중',          type: '선택 입력', status: 'implemented' },
  { id: 'hp_vit_e',               group: '건강프로필 · 영양제', label: '비타민 E 복용 중',            type: '선택 입력', status: 'implemented' },
  { id: 'hp_vit_b',               group: '건강프로필 · 영양제', label: '비타민 B6/B12 복용 중',       type: '선택 입력', status: 'implemented' },
  { id: 'hp_iron',                group: '건강프로필 · 영양제', label: '철분 복용 중',                type: '선택 입력', status: 'implemented' },
  { id: 'hp_zinc',                group: '건강프로필 · 영양제', label: '아연 복용 중',                type: '선택 입력', status: 'implemented' },
  { id: 'hp_smoker',              group: '건강프로필 · 생활', label: '흡연 중',                      type: '선택 입력', status: 'implemented' },
];

// ── 2. 상황 분류 기준 (Diagnoses) ─────────────────────────────────────────
export const DIAGNOSES: Diagnosis[] = [
  // ──── Level 1: 병원 방문 필요 ────────────────────────────────────────
  {
    id: 'D01',
    level: 1,
    title: '우울 위험 — 전문의 상담 필요',
    description: '기분 기록이 장기간 저하 상태로 임상적 우울 가능성',
    rules: [
      '기분 점수 1~2점이 14일 연속 기록됨',
      '우울증/불안장애 지병 체크 + 기분 점수 평균 2.5 이하 (30일)',
    ],
    inputs_used: ['mood_score', 'hp_depression'],
    note: '임계값(14일, 2점) 정신건강의학과 전문의 자문 필요',
    status: 'documented',
  },
  {
    id: 'D02',
    level: 1,
    title: '중증 혈관운동 증상 — HRT 상담 필요',
    description: '안면홍조·야간발한이 매우 심하고 빈번해 일상생활 지장',
    rules: [
      '안면홍조 또는 야간발한 심각도 4~5점 × 주 5일 이상 × 4주 지속',
      'SOS 사용 횟수 주 7회 이상 × 2주 연속',
    ],
    inputs_used: ['symptom_hotflash', 'symptom_nightsweat', 'sos_type'],
    note: '임계값(주 5일, 4주) NAMS 가이드라인 기준 검토 필요',
    status: 'documented',
  },
  {
    id: 'D03',
    level: 1,
    title: '갑상선 이상 의심 — 검사 필요',
    description: '갑상선 지병 + 증상 패턴 급격 변화 → 갑상선 기능 검사 필요',
    rules: [
      '갑상선 지병 체크 + 피로/브레인포그/감정기복 심각도 평균 1점 이상 급상승 (2주 내)',
      '갑상선 약 복용 중 + 증상 패턴 기존 대비 유의미한 변화',
    ],
    inputs_used: ['hp_thyroid', 'hp_thyroid_meds', 'symptom_fatigue', 'symptom_brainfog', 'symptom_mood'],
    note: '"급격한 변화" 정의 수치화 필요 — 내분비내과 자문 필요',
    status: 'documented',
  },
  {
    id: 'D04',
    level: 1,
    title: '유방암 과거력 + 심한 혈관운동 증상',
    description: 'HRT 사용 불가 → 비호르몬 치료 전문의 상담 필요',
    rules: [
      '유방암 과거력 체크 + 안면홍조/야간발한 심각도 4~5점',
    ],
    inputs_used: ['hp_breast_cancer', 'symptom_hotflash', 'symptom_nightsweat'],
    note: '이소플라본 복용 여부도 함께 경고 표시 필요',
    status: 'documented',
  },
  {
    id: 'D05',
    level: 1,
    title: '심혈관 이상 신호 의심',
    description: '두근거림 + 심혈관 지병 조합 — 즉각 내과 상담',
    rules: [
      '심혈관 질환 지병 체크 + 두근거림 심각도 4~5점 × 3일 연속',
    ],
    inputs_used: ['hp_cardiovascular', 'symptom_palpitation'],
    note: '심장내과 자문 필요',
    status: 'documented',
  },

  // ──── Level 2: 전문가 상담 권장 ──────────────────────────────────────
  {
    id: 'D06',
    level: 2,
    title: '중등도 혈관운동 증상',
    description: '안면홍조·야간발한이 잦지만 일상 가능한 수준',
    rules: [
      '안면홍조 또는 야간발한 심각도 3점 × 주 3일 이상 × 2주 지속',
      'HRT 미복용 상태',
    ],
    inputs_used: ['symptom_hotflash', 'symptom_nightsweat', 'hp_hrt'],
    status: 'documented',
  },
  {
    id: 'D07',
    level: 2,
    title: '만성 수면 장애',
    description: '수면 기록 장기간 불량',
    rules: [
      '수면 시간 6시간 미만 × 14일 이상 연속',
      '수면장애 증상 심각도 3점 이상 × 14일',
    ],
    inputs_used: ['trigger_sleep_min', 'symptom_sleep'],
    note: '수면무호흡증 지병 체크 시 수면 클리닉 연계',
    status: 'documented',
  },
  {
    id: 'D08',
    level: 2,
    title: '골다공증 + 관절·근육 증상 증가',
    description: '뼈·관절 건강 전문의 확인 필요',
    rules: [
      '골다공증 지병 체크 + 관절/근육통 심각도 3점 이상 × 2주',
    ],
    inputs_used: ['hp_osteoporosis', 'symptom_joint'],
    status: 'documented',
  },
  {
    id: 'D09',
    level: 2,
    title: '수술적 폐경 + 증상 심함',
    description: '자연 폐경보다 급격한 증상 → HRT 적극 검토 필요',
    rules: [
      '수술적 폐경 체크 + HRT 미복용 + 전체 증상 평균 심각도 3점 이상',
    ],
    inputs_used: ['hp_surgical_menopause', 'hp_hrt', 'symptom_hotflash'],
    status: 'documented',
  },
  {
    id: 'D10',
    level: 2,
    title: '편두통 + 호르몬 변동 패턴 일치',
    description: '에스트로겐 변동과 편두통 주기 연관성',
    rules: [
      '편두통 지병 체크 + 두통 심각도 4점 이상 × 월 4회 이상',
    ],
    inputs_used: ['hp_migraine', 'symptom_headache'],
    note: '생리 주기 데이터와 연동하면 더 정확 — peri 단계에서 유효',
    status: 'documented',
  },

  // ──── Level 3: 생활습관 개선으로 관리 가능 ────────────────────────────
  {
    id: 'D11',
    level: 3,
    title: '카페인 트리거 상관관계 높음',
    description: '카페인 섭취일에 안면홍조·두근거림 심각도 유의미하게 높음',
    rules: [
      '카페인 2잔+ 섭취일의 안면홍조 평균 심각도 > 미섭취일 평균 + 1점 (30일 데이터)',
    ],
    inputs_used: ['trigger_caffeine', 'symptom_hotflash', 'symptom_palpitation'],
    note: '30일 이상 데이터 필요. 현재 미구현',
    status: 'documented',
  },
  {
    id: 'D12',
    level: 3,
    title: '음주 트리거 상관관계 높음',
    description: '음주일 또는 다음날 안면홍조·수면장애 심각도 높음',
    rules: [
      '음주 기록일 및 다음날 안면홍조 평균 심각도 > 미음주일 평균 + 1점 (30일)',
    ],
    inputs_used: ['trigger_alcohol', 'symptom_hotflash', 'symptom_sleep'],
    status: 'documented',
  },
  {
    id: 'D13',
    level: 3,
    title: '스트레스 트리거 상관관계 높음',
    description: '스트레스 높은 날 전반적 증상 점수가 높음',
    rules: [
      '스트레스 4~5점인 날의 전체 증상 평균 심각도 > 1~2점인 날보다 1점 이상 높음 (30일)',
    ],
    inputs_used: ['trigger_stress', 'symptom_hotflash', 'symptom_mood', 'symptom_sleep'],
    status: 'documented',
  },
  {
    id: 'D14',
    level: 3,
    title: '수면 부족 → 다음날 증상 점수 높음',
    description: '수면 시간과 다음날 증상 심각도 역상관',
    rules: [
      '수면 6시간 미만 다음날 전체 증상 평균 > 7시간+ 다음날보다 유의미하게 높음 (30일)',
    ],
    inputs_used: ['trigger_sleep_min', 'symptom_fatigue', 'symptom_brainfog'],
    status: 'documented',
  },
  {
    id: 'D15',
    level: 3,
    title: '운동 부족',
    description: '주간 운동 기록이 없는 상태',
    rules: [
      '운동 기록 주 150분 미만 × 3주 연속',
    ],
    inputs_used: ['trigger_exercise_min'],
    status: 'documented',
  },
  {
    id: 'D16',
    level: 3,
    title: '칼슘·비타민D 미복용 + 골다공증',
    description: '골 건강 영양소 보충 필요',
    rules: [
      '골다공증 지병 체크 + 칼슘 미복용 + 비타민D 미복용',
    ],
    inputs_used: ['hp_osteoporosis', 'hp_calcium', 'hp_vit_d'],
    status: 'documented',
  },
  {
    id: 'D17',
    level: 3,
    title: '이소플라본 미섭취 + 안면홍조 잦음',
    description: '이소플라본 식품 섭취를 늘려볼 수 있는 상황',
    rules: [
      '이소플라본 미복용 + 유방암 과거력 없음 + 안면홍조 주 3회 이상',
    ],
    inputs_used: ['hp_isoflavone', 'hp_breast_cancer', 'symptom_hotflash'],
    note: '유방암 과거력 있으면 이소플라본 언급 금지',
    status: 'documented',
  },
  {
    id: 'D18',
    level: 3,
    title: '흡연 중 + 갱년기 증상',
    description: '흡연은 안면홍조 빈도 증가, 골다공증 위험 상승',
    rules: [
      '흡연 체크 + 안면홍조 주 2회 이상',
    ],
    inputs_used: ['hp_smoker', 'symptom_hotflash'],
    status: 'documented',
  },
  {
    id: 'D19',
    level: 3,
    title: '비만 + 전반적 증상 심함',
    description: '체중 관리가 도움이 될 수 있는 상황',
    rules: [
      '비만(BMI 30+) 체크 + 전체 증상 평균 심각도 3점 이상',
    ],
    inputs_used: ['hp_obesity', 'symptom_hotflash'],
    status: 'documented',
  },

  // ──── Level 4: 모니터링 ───────────────────────────────────────────────
  {
    id: 'D20',
    level: 4,
    title: '경미한 증상 — 양호 상태 유지',
    description: '현재 증상이 경미하고 안정적',
    rules: [
      '전체 증상 평균 심각도 1~2점 × 14일',
      '특별한 트리거 상관관계 없음',
    ],
    inputs_used: ['symptom_hotflash', 'symptom_nightsweat', 'mood_score'],
    status: 'documented',
  },
  {
    id: 'D21',
    level: 4,
    title: 'HRT 복용 중 — 효과 모니터링',
    description: 'HRT 복용 중이므로 증상 변화 추이 지속 추적',
    rules: [
      'HRT 복용 체크',
    ],
    inputs_used: ['hp_hrt'],
    status: 'documented',
  },
];

// ── 3. 솔루션 목록 ────────────────────────────────────────────────────────
export const SOLUTIONS: Solution[] = [
  // 즉각 대처 (SOS)
  { id: 'S01', category: 'immediate', title: '4-7-8 호흡법', detail: '4초 들이쉬기 → 7초 참기 → 8초 내쉬기. 안면홍조나 불안이 느껴질 때 시도해보세요.', evidence: 'NAMS 2015 비호르몬 관리 Level I 권고', status: 'implemented' },
  { id: 'S02', category: 'immediate', title: '5-4-3-2-1 그라운딩', detail: '시각 5→청각 4→촉각 3→후각 2→미각 1. CBT 기반 불안 즉각 대처.', evidence: 'CBT for menopause, Hunter MS (2011)', status: 'implemented' },
  { id: 'S03', category: 'immediate', title: '냉각법', detail: '차가운 물 마시기, 선풍기, 냉습포 이마·목에 적용. 안면홍조가 느껴질 때 시도해보세요.', status: 'implemented' },
  { id: 'S04', category: 'immediate', title: '스트레칭', detail: '목·어깨·허리 간단 스트레칭. 근육 긴장 이완.', status: 'implemented' },

  // 생활습관
  { id: 'S10', category: 'lifestyle', title: '카페인 줄이기', detail: '하루 200mg 이하 (아메리카노 1잔 약 75~150mg). 오후 2시 이후 카페인 금지.', evidence: 'NAMS 2015', status: 'documented' },
  { id: 'S11', category: 'lifestyle', title: '음주 줄이기', detail: '여성 기준 1잔/일 이하 (알코올 10g = 맥주 350ml 1캔 = 소주 1잔).', evidence: 'NAMS 2015', status: 'documented' },
  { id: 'S12', category: 'lifestyle', title: '수면 위생 개선', detail: '취침 1시간 전 스마트폰 금지. 침실 온도 18~20°C. 기상 시간 일정하게 유지.', evidence: 'CBT-I 기반', status: 'documented' },
  { id: 'S13', category: 'lifestyle', title: '유산소 운동 시작', detail: '주 150분 (걷기 30분 × 5일). 전반적인 건강 유지에 도움이 될 수 있어요.', evidence: 'Daley A, Cochrane 2014', status: 'documented' },
  { id: 'S14', category: 'lifestyle', title: '근력 운동', detail: '주 2회 근력 운동. 골밀도 유지·대사 개선.', status: 'documented' },
  { id: 'S15', category: 'lifestyle', title: '금연', detail: '금연은 전반적인 건강에 도움이 되는 좋은 선택이에요.', status: 'documented' },
  { id: 'S16', category: 'lifestyle', title: '체중 관리', detail: '균형 잡힌 식단과 규칙적인 운동으로 건강한 체중을 유지해보세요.', status: 'documented' },
  { id: 'S17', category: 'lifestyle', title: '스트레스 관리', detail: '마음챙김, 명상, SOS 호흡법 일상화. 주 1~2회 이완 활동.', status: 'documented' },
  { id: 'S18', category: 'lifestyle', title: '햇빛 30분/일', detail: '하루 30분 정도 햇빛을 쬐면 기분 전환에 도움이 될 수 있어요.', status: 'documented' },

  // 영양
  { id: 'S20', category: 'nutrition', title: '이소플라본 식품 섭취', detail: '두부 150g/일 or 된장국 1그릇/일. 이소플라본 40~70mg/일 목표.', evidence: 'Franco OH, JAMA 2016 — 안면홍조 26% 감소', status: 'documented' },
  { id: 'S21', category: 'nutrition', title: '칼슘 충분히 섭취', detail: '700mg/일 (우유 200ml 2잔, 뱅어포 15g, 멸치 30g). 칼슘 보충제는 식품 우선 후 부족분만.', evidence: '한국영양학회 DRI 2020', status: 'documented' },
  { id: 'S22', category: 'nutrition', title: '비타민D 보충', detail: '800~1000IU/일. 햇빛 30분 or 보충제. 골다공증 지병 시 1500~2000IU 검토.', evidence: 'NICE NG23 2019', status: 'documented' },
  { id: 'S23', category: 'nutrition', title: '마그네슘 섭취', detail: '호박씨, 아몬드, 검은콩 등에 풍부해요. 균형 잡힌 영양 섭취에 도움이 돼요.', status: 'documented' },
  { id: 'S24', category: 'nutrition', title: '오메가-3 섭취', detail: '1000mg/일 (고등어·삼치 1토막 주 2회, 들기름 1~2큰술). 기분·심혈관·관절.', status: 'documented' },
  { id: 'S25', category: 'nutrition', title: '당분·정제탄수 줄이기', detail: '흰쌀 대신 잡곡, 단 음료 대신 물이나 차를 선택해보세요.', status: 'documented' },
  { id: 'S26', category: 'nutrition', title: '수분 충분히 섭취', detail: '하루 1.5~2L 수분 섭취는 건강한 생활 습관의 기본이에요.', status: 'documented' },

  // 의료적
  { id: 'S30', category: 'medical', title: '산부인과 — HRT 상담', detail: 'HRT에 대해 전문의와 상담해보세요. 금기증(유방암 등) 여부 확인이 필요해요.', evidence: 'NAMS 2022 Position Statement', status: 'documented' },
  { id: 'S31', category: 'medical', title: '정신건강의학과 — 우울 상담', detail: 'PHQ-9 선별검사. 갱년기 우울 vs 임상 우울 감별 필요.', status: 'documented' },
  { id: 'S32', category: 'medical', title: '갑상선 기능 검사', detail: 'TSH, Free T4 혈액검사. 갱년기 증상과 구분 필수.', status: 'documented' },
  { id: 'S33', category: 'medical', title: '골밀도 검사 (DEXA)', detail: '폐경 후 여성 2년 1회 권장. 골다공증 진행 여부 확인.', status: 'documented' },
  { id: 'S34', category: 'medical', title: '비호르몬 치료 상담', detail: '유방암 과거력 등 HRT 금기 시. 파록세틴, CBT, 이소플라본 대안.', evidence: 'NAMS 2015 Nonhormonal Management', status: 'documented' },
  { id: 'S35', category: 'medical', title: '수면 클리닉', detail: '수면무호흡증 + 야간발한 구분. 수면다원검사 필요할 수 있음.', status: 'documented' },
  { id: 'S36', category: 'medical', title: '심장내과 상담', detail: '두근거림 + 심혈관 지병 — 즉각 내과 방문.', status: 'documented' },

  // 모니터링
  { id: 'S40', category: 'monitoring', title: '주간 증상 추이 확인', detail: '7일 차트에서 패턴 확인. 점수 상승 추세 시 레벨 재분류.', status: 'implemented' },
  { id: 'S41', category: 'monitoring', title: 'HRT 효과 추적', detail: 'HRT 시작 후 4~8주 증상 변화 추이 비교.', status: 'documented' },
];

// ── 4. 흐름 매핑 (입력 → 상황 → 솔루션) ─────────────────────────────────
export const FLOW: FlowRule[] = [
  { priority: 1,  inputs: ['hp_breast_cancer', 'symptom_hotflash'],                        diagnosis_id: 'D04', solution_ids: ['S34', 'S40'] },
  { priority: 2,  inputs: ['hp_cardiovascular', 'symptom_palpitation'],                     diagnosis_id: 'D05', solution_ids: ['S36'] },
  { priority: 3,  inputs: ['mood_score', 'hp_depression'],                                  diagnosis_id: 'D01', solution_ids: ['S31', 'S17', 'S13'] },
  { priority: 4,  inputs: ['hp_thyroid', 'hp_thyroid_meds', 'symptom_fatigue'],             diagnosis_id: 'D03', solution_ids: ['S32'] },
  { priority: 5,  inputs: ['symptom_hotflash', 'symptom_nightsweat', 'sos_type'],           diagnosis_id: 'D02', solution_ids: ['S30', 'S01', 'S03', 'S10', 'S11'] },
  { priority: 6,  inputs: ['hp_surgical_menopause', 'hp_hrt', 'symptom_hotflash'],          diagnosis_id: 'D09', solution_ids: ['S30', 'S01', 'S03'] },
  { priority: 7,  inputs: ['trigger_sleep_min', 'symptom_sleep'],                           diagnosis_id: 'D07', solution_ids: ['S12', 'S23', 'S35'] },
  { priority: 8,  inputs: ['hp_osteoporosis', 'symptom_joint'],                             diagnosis_id: 'D08', solution_ids: ['S21', 'S22', 'S14', 'S33'] },
  { priority: 9,  inputs: ['hp_migraine', 'symptom_headache'],                              diagnosis_id: 'D10', solution_ids: ['S10', 'S17', 'S30'] },
  { priority: 10, inputs: ['symptom_hotflash', 'symptom_nightsweat', 'hp_hrt'],             diagnosis_id: 'D06', solution_ids: ['S30', 'S01', 'S03', 'S10', 'S11', 'S20'] },
  { priority: 11, inputs: ['trigger_caffeine', 'symptom_hotflash'],                         diagnosis_id: 'D11', solution_ids: ['S10'] },
  { priority: 12, inputs: ['trigger_alcohol', 'symptom_hotflash'],                          diagnosis_id: 'D12', solution_ids: ['S11'] },
  { priority: 13, inputs: ['trigger_stress', 'symptom_mood'],                               diagnosis_id: 'D13', solution_ids: ['S17', 'S01', 'S02'] },
  { priority: 14, inputs: ['trigger_sleep_min', 'symptom_fatigue'],                         diagnosis_id: 'D14', solution_ids: ['S12', 'S23'] },
  { priority: 15, inputs: ['trigger_exercise_min'],                                          diagnosis_id: 'D15', solution_ids: ['S13', 'S14'] },
  { priority: 16, inputs: ['hp_osteoporosis', 'hp_calcium', 'hp_vit_d'],                    diagnosis_id: 'D16', solution_ids: ['S21', 'S22', 'S18'] },
  { priority: 17, inputs: ['hp_isoflavone', 'hp_breast_cancer', 'symptom_hotflash'],        diagnosis_id: 'D17', solution_ids: ['S20'] },
  { priority: 18, inputs: ['hp_smoker', 'symptom_hotflash'],                                diagnosis_id: 'D18', solution_ids: ['S15'] },
  { priority: 19, inputs: ['hp_obesity', 'symptom_hotflash'],                               diagnosis_id: 'D19', solution_ids: ['S16', 'S13', 'S25'] },
  { priority: 20, inputs: ['hp_hrt'],                                                        diagnosis_id: 'D21', solution_ids: ['S41', 'S40'] },
  { priority: 99, inputs: ['symptom_hotflash', 'mood_score'],                               diagnosis_id: 'D20', solution_ids: ['S40'] },
];
