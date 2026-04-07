// ─────────────────────────────────────────────────────────────────
// 건강 프로필 항목 정의 + 가중치 (weight)
//
// weight 의미:
//   5 = Critical  — 리포트 해석을 완전히 바꾸는 요인 (반드시 먼저 다룸)
//   4 = High      — 증상에 강하게 영향을 줌
//   3 = Medium    — 중요하지만 Critical/High 없을 때 다룸
//   2 = Low       — 보조적 요인
//   1 = Minor     — Critical/High 요인이 없을 때만 언급
//
// 억제 규칙 (Suppression Rule):
//   사용자에게 weight ≥ 4 요인이 있으면 weight ≤ 1 요인은
//   리포트 상위에 노출하지 않는다.
//   예: 음주 heavy + 아연 미복용 → "아연이 부족해서 아파요" 라고 하지 않음.
// ─────────────────────────────────────────────────────────────────

export interface HealthItem {
  id: string;
  label: string;
  weight: 1 | 2 | 3 | 4 | 5;
  note?: string; // 앱 내부 분석 참고용 메모
}

// ─── 1. 질병 기록 (현재 앓고 있는 지병) ──────────────────────────
export const CONDITIONS: HealthItem[] = [
  {
    id: 'thyroid',
    label: '갑상선 기능 이상',
    weight: 5,
    note: '갱년기 증상과 거의 동일 — 혼동 위험 높음. 별도 의사 상담 안내 필요.',
  },
  {
    id: 'diabetes',
    label: '당뇨 / 혈당 이상',
    weight: 4,
    note: '혈당 변동과 안면홍조가 관련될 수 있음.',
  },
  {
    id: 'obesity',
    label: '비만 (BMI 30 이상)',
    weight: 4,
    note: '지방조직이 에스트로겐 대사 → 안면홍조 심화.',
  },
  {
    id: 'osteoporosis',
    label: '골다공증',
    weight: 3,
    note: '에스트로겐 저하 직접 연관. 칼슘·비타민D 섭취 안내 우선.',
  },
  {
    id: 'migraine',
    label: '편두통',
    weight: 3,
    note: '에스트로겐 변동과 직접 연관. 트리거 패턴 강조 필요.',
  },
  {
    id: 'sleep_apnea',
    label: '수면무호흡증',
    weight: 3,
    note: '야간발한과 혼동 잦음. 수면 기록 해석 시 주의.',
  },
  {
    id: 'hypertension',
    label: '고혈압',
    weight: 3,
    note: '일부 혈압약이 안면홍조와 관련될 수 있음. 약물 섹션 연동.',
  },
  {
    id: 'cardiovascular',
    label: '심혈관 질환',
    weight: 3,
    note: '에스트로겐 보호 소실 → 위험 증가. 운동 권고 강도 조정 필요.',
  },
  {
    id: 'depression_anxiety',
    label: '우울증 / 불안장애',
    weight: 4,
    note: '갱년기 증상(피로·수면·감정기복)과 거의 동일 — 기분 기록 해석 시 반드시 참고. SSRI/SNRI 약물 섹션과 연동.',
  },
  {
    id: 'ibs',
    label: '과민성장증후군 (IBS)',
    weight: 2,
    note: '복부 팽만 등 증상이 갱년기 증상과 겹칠 수 있음.',
  },
  {
    id: 'autoimmune',
    label: '자가면역질환 (류마티스 등)',
    weight: 2,
    note: '자가면역질환이 증상에 영향을 줄 수 있음.',
  },
];

// ─── 2. 병력 기록 (과거 이력 / 수술) ────────────────────────────
export const MEDICAL_HISTORY: HealthItem[] = [
  {
    id: 'surgical_menopause',
    label: '수술로 인한 폐경 (난소 절제 등)',
    weight: 5,
    note: '자연 폐경보다 증상이 훨씬 급격. 모든 분석 기준이 달라짐.',
  },
  {
    id: 'breast_cancer',
    label: '유방암 / 부인과암 과거력',
    weight: 5,
    note: 'HRT 및 이소플라본 관련 추천 완전 배제 필요.',
  },
  {
    id: 'chemotherapy',
    label: '항암제 / 화학요법 치료 이력',
    weight: 4,
    note: '조기 폐경과 관련될 수 있음. 증상 패턴 참고.',
  },
  {
    id: 'early_menopause_family',
    label: '가족 중 이른 폐경 (45세 이전)',
    weight: 2,
    note: '조기 폐경 위험 참고용.',
  },
  {
    id: 'childbirth',
    label: '출산 경험 있음',
    weight: 1,
    note: '배경 정보.',
  },
  {
    id: 'early_menarche',
    label: '초경이 빠른 편 (11세 이전)',
    weight: 1,
    note: '배경 정보.',
  },
];

// ─── 3. 복용 약물 ────────────────────────────────────────────────
export const MEDICATIONS: HealthItem[] = [
  {
    id: 'hrt',
    label: '호르몬 치료 (HRT) 복용 중',
    weight: 5,
    note: 'HRT 중이면 모든 분석 맥락이 달라짐. 최우선 표시.',
  },
  {
    id: 'antidepressants',
    label: '항우울제 복용 중 (SSRI · SNRI 등)',
    weight: 4,
    note: 'SSRI/SNRI는 안면홍조에도 처방됨. 기분 기록 해석 시 참고.',
  },
  {
    id: 'thyroid_meds',
    label: '갑상선 약 복용 중',
    weight: 3,
    note: '갑상선 관리 중임을 인식. 수치 안정 전제로 분석.',
  },
  {
    id: 'blood_pressure_meds',
    label: '혈압약 복용 중',
    weight: 3,
    note: '일부 약이 안면홍조 부작용. 트리거 분석 시 참고.',
  },
  {
    id: 'statins',
    label: '콜레스테롤 약 (스타틴) 복용 중',
    weight: 2,
    note: '근육통 부작용 → 운동 기록 해석 시 참고.',
  },
  {
    id: 'sleep_meds',
    label: '수면제 / 진정제 복용 중',
    weight: 2,
    note: '수면 기록 해석 시 참고. 수면 질 평가에 영향.',
  },
  {
    id: 'other_meds',
    label: '기타 처방약 복용 중',
    weight: 1,
    note: '배경 정보.',
  },
];

// ─── 4. 영양제 · 보조식품 (현재 복용 중인 것) ───────────────────
export const SUPPLEMENTS: HealthItem[] = [
  {
    id: 'vitamin_d',
    label: '비타민 D',
    weight: 3,
    note: '부족 시 기분·수면·면역 전반 영향. 일조량 기록과 연동.',
  },
  {
    id: 'calcium',
    label: '칼슘',
    weight: 3,
    note: '골다공증 예방 핵심. 골다공증 지병과 연동.',
  },
  {
    id: 'magnesium',
    label: '마그네슘',
    weight: 2,
    note: '수면·불안·근육통에 보조적 역할.',
  },
  {
    id: 'omega3',
    label: '오메가-3',
    weight: 2,
    note: '기분·심혈관·관절에 보조적 역할.',
  },
  {
    id: 'isoflavone',
    label: '이소플라본 (대두 추출물)',
    weight: 1,
    note: '유방암 과거력 있으면 추천 배제. breast_cancer 체크 시 주의 표시.',
  },
  {
    id: 'vitamin_e',
    label: '비타민 E',
    weight: 1,
  },
  {
    id: 'vitamin_b',
    label: '비타민 B6 / B12',
    weight: 1,
    note: '피로·인지 관련 보조.',
  },
  {
    id: 'iron',
    label: '철분',
    weight: 1,
  },
  {
    id: 'zinc',
    label: '아연',
    weight: 1,
  },
  {
    id: 'other_supplements',
    label: '기타 영양제',
    weight: 1,
  },
];

// ─── 가중치 억제 임계값 ─────────────────────────────────────────
// Critical/High 요인(weight ≥ HIGH_THRESHOLD)이 있을 때
// Minor 요인(weight ≤ SUPPRESS_BELOW)은 리포트 상위에 노출 안 함.
export const HIGH_THRESHOLD = 4;
export const SUPPRESS_BELOW = 1;

// ─── 유틸: 전체 항목 ID → label 매핑 ────────────────────────────
export function getItemLabel(id: string): string {
  const all = [...CONDITIONS, ...MEDICAL_HISTORY, ...MEDICATIONS, ...SUPPLEMENTS];
  return all.find(item => item.id === id)?.label ?? id;
}

// ─── 유틸: 선택된 항목들 중 최고 weight 반환 ─────────────────────
export function getMaxWeight(selectedIds: string[]): number {
  const all = [...CONDITIONS, ...MEDICAL_HISTORY, ...MEDICATIONS, ...SUPPLEMENTS];
  return selectedIds.reduce((max, id) => {
    const item = all.find(i => i.id === id);
    return item ? Math.max(max, item.weight) : max;
  }, 0);
}
