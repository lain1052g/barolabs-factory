'use client';

import { useState, useTransition, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { VisitSummaryData } from '@/actions/visit-summary';
import { generateVisitPDF } from '@/actions/export';
import { analytics } from '@/lib/analytics';

const SEV_COLOR = ['', '#22c55e', '#84cc16', '#f59e0b', '#ef4444', '#dc2626'];

const PERIOD_OPTIONS = [
  { label: '14일', value: 14 },
  { label: '30일', value: 30 },
  { label: '60일', value: 60 },
  { label: '90일', value: 90 },
];

// ────────────────────────────────────────────────────────────
// 슬라이드 목차 정의
// ────────────────────────────────────────────────────────────
type SlideKey = 'summary' | 'symptoms' | 'trends' | 'correlations' | 'triggers' | 'mood' | 'health' | 'questions';

function buildSlides(data: VisitSummaryData): SlideKey[] {
  const slides: SlideKey[] = ['summary'];
  if (data.symptoms.length > 0) slides.push('symptoms');
  if (data.trends.length > 0) slides.push('trends');
  // 상관관계 데이터가 없어도 슬라이드는 항상 포함 (빈 상태 표시)
  if (data.triggers) slides.push('correlations');
  if (data.triggers) slides.push('triggers');
  if (data.mood) slides.push('mood');
  const hasHealth = data.conditions.length > 0 || data.medicalHistory.length > 0 ||
    data.medications.length > 0 || data.supplements.length > 0 || data.isSmoker;
  if (hasHealth) slides.push('health');
  if (data.doctorQuestions.length > 0) slides.push('questions');
  return slides;
}

const SLIDE_TITLES: Record<SlideKey, string> = {
  summary: '요약',
  symptoms: '주요 증상',
  trends: '증상 추이',
  correlations: '생활 요인',
  triggers: '생활 습관',
  mood: '기분',
  health: '건강 프로필',
  questions: '전문의 질문',
};

// ────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ────────────────────────────────────────────────────────────
export function VisitClient({ data, activeDays }: { data: VisitSummaryData; activeDays: number }) {
  const router = useRouter();
  const [fullscreen, setFullscreen] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [pdfLoading, startPdfTransition] = useTransition();
  const [periodLoading, startPeriodTransition] = useTransition();
  const [pdfError, setPdfError] = useState<string | null>(null);

  // 터치 스와이프
  const touchStartX = useRef<number>(0);

  const slides = buildSlides(data);

  function handlePeriodChange(d: number) {
    if (d === activeDays) return;
    startPeriodTransition(() => {
      router.push(`/visit?days=${d}`);
    });
  }

  function handlePrint() {
    window.print();
  }

  function handlePDF() {
    setPdfError(null);
    startPdfTransition(async () => {
      const result = await generateVisitPDF(data);
      if ('error' in result) {
        setPdfError(result.error);
        return;
      }
      const binary = atob(result.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      analytics.visitPdfDownloaded(activeDays);
    });
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setSlideIdx(i => Math.min(slides.length - 1, i + 1));
      else setSlideIdx(i => Math.max(0, i - 1));
    }
  }, [slides.length]);

  return (
    <>
      {/* 기간 선택 탭 */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {PERIOD_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handlePeriodChange(opt.value)}
            disabled={periodLoading}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={
              activeDays === opt.value
                ? { backgroundColor: 'var(--c-brand)', color: '#fff' }
                : { color: '#6b7280' }
            }
          >
            {periodLoading && activeDays !== opt.value ? opt.label : opt.label}
          </button>
        ))}
      </div>

      {/* 기간 변경 로딩 스켈레톤 */}
      {periodLoading && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-4/5" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
        </div>
      )}

      {!periodLoading && (
        <>
          {/* 데이터 품질 경고 */}
          <DataQualityBanner quality={data.dataQuality} totalDays={data.totalRecordDays} days={data.days} />

          {/* 액션 버튼 바 */}
          <div className="flex gap-2">
            <button
              onClick={() => { setFullscreen(true); setSlideIdx(0); }}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--c-brand)' }}
            >
              📱 전체화면 발표
            </button>
            <button
              onClick={handlePDF}
              disabled={pdfLoading}
              className="px-4 py-3 rounded-xl text-sm font-semibold border"
              style={{ color: 'var(--c-brand)', borderColor: 'var(--c-brand-border)' }}
              title="PDF 저장"
            >
              {pdfLoading ? '⏳' : '📄'}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-3 rounded-xl text-sm font-semibold border"
              style={{ color: 'var(--c-brand)', borderColor: 'var(--c-brand-border)' }}
              title="인쇄"
            >
              🖨️
            </button>
          </div>
          {pdfError && <p className="text-xs text-red-500 mt-1">{pdfError}</p>}

          {/* 일반 스크롤 뷰 */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-5 space-y-5">
            <VisitContent data={data} />
          </div>
        </>
      )}

      {/* 전체화면 슬라이드 프레젠테이션 */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950 flex flex-col">
          {/* 슬라이드 헤더 */}
          <div
            className="flex items-center justify-between px-5 py-3 border-b shrink-0"
            style={{ borderColor: 'var(--c-brand-border)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-bold shrink-0" style={{ color: 'var(--c-brand)' }}>
                🩺 진료 요약
              </span>
              <span className="text-xs text-gray-400 truncate">
                {data.userName} · {data.periodFrom} ~ {data.periodTo}
              </span>
            </div>
            <button
              onClick={() => setFullscreen(false)}
              className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg shrink-0 ml-2"
            >
              닫기 ✕
            </button>
          </div>

          {/* 슬라이드 탭 */}
          <div className="flex overflow-x-auto gap-1 px-4 py-2 border-b border-gray-100 dark:border-gray-800 shrink-0 no-scrollbar">
            {slides.map((key, i) => (
              <button
                key={key}
                onClick={() => setSlideIdx(i)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  i === slideIdx
                    ? { backgroundColor: 'var(--c-brand)', color: '#fff' }
                    : { backgroundColor: 'var(--c-brand-subtle)', color: 'var(--c-brand)' }
                }
              >
                {SLIDE_TITLES[key]}
              </button>
            ))}
          </div>

          {/* 슬라이드 본문 — 터치 스와이프 지원 */}
          <div
            className="flex-1 overflow-y-auto"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="max-w-xl mx-auto px-5 py-6">
              <SlideContent data={data} slideKey={slides[slideIdx]} />
            </div>
          </div>

          {/* 슬라이드 하단 내비게이션 */}
          <div
            className="flex items-center justify-between px-5 py-3 border-t shrink-0"
            style={{ borderColor: 'var(--c-brand-border)' }}
          >
            <button
              onClick={() => setSlideIdx(i => Math.max(0, i - 1))}
              disabled={slideIdx === 0}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 disabled:opacity-30"
            >
              ← 이전
            </button>
            <div className="flex gap-1">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ backgroundColor: i === slideIdx ? 'var(--c-brand)' : '#d1d5db' }}
                />
              ))}
            </div>
            <button
              onClick={() => setSlideIdx(i => Math.min(slides.length - 1, i + 1))}
              disabled={slideIdx === slides.length - 1}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-30"
              style={{ backgroundColor: 'var(--c-brand)' }}
            >
              다음 →
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// 데이터 품질 배너
// ────────────────────────────────────────────────────────────
function DataQualityBanner({ quality, totalDays, days }: { quality: 'good' | 'fair' | 'poor'; totalDays: number; days: number }) {
  if (quality === 'good') return null;

  const config = {
    fair: {
      icon: '⚠️',
      text: `${days}일 중 ${totalDays}일 기록됨. 7일 이상이지만 더 기록할수록 정확도가 높아져요.`,
      cls: 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 text-amber-700 dark:text-amber-400',
    },
    poor: {
      icon: '❗',
      text: `${days}일 중 ${totalDays}일만 기록됨. 데이터가 부족해 통계 신뢰도가 낮을 수 있어요.`,
      cls: 'bg-red-50 dark:bg-red-950/30 border-red-300 text-red-700 dark:text-red-400',
    },
  } as const;

  const c = config[quality];
  return (
    <div className={`rounded-xl px-4 py-3 border ${c.cls}`}>
      <p className="text-xs font-medium">{c.icon} {c.text}</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 전체 스크롤 뷰 콘텐츠
// ────────────────────────────────────────────────────────────
function VisitContent({ data }: { data: VisitSummaryData }) {
  return (
    <>
      {/* 헤더 */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--c-brand-subtle)', borderBottom: '3px solid var(--c-brand)' }}
      >
        <h2 className="text-lg font-bold" style={{ color: 'var(--c-brand)' }}>메노아 진료 요약</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>이름: {data.userName}</span>
          {data.birthYear && <span>출생: {data.birthYear}년</span>}
          {data.menopauseStage && <span>단계: {data.menopauseStage}</span>}
          <span>기간: {data.periodFrom} ~ {data.periodTo}</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">{data.generatedAt} 기준 · {data.totalRecordDays}일 기록</p>
      </div>

      {/* 자동 요약 */}
      {data.summaryText && (
        <div
          className="rounded-xl p-4 text-sm leading-relaxed"
          style={{ backgroundColor: 'var(--c-brand-subtle)', borderLeft: '3px solid var(--c-brand)' }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--c-brand)' }}>자동 요약</p>
          <p className="text-gray-700 dark:text-gray-300">{data.summaryText}</p>
        </div>
      )}

      <SymptomsSection data={data} />
      <TrendsSection data={data} />
      <CorrelationsSection data={data} />
      {data.triggers && <TriggersSection data={data} />}
      <MoodAndDaySection data={data} />
      <HealthSection data={data} />
      <DoctorQuestionsSection data={data} />

      {/* 안내 */}
      <div
        className="rounded-xl p-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed"
        style={{ backgroundColor: 'var(--c-brand-subtle)' }}
      >
        <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">전문의에게 전할 말</p>
        <p>위 증상은 최근 {data.days}일간 앱에 직접 기록한 데이터입니다. 의학적 진단이 아니며, 진료 시 참고 자료로 활용해 주세요.</p>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// 슬라이드 단일 화면 콘텐츠
// ────────────────────────────────────────────────────────────
function SlideContent({ data, slideKey }: { data: VisitSummaryData; slideKey: SlideKey }) {
  switch (slideKey) {
    case 'summary':
      return (
        <div className="space-y-4">
          <SlideHeader title="요약" subtitle={`${data.periodFrom} ~ ${data.periodTo} (${data.days}일)`} />
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: 'var(--c-brand-subtle)', borderLeft: '4px solid var(--c-brand)' }}
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{data.summaryText}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="기록 일수" value={`${data.totalRecordDays}일`} sub={`/ ${data.days}일`} />
            <StatCard label="증상 종류" value={`${data.symptoms.length}가지`} />
            {data.mood && <StatCard label="평균 기분" value={`${data.mood.avgScore}/5`} />}
            {data.symptoms.length > 0 && (
              <StatCard label="주요 증상" value={data.symptoms[0].name} sub={`${data.symptoms[0].count}회`} />
            )}
          </div>
        </div>
      );
    case 'symptoms':
      return (
        <div className="space-y-4">
          <SlideHeader title="주요 증상" subtitle={`${data.symptoms.length}가지 · 최근 ${data.days}일`} />
          <SymptomsSection data={data} />
        </div>
      );
    case 'trends':
      return (
        <div className="space-y-4">
          <SlideHeader title="증상 추이" subtitle="기간 전반부 vs 후반부 비교" />
          <TrendsSection data={data} />
        </div>
      );
    case 'correlations':
      return (
        <div className="space-y-4">
          <SlideHeader title="생활 요인 상관관계" subtitle="트리거와 증상의 연관성" />
          <CorrelationsSection data={data} />
        </div>
      );
    case 'triggers':
      return (
        <div className="space-y-4">
          <SlideHeader title="생활 습관 평균" subtitle={`${data.triggers?.daysRecorded}일 기록 기준`} />
          {data.triggers && <TriggersSection data={data} />}
        </div>
      );
    case 'mood':
      return (
        <div className="space-y-4">
          <SlideHeader title="기분 추이" />
          <MoodAndDaySection data={data} />
        </div>
      );
    case 'health':
      return (
        <div className="space-y-4">
          <SlideHeader title="건강 프로필" />
          <HealthSection data={data} />
        </div>
      );
    case 'questions':
      return (
        <div className="space-y-4">
          <SlideHeader title="전문의에게 물어볼 것들" subtitle="데이터 기반으로 자동 생성된 질문" />
          <DoctorQuestionsSection data={data} />
        </div>
      );
  }
}

// ────────────────────────────────────────────────────────────
// 섹션 컴포넌트들
// ────────────────────────────────────────────────────────────

function SymptomsSection({ data }: { data: VisitSummaryData }) {
  if (data.symptoms.length === 0) return null;
  return (
    <Section title="주요 증상" subtitle={`${data.symptoms.length}가지 · 최근 ${data.days}일`}>
      <div className="space-y-2">
        {data.symptoms.slice(0, 10).map(s => (
          <div key={s.name} className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{s.name}</p>
              <p className="text-[11px] text-gray-400">{s.count}회 기록 · 최대 {s.maxSeverity}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <div
                    key={n}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: n <= Math.round(s.avgSeverity)
                        ? SEV_COLOR[Math.round(s.avgSeverity)]
                        : '#e5e7eb',
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 w-16 text-right">평균 {s.avgSeverity}</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TrendsSection({ data }: { data: VisitSummaryData }) {
  if (data.trends.length === 0) return null;
  return (
    <Section title="증상 추이" subtitle="기간 전반부 → 후반부">
      <div className="space-y-2">
        {data.trends.slice(0, 5).map(t => (
          <div key={t.name} className="flex items-center gap-3">
            <span
              className="text-base w-5 shrink-0 text-center"
              style={{ color: t.direction === 'worsening' ? '#ef4444' : t.direction === 'improving' ? '#22c55e' : '#9ca3af' }}
            >
              {t.direction === 'worsening' ? '↑' : t.direction === 'improving' ? '↓' : '→'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{t.name}</p>
              <p className="text-[11px] text-gray-400">
                {t.firstHalfAvg} → {t.secondHalfAvg} ·{' '}
                <span style={{ color: t.direction === 'worsening' ? '#ef4444' : t.direction === 'improving' ? '#22c55e' : '#9ca3af' }}>
                  {t.direction === 'worsening' ? '↑ 증가 추세' : t.direction === 'improving' ? '↓ 감소 추세' : '→ 유지'}
                </span>
              </p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {t.change > 0 ? '+' : ''}{t.change}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CorrelationsSection({ data }: { data: VisitSummaryData }) {
  return (
    <Section title="생활 요인 기록 비교" subtitle="기록 데이터 요약 · 의학적 인과관계가 아닙니다">
      {data.correlations.length === 0 ? (
        <div className="rounded-xl px-4 py-5 text-center" style={{ backgroundColor: 'var(--c-brand-subtle)' }}>
          <p className="text-sm text-gray-500 dark:text-gray-400">아직 분석할 데이터가 부족해요.</p>
          <p className="text-xs text-gray-400 mt-1">트리거와 증상을 함께 기록하면 상관관계가 나타나요.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.correlations.slice(0, 4).map((c, i) => (
            <div
              key={i}
              className="rounded-xl p-3 flex items-start gap-3"
              style={{
                backgroundColor: c.difference > 0 ? 'var(--c-warn-bg)' : '#f0fdf4',
                borderLeft: `3px solid ${c.difference > 0 ? 'var(--c-warn-text)' : '#22c55e'}`,
              }}
            >
              <span className="text-xl shrink-0">{c.triggerEmoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-900">
                  {c.triggerLabel} 기록일의 &lsquo;{c.symptomName}&rsquo;
                  <span className="ml-1.5 font-bold" style={{ color: c.difference > 0 ? 'var(--c-warn-text)' : '#22c55e' }}>
                    {c.difference > 0 ? `+${c.difference}점 높음` : `${c.difference}점 낮음`}
                  </span>
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  기록일 평균 {c.onDaysAvg}점 ({c.onDaysCount}일) vs 미기록일 평균 {c.offDaysAvg}점 ({c.offDaysCount}일)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function TriggersSection({ data }: { data: VisitSummaryData }) {
  if (!data.triggers) return null;
  const t = data.triggers;
  const sleepWarn = t.avgSleepMinutes > 0 && t.avgSleepMinutes < 360;
  const stressWarn = t.avgStress >= 4;
  return (
    <Section title="생활 습관 평균" subtitle={`${t.daysRecorded}일 기록 기준`}>
      <div className="grid grid-cols-2 gap-2">
        <TriggerCard label="☕ 카페인" value={`${t.avgCaffeine}잔/일`} />
        <TriggerCard label="🍷 음주" value={`${t.avgAlcohol}잔/일`} />
        <TriggerCard
          label="😴 수면"
          value={`${Math.floor(t.avgSleepMinutes / 60)}시간 ${t.avgSleepMinutes % 60 > 0 ? `${t.avgSleepMinutes % 60}분` : ''}`}
          warn={sleepWarn}
          warnText="부족"
        />
        <TriggerCard
          label="😤 스트레스"
          value={t.avgStress > 0 ? `${t.avgStress}/5` : '미기록'}
          warn={stressWarn}
          warnText="높음"
        />
        <TriggerCard label="🏃 운동" value={`${t.avgExerciseMinutes}분/일`} />
      </div>
    </Section>
  );
}

function MoodAndDaySection({ data }: { data: VisitSummaryData }) {
  if (!data.mood && !data.worstDay && !data.bestDay) return null;
  return (
    <div className="space-y-3">
      {data.mood && (
        <Section title="기분 추이">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--c-brand)' }}>{data.mood.avgScore}</p>
              <p className="text-[10px] text-gray-400">/ 5점</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-200">최근 {data.days}일 평균 기분</p>
              {data.mood.prevAvgScore !== null && (
                <p className="text-xs text-gray-400 mt-0.5">
                  이전 대비{' '}
                  <span style={{ color: data.mood.avgScore >= data.mood.prevAvgScore ? '#22c55e' : '#ef4444' }}>
                    {data.mood.avgScore >= data.mood.prevAvgScore ? '↑' : '↓'}
                    {Math.abs(Math.round((data.mood.avgScore - data.mood.prevAvgScore) * 10) / 10)}
                  </span>
                </p>
              )}
              <p className="text-[10px] text-gray-400">{data.mood.daysRecorded}일 기록</p>
            </div>
          </div>
        </Section>
      )}

      {(data.worstDay || data.bestDay) && (
        <Section title="특이일">
          <div className="grid grid-cols-2 gap-2">
            {data.worstDay && (
              <div
                className="rounded-xl p-3 border-l-4"
                style={{ backgroundColor: 'var(--c-warn-bg)', borderColor: 'var(--c-warn-text)' }}
              >
                <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--c-warn-text)' }}>최악의 날</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{data.worstDay.label}</p>
                <p className="text-xs text-gray-500">평균 심각도 {data.worstDay.avgSeverity}</p>
              </div>
            )}
            {data.bestDay && (
              <div className="rounded-xl p-3 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-400">
                <p className="text-[10px] text-green-600 font-medium mb-1">가장 좋은 날</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{data.bestDay.label}</p>
                <p className="text-xs text-gray-500">평균 심각도 {data.bestDay.avgSeverity}</p>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}

function HealthSection({ data }: { data: VisitSummaryData }) {
  const hasHealth = data.conditions.length > 0 || data.medicalHistory.length > 0 ||
    data.medications.length > 0 || data.supplements.length > 0 || data.isSmoker;
  if (!hasHealth) return null;
  return (
    <Section title="건강 프로필">
      <div className="space-y-2 text-sm">
        {data.conditions.length > 0 && <ProfileRow label="현재 질환" items={data.conditions} />}
        {data.medicalHistory.length > 0 && <ProfileRow label="병력" items={data.medicalHistory} />}
        {data.medications.length > 0 && <ProfileRow label="복용 약물" items={data.medications} />}
        {data.supplements.length > 0 && <ProfileRow label="영양제" items={data.supplements} />}
        {data.isSmoker && (
          <div className="flex gap-2">
            <span className="text-xs font-medium text-gray-500 shrink-0 w-16">흡연</span>
            <span className="text-xs text-red-600">예</span>
          </div>
        )}
      </div>
    </Section>
  );
}

function DoctorQuestionsSection({ data }: { data: VisitSummaryData }) {
  if (data.doctorQuestions.length === 0) return null;
  return (
    <Section title="전문의에게 물어볼 사항" subtitle="데이터 기반 자동 생성">
      <div className="space-y-2.5">
        {data.doctorQuestions.map((q, i) => (
          <div
            key={i}
            className="rounded-xl p-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
            style={{ backgroundColor: 'var(--c-brand-subtle)', borderLeft: '3px solid var(--c-brand)' }}
          >
            <span className="text-xs font-bold mr-1.5" style={{ color: 'var(--c-brand)' }}>Q{i + 1}.</span>
            {q}
          </div>
        ))}
      </div>
    </Section>
  );
}

// ────────────────────────────────────────────────────────────
// 유틸 컴포넌트
// ────────────────────────────────────────────────────────────

function SlideHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b-2 pb-3" style={{ borderColor: 'var(--c-brand)' }}>
      <h2 className="text-xl font-bold" style={{ color: 'var(--c-brand)' }}>{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: 'var(--c-brand-subtle)', border: '1px solid var(--c-brand-border)' }}
    >
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-lg font-bold" style={{ color: 'var(--c-brand)' }}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        {subtitle && <span className="text-[10px] text-gray-400">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function TriggerCard({ label, value, warn, warnText }: { label: string; value: string; warn?: boolean; warnText?: string }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        backgroundColor: warn ? 'var(--c-warn-bg)' : '#f9fafb',
        border: `1px solid ${warn ? 'var(--c-warn-border)' : '#f3f4f6'}`,
      }}
    >
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5">{value}</p>
      {warn && warnText && (
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--c-warn-text)' }}>{warnText}</p>
      )}
    </div>
  );
}

function ProfileRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs font-medium text-gray-500 shrink-0 w-16">{label}</span>
      <span className="text-xs text-gray-700 dark:text-gray-300">{items.join(', ')}</span>
    </div>
  );
}
