'use client';

import type {
  MonthlyCount,
  CategoryDistribution,
  TopSymptom,
  WeeklySeverity,
} from '@/actions/stats';

// ─── 카테고리 색상 매핑 ────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  '신체증상': '#800020',
  '정서/인지': '#c0446a',
  '수면': '#e07090',
  '성건강': '#f4aac0',
};

function getCategoryColor(name: string, index: number): string {
  return (
    CATEGORY_COLORS[name] ??
    ['#800020', '#c0446a', '#e07090', '#f4aac0', '#fad0dc'][index % 5]
  );
}

// ─── 심각도 색상 ──────────────────────────────────────
function getSeverityColor(avg: number): string {
  if (avg === 0) return '#e5e7eb';
  if (avg <= 1.5) return '#22c55e';
  if (avg <= 2.5) return '#84cc16';
  if (avg <= 3.5) return '#f59e0b';
  if (avg <= 4.5) return '#ef4444';
  return '#dc2626';
}

// ─── 1. 월별 바차트 ────────────────────────────────────
export function MonthlyBarChart({ data }: { data: MonthlyCount[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        height: '120px',
        padding: '0 8px',
      }}
    >
      {data.map((item) => {
        const heightPct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        const barHeight = Math.max(heightPct * 0.9, item.count > 0 ? 4 : 0);

        return (
          <div
            key={`${item.year}-${item.month}`}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              height: '100%',
              justifyContent: 'flex-end',
            }}
          >
            {/* 카운트 라벨 */}
            <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
              {item.count > 0 ? item.count : ''}
            </span>
            {/* 바 */}
            <div
              style={{
                width: '100%',
                height: `${barHeight}%`,
                minHeight: item.count > 0 ? '4px' : '0',
                borderRadius: '6px 6px 0 0',
                backgroundColor: '#800020',
                opacity: item.count > 0 ? 1 : 0.15,
                transition: 'height 0.3s ease',
              }}
            />
            {/* 라벨 */}
            <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── 2. 카테고리 도넛차트 ──────────────────────────────
export function CategoryDonutChart({ data }: { data: CategoryDistribution[] }) {
  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px' }}>
        <span style={{ color: '#9ca3af', fontSize: '13px' }}>데이터 없음</span>
      </div>
    );
  }

  // conic-gradient 값 생성
  let cumulative = 0;
  const segments = data.map((item, idx) => {
    const start = cumulative;
    const end = cumulative + item.percentage;
    cumulative = end;
    return { ...item, start, end, color: getCategoryColor(item.category_name, idx) };
  });

  const gradientStops = segments
    .map((s) => `${s.color} ${s.start}% ${s.end}%`)
    .join(', ');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      {/* 도넛 */}
      <div style={{ flexShrink: 0, position: 'relative', width: '110px', height: '110px' }}>
        <div
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: `conic-gradient(${gradientStops})`,
          }}
        />
        {/* 중앙 구멍 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center', lineHeight: 1.3 }}>
            총<br />{data.reduce((s, d) => s + d.count, 0)}회
          </span>
        </div>
      </div>

      {/* 범례 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {segments.map((s) => (
          <div key={s.category_id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '3px',
                backgroundColor: s.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '12px', color: '#374151', flex: 1 }}>{s.category_name}</span>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>{s.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 3. Top 5 증상 리스트 ──────────────────────────────
export function TopSymptomsChart({ data }: { data: TopSymptom[] }) {
  if (data.length === 0) {
    return (
      <div style={{ padding: '16px 0', textAlign: 'center' }}>
        <span style={{ color: '#9ca3af', fontSize: '13px' }}>기록된 증상이 없습니다</span>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {data.map((item, idx) => {
        const widthPct = (item.count / maxCount) * 100;

        return (
          <div key={item.symptom_id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 순위 */}
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: idx === 0 ? '#800020' : '#f3f4f6',
                color: idx === 0 ? '#ffffff' : '#6b7280',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {idx + 1}
            </span>

            {/* 바 + 이름 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: 500 }}>
                  {item.symptom_name}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {item.count}회 · 평균 {item.avg_severity.toFixed(1)}
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: '100%',
                    backgroundColor: '#800020',
                    borderRadius: '3px',
                    opacity: 1 - idx * 0.15,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 4. 주별 평균 심각도 추이 ──────────────────────────
export function WeeklySeverityChart({ data }: { data: WeeklySeverity[] }) {
  const maxSev = 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {data.map((item) => {
        const widthPct = (item.avgSeverity / maxSev) * 100;
        const color = getSeverityColor(item.avgSeverity);
        const hasData = item.avgSeverity > 0;

        return (
          <div key={item.weekLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '11px',
                color: '#6b7280',
                width: '80px',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {item.weekLabel}
            </span>

            <div style={{ flex: 1, height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
              {hasData && (
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: '4px',
                  }}
                />
              )}
            </div>

            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: hasData ? color : '#d1d5db',
                width: '28px',
                textAlign: 'right',
                flexShrink: 0,
              }}
            >
              {hasData ? item.avgSeverity.toFixed(1) : '-'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
