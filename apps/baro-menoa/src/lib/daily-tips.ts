// ─────────────────────────────────────────────────────────────
// 메노아 일일 팁 라이브러리
//
// 카테고리별로 구분되어 있어서 오늘 기록한 증상에 맞는 팁을 선택 가능.
// 팁 추가/수정: 이 파일에 직접 편집 후 배포.
// ─────────────────────────────────────────────────────────────

export interface Tip {
  id: string;
  category: 'hotflash' | 'sleep' | 'mood' | 'nutrition' | 'exercise' | 'general';
  emoji: string;
  title: string;
  body: string;
}

export const TIPS: Tip[] = [
  // ── 안면홍조 / 혈관운동 증상 ──────────────────────────────────
  {
    id: 'hf01',
    category: 'hotflash',
    emoji: '🌬️',
    title: '안면홍조가 시작되면',
    body: '4초 들이쉬고 → 7초 참고 → 8초 내쉬세요. 이 호흡법이 체온 조절을 도와줘요.',
  },
  {
    id: 'hf02',
    category: 'hotflash',
    emoji: '☕',
    title: '카페인과 안면홍조',
    body: '카페인은 체온에 영향을 줄 수 있다고 알려져 있어요. 안면홍조가 신경 쓰이는 날엔 카페인을 줄여보는 것도 방법이에요.',
  },
  {
    id: 'hf03',
    category: 'hotflash',
    emoji: '🌡️',
    title: '침실 온도가 중요해요',
    body: '침실 온도를 시원하게 유지하면 수면이 편안해질 수 있어요. 얇은 이불 여러 장을 겹쳐서 온도를 조절해보세요.',
  },
  {
    id: 'hf04',
    category: 'hotflash',
    emoji: '🍵',
    title: '두부 한 모의 효과',
    body: '두부, 된장국 등 콩 식품에는 이소플라본이 들어 있어요. 갱년기 여성에게 좋은 식품으로 알려져 있어요.',
  },
  {
    id: 'hf05',
    category: 'hotflash',
    emoji: '🍷',
    title: '음주와 야간발한',
    body: '음주 후 안면홍조나 야간발한을 느끼는 분들이 많아요. 증상이 신경 쓰이는 날엔 음주를 줄여보세요.',
  },
  {
    id: 'hf06',
    category: 'hotflash',
    emoji: '💧',
    title: '물을 충분히 드세요',
    body: '충분한 수분 섭취는 건강한 생활 습관의 기본이에요. 안면홍조가 느껴질 때 시원한 물 한 잔을 마셔보세요.',
  },

  // ── 수면 ──────────────────────────────────────────────────────
  {
    id: 'sl01',
    category: 'sleep',
    emoji: '🌙',
    title: '잠들기 어려울 때',
    body: '취침 1시간 전부터 스마트폰을 내려놓으세요. 밝은 화면이 잠들기를 방해할 수 있어요.',
  },
  {
    id: 'sl02',
    category: 'sleep',
    emoji: '🥜',
    title: '마그네슘은 수면 친구',
    body: '아몬드, 호박씨 등 견과류에는 마그네슘이 풍부해요. 간식으로 한 줌씩 챙겨보세요.',
  },
  {
    id: 'sl03',
    category: 'sleep',
    emoji: '⏰',
    title: '기상 시간을 일정하게',
    body: '주말에도 같은 시간에 일어나면 생활 리듬이 안정돼요. 일정한 기상 시간이 숙면에 도움이 될 수 있어요.',
  },
  {
    id: 'sl04',
    category: 'sleep',
    emoji: '🧘',
    title: '자기 전 스트레칭',
    body: '5분간 목, 어깨, 허리를 천천히 풀어주세요. 근육 긴장이 풀리면 더 빨리 잠들 수 있어요.',
  },
  {
    id: 'sl05',
    category: 'sleep',
    emoji: '☕',
    title: '오후 2시 이후 카페인 주의',
    body: '카페인이 몸에서 완전히 빠지는 데 6~8시간 걸려요. 오후 2시 이후엔 카페인 음료를 피해보세요.',
  },

  // ── 기분 / 정서 ───────────────────────────────────────────────
  {
    id: 'md01',
    category: 'mood',
    emoji: '🌿',
    title: '감정기복이 심할 때',
    body: '5-4-3-2-1 그라운딩을 해보세요. 눈에 보이는 것 5개, 들리는 것 4개... 현재 순간에 집중하면 감정이 안정돼요.',
  },
  {
    id: 'md02',
    category: 'mood',
    emoji: '🚶',
    title: '15분 산책의 마법',
    body: '가볍게 15분만 걸어도 기분 전환에 도움이 될 수 있어요. 햇빛을 받으며 걸으면 더 좋아요.',
  },
  {
    id: 'md03',
    category: 'mood',
    emoji: '🐟',
    title: '오메가-3와 기분',
    body: '고등어, 삼치, 연어 등 생선에는 오메가-3가 풍부해요. 주 2회 정도 식단에 넣어보세요.',
  },
  {
    id: 'md04',
    category: 'mood',
    emoji: '📝',
    title: '감정을 기록해보세요',
    body: '지금 느끼는 감정을 단어로 적어보세요. "짜증남", "불안함" 이렇게 이름 붙이는 것만으로도 감정 강도가 낮아져요.',
  },
  {
    id: 'md05',
    category: 'mood',
    emoji: '🤝',
    title: '혼자 참지 마세요',
    body: '갱년기 증상은 혼자 겪는 게 아니에요. 가까운 사람에게 "요즘 조금 힘들어"라고 말하는 것만으로도 부담이 줄어요.',
  },

  // ── 영양 ──────────────────────────────────────────────────────
  {
    id: 'nt01',
    category: 'nutrition',
    emoji: '🥛',
    title: '칼슘, 지금 충분한가요?',
    body: '우유, 멸치, 치즈 등 칼슘이 풍부한 식품을 챙겨보세요. 뼈 건강을 위한 좋은 습관이에요.',
  },
  {
    id: 'nt02',
    category: 'nutrition',
    emoji: '☀️',
    title: '비타민D는 햇빛에서',
    body: '하루 30분 햇빛(오전 10시~오후 2시)이 비타민D 합성에 충분해요. 피부가 약하다면 보충제 800~1000IU도 좋아요.',
  },
  {
    id: 'nt03',
    category: 'nutrition',
    emoji: '🌾',
    title: '정제 탄수화물 주의',
    body: '잡곡이나 현미는 흰쌀보다 혈당 변동이 적다고 알려져 있어요. 식단을 바꿔보는 것도 좋아요.',
  },
  {
    id: 'nt04',
    category: 'nutrition',
    emoji: '🥬',
    title: '시금치 한 컵의 힘',
    body: '시금치 100g에는 마그네슘, 철분, 비타민K가 풍부해요. 데쳐서 나물로 먹으면 손쉽게 챙길 수 있어요.',
  },
  {
    id: 'nt05',
    category: 'nutrition',
    emoji: '🧄',
    title: '식이섬유로 혈당 잡기',
    body: '채소를 밥보다 먼저 먹으면 포만감도 오래 가고 건강한 식습관에 도움이 돼요.',
  },

  // ── 운동 ──────────────────────────────────────────────────────
  {
    id: 'ex01',
    category: 'exercise',
    emoji: '🏃',
    title: '걷기만 해도 충분해요',
    body: '걷기는 가장 쉽게 시작할 수 있는 운동이에요. 오늘 저녁 10분이라도 나가서 걸어보세요.',
  },
  {
    id: 'ex02',
    category: 'exercise',
    emoji: '🏋️',
    title: '근력 운동이 뼈를 지킨다',
    body: '주 2회 가벼운 근력 운동은 건강 유지에 좋은 습관이에요. 스쿼트나 팔굽혀펴기부터 시작해보세요.',
  },
  {
    id: 'ex03',
    category: 'exercise',
    emoji: '🧘',
    title: '요가로 몸과 마음 동시에',
    body: '요가는 스트레스 해소와 유연성에 좋은 운동이에요. 집에서 10분 요가부터 시작해보세요.',
  },
  {
    id: 'ex04',
    category: 'exercise',
    emoji: '🚴',
    title: '운동 중 안면홍조가 걱정된다면',
    body: '수영이나 실내 자전거처럼 체온이 덜 오르는 운동부터 시작해보세요. 운동 습관이 생기면 증상이 오히려 줄어요.',
  },

  // ── 일반 / 생활습관 ───────────────────────────────────────────
  {
    id: 'gn01',
    category: 'general',
    emoji: '🎯',
    title: '매일 기록이 가장 강력한 도구예요',
    body: '하루 1분 기록이 쌓이면 내 몸의 패턴이 보이기 시작해요. 어떤 날 증상이 심한지, 무엇이 도움이 되는지 알 수 있어요.',
  },
  {
    id: 'gn02',
    category: 'general',
    emoji: '🌸',
    title: '갱년기는 끝이 아니에요',
    body: '갱년기는 평균 4~7년간 지속되지만, 증상이 가장 심한 시기는 짧아요. 지금 관리할수록 이후 삶의 질이 달라져요.',
  },
  {
    id: 'gn03',
    category: 'general',
    emoji: '💤',
    title: '낮잠은 20분까지',
    body: '20분 이하의 짧은 낮잠은 피로 회복에 도움이 돼요. 30분 이상이면 오히려 밤 수면을 방해할 수 있어요.',
  },
  {
    id: 'gn04',
    category: 'general',
    emoji: '🚭',
    title: '흡연은 증상을 악화시켜요',
    body: '금연은 전반적인 건강에 도움이 되는 가장 좋은 선택 중 하나예요. 오늘 한 개비 줄이는 것부터 시작해보세요.',
  },
  {
    id: 'gn05',
    category: 'general',
    emoji: '📊',
    title: '패턴이 보이기 시작해요',
    body: '7일 이상 기록하면 어떤 트리거가 내 증상에 영향을 주는지 힌트가 보이기 시작해요. 계속 기록해주세요!',
  },
  {
    id: 'gn06',
    category: 'general',
    emoji: '🏥',
    title: '산부인과, 부담 갖지 마세요',
    body: '갱년기 증상이 일상을 방해할 정도라면 산부인과 상담을 받아보세요. HRT 외에도 다양한 비호르몬 치료가 있어요.',
  },
];

// 오늘의 팁 선택 — 날짜 기반으로 일관성 있게, 선택적으로 증상 카테고리 반영
export function getDailyTip(dominantSymptom?: 'hotflash' | 'sleep' | 'mood' | null): Tip {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );

  // 증상이 있으면 해당 카테고리 팁을 70% 확률로
  if (dominantSymptom) {
    const categoryTips = TIPS.filter(t => t.category === dominantSymptom);
    const useCategory = dayOfYear % 10 < 7; // 70%
    if (useCategory && categoryTips.length > 0) {
      return categoryTips[dayOfYear % categoryTips.length];
    }
  }

  // 그 외엔 전체에서 선택
  return TIPS[dayOfYear % TIPS.length];
}

// ── 트리거 기반 개인화 팁 ─────────────────────────────────────
// 사용자의 오늘 트리거 데이터를 보고, 가장 관련 있는 건강 상식을 선택
export interface TriggerData {
  caffeine?: number;     // 잔
  alcohol?: number;      // 잔
  sleepMinutes?: number; // 분
  stress?: number;       // 1~5
  exerciseMinutes?: number; // 분
}

const TRIGGER_TIPS: { condition: (t: TriggerData) => boolean; tip: Tip }[] = [
  {
    condition: (t) => (t.caffeine ?? 0) >= 3,
    tip: {
      id: 'tr_caf3',
      category: 'hotflash',
      emoji: '☕',
      title: '카페인 섭취가 많은 날이에요',
      body: '카페인을 많이 마시면 혈관이 확장되어 안면홍조가 나타날 수 있어요. 물이나 허브티로 바꿔보는 건 어떨까요?',
    },
  },
  {
    condition: (t) => (t.caffeine ?? 0) === 2,
    tip: {
      id: 'tr_caf2',
      category: 'hotflash',
      emoji: '☕',
      title: '오늘 커피 2잔 기록했어요',
      body: '오후 2시 이후의 카페인은 수면을 방해할 수 있어요. 오후엔 디카페인이나 따뜻한 보리차도 좋아요.',
    },
  },
  {
    condition: (t) => (t.alcohol ?? 0) >= 2,
    tip: {
      id: 'tr_alc2',
      category: 'hotflash',
      emoji: '🍷',
      title: '음주 기록이 있는 날이에요',
      body: '알코올은 체온 조절을 어렵게 해 야간발한이 나타날 수 있어요. 증상이 있는 시기엔 음주량을 줄여보세요.',
    },
  },
  {
    condition: (t) => (t.sleepMinutes ?? 480) < 360,
    tip: {
      id: 'tr_slp',
      category: 'sleep',
      emoji: '😴',
      title: '수면 시간이 6시간 미만이에요',
      body: '수면이 부족하면 다음 날 증상이 더 뚜렷하게 느껴질 수 있어요. 오늘은 30분 일찍 잠자리에 들어보세요.',
    },
  },
  {
    condition: (t) => (t.stress ?? 0) >= 4,
    tip: {
      id: 'tr_str',
      category: 'mood',
      emoji: '🧘',
      title: '스트레스가 높게 기록됐어요',
      body: '스트레스가 높은 날엔 4-7-8 호흡법을 해보세요. 4초 들이쉬고, 7초 참고, 8초 내쉬면 긴장이 풀려요.',
    },
  },
  {
    condition: (t) => (t.exerciseMinutes ?? 30) === 0,
    tip: {
      id: 'tr_noex',
      category: 'exercise',
      emoji: '🚶',
      title: '오늘은 운동 기록이 없어요',
      body: '가볍게 10분만 걸어도 기분 전환에 도움이 돼요. 집 앞 한 바퀴가 오늘의 운동이 될 수 있어요.',
    },
  },
];

export function getTriggerBasedTip(triggers: TriggerData): Tip | null {
  const matched = TRIGGER_TIPS.find(t => t.condition(triggers));
  return matched?.tip ?? null;
}

// 기록 완료 직후 팁 — 방금 기록한 증상 기반
export function getPostLogTip(symptoms: string[]): Tip {
  const hasHotflash = symptoms.some(s =>
    s.includes('안면홍조') || s.includes('야간발한') || s.includes('발한')
  );
  const hasSleep = symptoms.some(s => s.includes('수면') || s.includes('불면'));
  const hasMood = symptoms.some(s =>
    s.includes('기분') || s.includes('우울') || s.includes('불안') || s.includes('감정')
  );

  const category = hasHotflash ? 'hotflash' : hasSleep ? 'sleep' : hasMood ? 'mood' : null;
  return getDailyTip(category);
}
