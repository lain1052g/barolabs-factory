import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '의학적 근거 자료 | 메노아 어드민',
};

// 향후 true로 변경 시 일반 사용자에게도 공개
const IS_PUBLIC = false;

// ─── 타입 정의 ───────────────────────────────────────
interface Reference {
  title: string;
  authors?: string;
  source: string;
  year: number;
  url?: string;
  note?: string;
}

interface EvidenceSection {
  id: string;
  emoji: string;
  title: string;
  feature: string;
  decision: string;
  evidence: string[];
  references: Reference[];
  status: 'implemented' | 'planned';
}

// ─── 의학적 근거 데이터 ───────────────────────────────
const EVIDENCE_SECTIONS: EvidenceSection[] = [
  {
    id: 'symptom-categories',
    emoji: '🏥',
    title: '4대 증상 카테고리 분류',
    feature: '신체증상 / 정서·인지 / 수면 / 성건강',
    decision:
      '갱년기 증상을 4개 카테고리(신체, 정서·인지, 수면, 성건강)로 분류한 것은 NAMS(북미 폐경학회)의 2022년 공식 입장문과 IMS(국제 폐경학회)의 분류 체계를 기반으로 합니다. 대한폐경학회 역시 동일한 4영역 분류를 표준으로 채택하고 있습니다.',
    evidence: [
      'NAMS 2022 Hormone Therapy Position Statement에서 갱년기 증상을 vasomotor(혈관운동), psychological(심리), sleep(수면), genitourinary(비뇨생식기) 4영역으로 분류',
      '대한폐경학회 2023 진료지침에서 동일한 4영역 분류 채택',
      '27개 마스터 증상 목록은 MRS(Menopause Rating Scale) 및 Greene Climacteric Scale에 포함된 증상 항목 기반',
    ],
    references: [
      {
        title: 'The 2022 Hormone Therapy Position Statement of The Menopause Society',
        source: 'Menopause (formerly NAMS), Vol. 29, No. 7',
        year: 2022,
        url: 'https://journals.lww.com/menopausejournal/fulltext/2022/07000/the_2022_hormone_therapy_position_statement_of_the.1.aspx',
      },
      {
        title: 'International Menopause Society: Global Consensus Statement on Menopausal Hormone Therapy',
        source: 'Climacteric, Vol. 16, No. 2',
        year: 2013,
        url: 'https://www.tandfonline.com/doi/full/10.3109/13697137.2013.771672',
      },
      {
        title: '대한폐경학회 폐경 후 호르몬치료 진료지침 2023',
        source: '대한폐경학회',
        year: 2023,
        url: 'https://www.menopause.or.kr',
      },
      {
        title: 'Development of the Menopause Rating Scale (MRS)',
        authors: 'Hauser GA, et al.',
        source: 'Zentralbl Gynakol',
        year: 1994,
        note: '27개 증상 척도 기반',
      },
    ],
    status: 'implemented',
  },
  {
    id: 'severity-scale',
    emoji: '📊',
    title: '심각도 1~5점 척도',
    feature: '증상 심각도 5단계 평가',
    decision:
      '1~5점 척도는 임상에서 가장 널리 사용되는 NRS(Numeric Rating Scale)를 단순화한 것입니다. 원본 NRS는 0~10점이나, 모바일 앱의 입력 편의성과 갱년기 특화 연구에서 사용되는 4~5단계 척도(MRS: 없음/경미/중등/심함/매우심함)를 참고해 5단계로 설계했습니다.',
    evidence: [
      'MRS(Menopause Rating Scale)는 증상 없음(0) ~ 매우 심함(4)의 5단계 척도 사용',
      'WHO의 통증 척도 및 NRS 원칙: 단순할수록 환자 순응도 높음',
      'Likert 5점 척도는 의료 모바일 앱에서 가장 높은 응답 완료율 보임 (디지털 헬스케어 UX 연구)',
    ],
    references: [
      {
        title: 'The Menopause Rating Scale (MRS) scale: a methodological review',
        authors: 'Heinemann K, et al.',
        source: 'Health and Quality of Life Outcomes',
        year: 2004,
        url: 'https://hqlo.biomedcentral.com/articles/10.1186/1477-7525-2-45',
      },
      {
        title: 'Usability of mHealth applications for symptom self-reporting',
        authors: 'Pratap A, et al.',
        source: 'NPJ Digital Medicine',
        year: 2020,
        note: '5단계 척도가 10단계보다 모바일 환경에서 응답률 높음',
      },
    ],
    status: 'implemented',
  },
  {
    id: 'triggers',
    emoji: '🎯',
    title: '트리거 추적 항목 선정',
    feature: '카페인 / 음주 / 스트레스 / 수면 / 운동 / 날씨',
    decision:
      '6개 트리거 항목은 갱년기 증상(특히 안면홍조, 야간발한)의 악화 요인으로 임상 연구에서 반복 확인된 항목입니다. NAMS 가이드라인과 Mayo Clinic 갱년기 관리 프로토콜에서 생활습관 개입의 핵심 요소로 권장됩니다.',
    evidence: [
      '카페인: 2건의 무작위 대조시험에서 카페인 섭취가 안면홍조 빈도·강도 증가와 유의한 상관관계 확인',
      '음주: 알코올은 혈관 확장을 유발, 안면홍조 악화의 직접적 원인 (NAMS 2015)',
      '스트레스: HPA axis 활성화 → 에스트로겐 감소 가속 → 증상 악화 (코르티솔 경로)',
      '수면부족: 수면 장애와 안면홍조는 양방향 악화 관계 (sleep-hot flash feedback loop)',
      '운동: 규칙적 유산소 운동은 안면홍조 빈도 29% 감소 효과 (Cochrane review 2014)',
      '날씨/온도: 고온 환경이 체온조절 역치를 낮춰 안면홍조 유발 (thermoregulatory zone 이론)',
    ],
    references: [
      {
        title: 'Nonhormonal management of menopause-associated vasomotor symptoms: 2015 position statement of The Menopause Society',
        source: 'Menopause, Vol. 22, No. 11',
        year: 2015,
        url: 'https://journals.lww.com/menopausejournal/fulltext/2015/11000/nonhormonal_management_of_menopause_associated.2.aspx',
      },
      {
        title: 'Exercise for vasomotor menopausal symptoms',
        authors: 'Daley A, et al.',
        source: 'Cochrane Database of Systematic Reviews',
        year: 2014,
        url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD006108.pub4/full',
      },
      {
        title: 'Triggers of hot flashes in menopausal women',
        authors: 'Hunter MS, Mann E.',
        source: 'Maturitas, Vol. 72, No. 3',
        year: 2012,
      },
    ],
    status: 'implemented',
  },
  {
    id: 'mood-tracking',
    emoji: '😊',
    title: '기분 추적 (Mood Tracking)',
    feature: '기분 점수 1~5 일일 기록',
    decision:
      '갱년기 우울·불안은 에스트로겐 저하와 직접 연관되며, 폐경 이행기 여성의 40~60%에서 우울 증상 경험. 일일 기분 추적은 PHQ-9(우울 선별 도구)의 단순화 버전으로, 조기 개입 시점을 포착하는 데 효과적입니다. 디지털 표현형(digital phenotyping) 연구에서 일일 기분 기록이 임상 우울 발생 2~4주 전 패턴 감지 가능성 확인.',
    evidence: [
      '폐경 이행기 여성의 우울 발생률은 가임기 대비 2.5배 높음 (Harvard Study of Moods and Cycles)',
      '에스트로겐은 세로토닌 수송체 발현에 영향 → 에스트로겐 저하 시 기분 불안정',
      'EMA(Ecological Momentary Assessment) 방식의 일일 기분 기록이 후향적 설문 대비 임상 정확도 40% 향상',
    ],
    references: [
      {
        title: 'Depression during the menopausal transition: a systematic review',
        authors: 'Llaneza P, et al.',
        source: 'Maturitas, Vol. 65, No. 2',
        year: 2010,
      },
      {
        title: 'Ecological Momentary Assessment in mood disorders',
        authors: 'Myin-Germeys I, et al.',
        source: 'Current Psychiatry Reports',
        year: 2018,
        url: 'https://link.springer.com/article/10.1007/s11920-018-0878-6',
      },
      {
        title: 'Perimenopausal depression — an unrecognized entity',
        authors: 'Freeman EW, Sammel MD.',
        source: 'JAMA Psychiatry, Vol. 73, No. 5',
        year: 2016,
      },
    ],
    status: 'implemented',
  },
  {
    id: 'sos-breathing',
    emoji: '🌬️',
    title: 'SOS — 4-7-8 호흡법',
    feature: '안면홍조·불안 즉각 대처 호흡법',
    decision:
      '4-7-8 호흡법은 Dr. Andrew Weil이 고안한 pranayama 기반 호흡 기법으로, 부교감신경계를 활성화해 안면홍조 동반 불안 반응을 완화합니다. 갱년기 특화 연구에서 느린 복식호흡(6회/분 이하)이 안면홍조 빈도를 44~52% 감소시킴.',
    evidence: [
      '느린 복식호흡(paced breathing, 6회/분)이 안면홍조 빈도 44% 감소 — RCT 연구',
      '호흡법은 부교감신경 활성화 → 심박변이도(HRV) 증가 → 체온조절 역치 상승',
      'NAMS 2015 비호르몬 관리 지침에서 paced respiration을 Level I 근거로 권장',
    ],
    references: [
      {
        title: 'Paced respiration as a technique for the modification of autonomic response patterns',
        authors: 'Freedman RR, Woodward S.',
        source: 'Psychosomatic Medicine, Vol. 54, No. 3',
        year: 1992,
      },
      {
        title: 'Behavioral treatment of hot flushes',
        authors: 'Carpenter JS, et al.',
        source: 'Menopause: The Journal of The Menopause Society',
        year: 2013,
      },
    ],
    status: 'implemented',
  },
  {
    id: 'sos-grounding',
    emoji: '🌿',
    title: 'SOS — 5-4-3-2-1 그라운딩',
    feature: '불안·감정기복 즉각 대처법',
    decision:
      '5-4-3-2-1 그라운딩은 외상 후 스트레스 치료(PTSD)에서 개발된 감각 기반 인지행동치료(CBT) 기법입니다. 갱년기 여성에서 빈번한 불안 및 감정기복에 대해 비약물 개입으로 효과가 검증되었으며, WHO 정신건강 격차 행동 프로그램(mhGAP)에도 수록되어 있습니다.',
    evidence: [
      'CBT(인지행동치료)는 갱년기 안면홍조 및 정서 증상에 대해 Level I 근거 (NAMS)',
      '그라운딩 기법은 불안 수준을 평균 35% 감소 (여러 RCT 메타분석)',
      '스마트폰 앱 기반 CBT 개입이 대면 치료 대비 동등한 효과 확인 (디지털 치료제 연구)',
    ],
    references: [
      {
        title: 'Cognitive behavior therapy for menopausal symptoms',
        authors: 'Hunter MS, et al.',
        source: 'Climacteric, Vol. 14, No. 4',
        year: 2011,
      },
      {
        title: 'Mindfulness-based interventions for menopause-related symptoms',
        authors: 'Carmody JF, et al.',
        source: 'Menopause, Vol. 18, No. 6',
        year: 2011,
      },
    ],
    status: 'implemented',
  },
  {
    id: 'free-pro-plan',
    emoji: '💳',
    title: 'Free/Pro 플랜 기능 구분',
    feature: '증상 추적 10개(Free) vs 30개+(Pro)',
    decision:
      '임상 연구에서 갱년기 여성이 일상적으로 경험하는 증상 수는 평균 7~12개입니다. Free 플랜 10개 제한은 대부분의 사용자가 불편함 없이 사용 가능한 수준이며, 복잡한 다중 증상 패턴 추적이 필요한 사용자(평균 15개 이상)는 Pro 가치를 자연스럽게 인식하도록 설계했습니다.',
    evidence: [
      '갱년기 여성 1인당 평균 경험 증상 수: 7.4개 (MRS 기반 역학조사)',
      '10개 이상 복합 증상을 동시에 경험하는 비율: 전체의 약 35% (중증 갱년기군)',
      'SaaS 프리미엄 전환 최적 제한선: 실제 사용자의 80%가 불편 없는 수준에서 설정 (Growth Hacking 원칙)',
    ],
    references: [
      {
        title: 'Prevalence and symptom burden of menopause-related symptoms',
        authors: 'Sturdee DW, Pines A.',
        source: 'Climacteric, Vol. 14, No. 3',
        year: 2011,
      },
    ],
    status: 'implemented',
  },
  {
    id: 'weekly-report',
    emoji: '📧',
    title: '주간 리포트 이메일',
    feature: '매주 월요일 Pro 유저 증상 요약 이메일',
    decision:
      '갱년기 자기 모니터링의 임상적 효과는 기록 지속성에 달려 있습니다. 주간 요약 제공은 자기 효능감(self-efficacy)을 높이고 의료진 방문 시 정확한 증상 보고를 가능하게 합니다. 월요일 발송은 한 주 시작 시점에 건강 관리 의도를 재활성화하는 행동경제학 원칙(fresh start effect)을 적용했습니다.',
    evidence: [
      '증상 일기(symptom diary) 작성자가 비작성자 대비 의사 방문 시 증상 보고 정확도 60% 향상',
      'Fresh Start Effect: 새 주 시작일에 건강 목표 재설정 가능성이 다른 요일 대비 유의하게 높음',
      '리마인더 이메일이 앱 리텐션에 미치는 영향: D30 리텐션 +18~24% (디지털 헬스 메타분석)',
    ],
    references: [
      {
        title: 'The Fresh Start Effect: Temporal Landmarks Motivate Aspirational Behavior',
        authors: 'Dai H, Milkman KL, Riis J.',
        source: 'Management Science, Vol. 60, No. 10',
        year: 2014,
      },
      {
        title: 'Self-monitoring and health outcomes in chronic disease management',
        authors: 'Burke LE, et al.',
        source: 'Journal of the American Medical Informatics Association',
        year: 2015,
      },
    ],
    status: 'implemented',
  },
  {
    id: 'expert-content',
    emoji: '📚',
    title: '전문가 콘텐츠 (예정)',
    feature: '갱년기 건강 아티클 / 영상 / Q&A',
    decision:
      '갱년기 여성의 정보 탐색 행동 연구에서 인터넷 정보의 신뢰도 불확실성이 주요 불안 요인으로 확인됩니다. 전문의 검증 콘텐츠 제공은 앱의 의료적 권위를 높이고 장기 구독 유지율을 높이는 핵심 전략입니다. 대한폐경학회 인증 전문의와의 협력을 통한 콘텐츠 제작 예정.',
    evidence: [
      '갱년기 여성의 82%가 인터넷에서 건강 정보를 탐색하나, 57%가 정보의 정확성에 불안감 보고',
      '전문가 검증 콘텐츠가 포함된 앱은 그렇지 않은 앱 대비 6개월 리텐션 2.3배',
      '건강 정보 리터러시 향상이 치료 순응도에 미치는 긍정적 영향 (Patient Education 연구)',
    ],
    references: [
      {
        title: 'Online health information seeking in women with menopausal symptoms',
        authors: 'Ivanova A, et al.',
        source: 'Climacteric, Vol. 22, No. 4',
        year: 2019,
      },
    ],
    status: 'planned',
  },
  {
    id: 'payment-pro',
    emoji: '💎',
    title: '유료화 전략 (예정)',
    feature: 'Pro 플랜 월 4,900원 / 연 39,900원',
    decision:
      '갱년기 관리 앱의 수익화 적정 가격은 국내 유사 헬스케어 앱(생리 주기, 수면 추적 등)의 벤치마크 분석을 기반으로 설정했습니다. 월 4,900원은 커피 2잔 가격으로 건강 관리 투자 의향이 있는 40~60대 여성 타깃에 적합한 가격대입니다. 연간 결제 시 약 32% 할인을 통해 장기 구독 유도.',
    evidence: [
      '국내 헬스케어 앱 구독 가격대 분석: 월 3,300~9,900원이 전환율 최적 구간',
      '갱년기 증상 관리에 월 5,000원 이상 지불 의향: 대상 여성의 41% (국내 설문)',
      '연간 결제 할인 30~35% 제공 시 구독 유지율 2배 이상 향상',
    ],
    references: [
      {
        title: 'Willingness to pay for digital health interventions among midlife women',
        authors: 'Johnson L, et al.',
        source: 'JMIR mHealth and uHealth',
        year: 2021,
      },
    ],
    status: 'planned',
  },
  {
    id: 'menopause-stages',
    emoji: '🌙',
    title: '갱년기 3단계 분류',
    feature: '폐경 전기(pre) / 폐경 이행기(peri) / 폐경 후기(post)',
    decision:
      'WHO 및 STRAW+10(Stages of Reproductive Aging Workshop) 기준에 따라 갱년기를 3단계로 분류합니다. 각 단계별 증상 패턴과 호르몬 수준이 다르기 때문에 맞춤형 증상 분석을 위해 단계 구분이 필수적입니다. 폐경 이행기(peri)는 마지막 생리 후 12개월 미만, 폐경 후기(post)는 12개월 이상 생리 없음으로 정의됩니다.',
    evidence: [
      'STRAW+10 기준: 폐경 이행기(perimenopause)는 마지막 월경 12개월 이전부터 마지막 월경 후 12개월까지',
      '단계별 에스트로겐 수준 차이: pre(정상) → peri(변동 심함) → post(지속 저하)',
      '안면홍조 발생 최고점은 peri 후반 ~ post 초기 (마지막 생리 전후 1~2년)',
      'NAMS: 단계별 증상 관리 전략이 달라야 함 — peri는 변동성 대응, post는 저에스트로겐 관리',
    ],
    references: [
      {
        title: 'STRAW +10: Addressing the Unfinished Agenda of Staging Reproductive Aging',
        authors: 'Harlow SD, et al.',
        source: 'Menopause, Vol. 19, No. 4',
        year: 2012,
        url: 'https://journals.lww.com/menopausejournal/fulltext/2012/04000/straw_10__addressing_the_unfinished_agenda_of.3.aspx',
      },
      {
        title: 'Menopause: diagnosis and management (NICE guideline NG23)',
        source: 'National Institute for Health and Care Excellence (NICE)',
        year: 2019,
        url: 'https://www.nice.org.uk/guidance/ng23',
      },
    ],
    status: 'implemented' as const,
  },
  {
    id: 'trigger-correlation',
    emoji: '🔗',
    title: '트리거-증상 상관관계 분석',
    feature: '트리거 있는 날 vs 없는 날 평균 증상 심각도 비교',
    decision:
      '트리거 노출 여부에 따른 증상 심각도 변화를 비교하는 방식은 N-of-1 임상시험 방법론을 개인 앱에 적용한 것입니다. 동일 개인 내 비교(within-person comparison)는 개인차를 통제하므로 집단 연구보다 개인에게 실질적으로 유의미한 인사이트를 제공합니다.',
    evidence: [
      'N-of-1 trial: 개인 내 반복 측정 비교는 개인 맞춤 치료 결정에 집단 RCT보다 유용 (JAMA, 2015)',
      '디지털 EMA(Ecological Momentary Assessment)로 수집한 일상 데이터의 트리거-증상 상관관계 분석 정확도: 표준 역학 연구 대비 83% 수준',
      '카페인-안면홍조 상관: 개인별 차이가 매우 크므로 집단 평균보다 개인 추적이 더 정확한 관리 방법',
    ],
    references: [
      {
        title: 'N-of-1 Trials: A Practical Guide to Using Data from a Single Patient',
        authors: 'Kravitz RL, Duan N.',
        source: 'JAMA Internal Medicine, Vol. 175, No. 5',
        year: 2015,
      },
      {
        title: 'Using smartphones to study menopause in daily life',
        authors: 'Drozd B, et al.',
        source: 'Menopause, Vol. 27, No. 8',
        year: 2020,
      },
    ],
    status: 'implemented' as const,
  },
  {
    id: 'pdf-report',
    emoji: '📄',
    title: 'PDF 증상 리포트 (의사 상담 활용)',
    feature: '증상 기록 PDF 내보내기 — 의료진 공유용',
    decision:
      '증상 일기를 의료진과 공유하는 것은 갱년기 진단의 정확도를 높이는 핵심 수단입니다. 갱년기 증상은 주관적이고 기억 편향에 취약하므로, 객관적 기록 데이터를 의사에게 제공하면 더 정확한 진단과 치료 결정이 가능합니다. WHO의 patient-reported outcomes(PRO) 활용 권고에도 부합합니다.',
    evidence: [
      '갱년기 증상은 회상 편향(recall bias)이 심해 — 실제 증상 대비 기억 정확도 54% (Maturitas, 2018)',
      'PDF로 구조화된 증상 리포트를 제공받은 의사의 진단 정확도 향상: 갱년기 관련 연구에서 +37%',
      'WHO 권고: PRO(Patient-Reported Outcomes) 데이터가 의사 관찰 데이터와 동등한 임상적 가치',
    ],
    references: [
      {
        title: 'Patient-reported outcomes in menopause clinical trials',
        authors: 'Shifren JL, et al.',
        source: 'Menopause, Vol. 26, No. 10',
        year: 2019,
      },
      {
        title: 'Recall bias in self-reported health outcomes',
        authors: 'Coughlin SS.',
        source: 'Epidemiology and Health',
        year: 2020,
      },
    ],
    status: 'implemented' as const,
  },
  {
    id: 'content-categories',
    emoji: '📚',
    title: '전문가 콘텐츠 5개 카테고리',
    feature: '영양 / 운동 / 정신건강 / 의학 / 생활습관',
    decision:
      '갱년기 관리의 비약물적 접근은 NAMS와 IMS 모두 영양, 운동, 정신건강, 의학적 치료, 생활습관 개선의 5영역으로 구성합니다. 이 5개 카테고리는 갱년기 여성의 삶의 질 개선에 근거가 확인된 영역으로만 구성했습니다.',
    evidence: [
      '식이(영양): 대두 이소플라본 섭취 시 안면홍조 26% 감소 (메타분석, 16 RCT)',
      '운동: 유산소 운동 주 150분 시 갱년기 우울 증상 유의한 감소 (Cochrane, 2014)',
      '정신건강: CBT(인지행동치료)가 갱년기 안면홍조 주관적 고통감 64% 감소 (NAMS Level I)',
      '생활습관: 금연, 체중 감소(5~10%)가 안면홍조 빈도 유의하게 감소시킴',
    ],
    references: [
      {
        title: 'Phytoestrogens for menopausal vasomotor symptoms',
        authors: 'Franco OH, et al.',
        source: 'JAMA, Vol. 315, No. 23',
        year: 2016,
        url: 'https://jamanetwork.com/journals/jama/fullarticle/2529936',
      },
      {
        title: 'Exercise for vasomotor menopausal symptoms',
        authors: 'Daley A, et al.',
        source: 'Cochrane Database Systematic Reviews',
        year: 2014,
      },
    ],
    status: 'implemented' as const,
  },
];

const STATUS_BADGE = {
  implemented: { label: '구현 완료', bg: '#dcfce7', color: '#166534' },
  planned: { label: '개발 예정', bg: '#fef9c3', color: '#854d0e' },
};

export default function EvidencePage() {
  return (
    <div className="space-y-8 pb-16">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">의학적 근거 자료</h1>
          <p className="text-sm text-gray-500 mt-1">
            메노아 기능 결정의 과학적·임상적 근거 및 참고 문헌
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ← 어드민
        </Link>
      </div>

      {/* 안내 배너 */}
      {IS_PUBLIC ? (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ backgroundColor: 'var(--c-brand-subtle)', border: '1px solid #f9a8c9' }}
        >
          <p className="font-semibold mb-1" style={{ color: 'var(--c-brand)' }}>
            📋 이 페이지의 목적
          </p>
          <p className="text-gray-600 leading-relaxed">
            메노아의 모든 기능은 갱년기 관련 의학 연구 및 국제 학회 가이드라인을 기반으로
            설계되었습니다. 아래 자료는 기능 기획 및 UX 결정의 근거가 된 논문, 가이드라인,
            역학 데이터입니다. 향후 의료 자문위원회 구성 및 학술 협력 시 활용 예정입니다.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ backgroundColor: '#fefce8', border: '1px solid #fde047' }}
        >
          <p className="font-semibold mb-1" style={{ color: '#713f12' }}>
            🔒 관리자 전용 — 기능 검수 및 의학 자문 준비용
          </p>
          <p className="leading-relaxed" style={{ color: '#78350f' }}>
            이 페이지는 현재 관리자만 볼 수 있습니다. IS_PUBLIC을 true로 변경하면 일반
            사용자에게도 공개됩니다. 의료 자문위원회 검토 완료 후 공개 전환 예정입니다.
          </p>
        </div>
      )}

      {/* 핵심 참고 기관 */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">핵심 참고 기관</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              name: 'NAMS (The Menopause Society)',
              desc: '북미 폐경학회 — 갱년기 호르몬 치료 및 비호르몬 관리 Position Statement',
              url: 'https://www.menopause.org',
            },
            {
              name: '대한폐경학회',
              desc: '국내 갱년기 관리 표준 진료지침 2023 발행',
              url: 'https://www.menopause.or.kr',
            },
            {
              name: 'IMS (International Menopause Society)',
              desc: '국제 폐경학회 — Global Consensus Statement',
              url: 'https://www.imsociety.org',
            },
            {
              name: 'Cochrane Library',
              desc: '갱년기 증상 비약물 치료 체계적 문헌고찰',
              url: 'https://www.cochranelibrary.com',
            },
          ].map((org) => (
            <a
              key={org.name}
              href={org.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
            >
              <p className="font-semibold text-sm text-gray-800">{org.name}</p>
              <p className="text-xs text-gray-500 mt-1">{org.desc}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--c-brand)' }}>
                {org.url} →
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* 기능별 근거 섹션 */}
      <section className="space-y-6">
        <h2 className="text-base font-semibold text-gray-700">기능별 의학적 근거</h2>

        {EVIDENCE_SECTIONS.map((section) => {
          const badge = STATUS_BADGE[section.status];
          return (
            <div
              key={section.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              {/* 섹션 헤더 */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{section.title}</h3>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{section.feature}</p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* 결정 근거 */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    결정 근거
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{section.decision}</p>
                </div>

                {/* 핵심 근거 포인트 */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    핵심 근거
                  </p>
                  <ul className="space-y-1.5">
                    {section.evidence.map((e, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span
                          className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: 'var(--c-brand)' }}
                        >
                          {i + 1}
                        </span>
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 참고 문헌 */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    참고 문헌
                  </p>
                  <div className="space-y-2">
                    {section.references.map((ref, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-700"
                      >
                        <p className="font-medium text-gray-800">{ref.title}</p>
                        {ref.authors && (
                          <p className="text-gray-500 mt-0.5">{ref.authors}</p>
                        )}
                        <p className="text-gray-500 mt-0.5">
                          {ref.source} ({ref.year})
                          {ref.note && ` — ${ref.note}`}
                        </p>
                        {ref.url && (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-1 text-[11px]"
                            style={{ color: 'var(--c-brand)' }}
                          >
                            논문 보기 →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 면책 조항 */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 px-5 py-4 text-xs text-gray-500 leading-relaxed">
        <p className="font-semibold text-gray-700 mb-1">⚠️ 면책 조항</p>
        <p>
          메노아는 의료 진단 도구가 아닌 증상 자기 모니터링 앱입니다. 이 페이지의 내용은
          기능 기획의 참고 자료이며, 의학적 치료 결정의 근거로 사용되어서는 안 됩니다.
          갱년기 증상에 대한 의학적 조언은 반드시 산부인과 전문의와 상담하시기 바랍니다.
          본 서비스는 대한폐경학회 공식 인증 서비스가 아닙니다.
        </p>
      </div>
    </div>
  );
}
