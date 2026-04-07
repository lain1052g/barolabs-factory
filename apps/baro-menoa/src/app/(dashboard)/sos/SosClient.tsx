'use client';

import { useState, useEffect } from 'react';
import { recordSosUsage } from '@/actions/sos';
import { analytics } from '@/lib/analytics';

const SOS_CONTENT = [
  {
    id: 'breathing',
    title: '4-7-8 호흡법',
    emoji: '🌬️',
    steps: [
      '코로 4초 동안 숨을 들이쉬세요',
      '7초 동안 숨을 참으세요',
      '입으로 8초 동안 천천히 내쉬세요',
      '3~4회 반복하세요',
    ],
    tip: '안면홍조와 불안 완화에 효과적입니다',
  },
  {
    id: 'cooling',
    title: '빠른 냉각법',
    emoji: '❄️',
    steps: [
      '찬물에 손목을 30초 담그세요',
      '목 뒤와 이마에 찬 수건을 대세요',
      '가능하다면 선풍기나 에어컨을 켜세요',
      '얇은 옷으로 갈아입으세요',
    ],
    tip: '야간발한·안면홍조 시 즉각 사용하세요',
  },
  {
    id: 'grounding',
    title: '5-4-3-2-1 그라운딩',
    emoji: '🌿',
    steps: [
      '눈에 보이는 것 5가지를 말하세요',
      '만질 수 있는 것 4가지를 느끼세요',
      '들리는 소리 3가지에 집중하세요',
      '냄새 2가지, 맛 1가지를 인식하세요',
    ],
    tip: '불안·감정기복이 심할 때 현재로 돌아오는 방법입니다',
  },
  {
    id: 'stretch',
    title: '즉각 통증 완화 스트레칭',
    emoji: '🤸',
    steps: [
      '어깨를 크게 돌려 근육을 풀어주세요',
      '목을 좌우로 천천히 기울이세요 (각 15초)',
      '손목과 발목을 돌려 관절을 풀어주세요',
      '의자에서 일어나 제자리 걷기를 1분 해보세요',
    ],
    tip: '관절통·근육통 완화에 효과적입니다',
  },
];

export function SosClient() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = SOS_CONTENT[activeIdx];

  useEffect(() => {
    recordSosUsage('general', active.id);
    analytics.sosUsed(active.id);
  }, [activeIdx, active.id]);

  return (
    <div className="px-4 py-6 space-y-5">
      {/* 헤더 */}
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl mb-3"
          style={{ backgroundColor: 'var(--c-brand-subtle)', border: '2px solid var(--c-brand)' }}
        >
          🆘
        </div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--c-brand)' }}>괜찮아요, 도와드릴게요</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">지금 바로 사용할 수 있는 대처법이에요</p>
      </div>

      {/* 카테고리 선택 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SOS_CONTENT.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setActiveIdx(i)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeIdx === i ? 'var(--c-brand)' : '#f3f4f6',
              color: activeIdx === i ? 'white' : '#6b7280',
            }}
          >
            <span>{c.emoji}</span>
            {c.title.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* 콘텐츠 카드 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm dark:shadow-none space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{active.emoji}</span>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{active.title}</h2>
        </div>

        <div className="space-y-3">
          {active.steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: 'var(--c-brand)' }}
              >
                {i + 1}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 pt-1">{step}</p>
            </div>
          ))}
        </div>

        <div
          className="brand-bg mt-4 p-3 rounded-xl text-sm text-gray-600 dark:text-gray-300"
          style={{ backgroundColor: 'var(--c-brand-subtle)' }}
        >
          💡 {active.tip}
        </div>
      </div>

      {/* 다음 방법 */}
      <button
        onClick={() => setActiveIdx((activeIdx + 1) % SOS_CONTENT.length)}
        className="w-full py-3 rounded-xl border text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-200 dark:border-gray-700"
        style={{ borderColor: '#e5e7eb' }}
      >
        다른 방법 보기 →
      </button>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        * 이 정보는 의료적 조언을 대체하지 않습니다.<br />심각한 증상은 반드시 의사와 상담하세요.
      </p>
    </div>
  );
}
