'use client';

import { useState } from 'react';
import {
  INPUTS, DIAGNOSES, SOLUTIONS, FLOW,
  DIAGNOSIS_LEVELS,
  type DiagnosisLevel,
} from '@/lib/decision-logic';

const TABS = ['📥 수집 정보', '🔍 상황 분류', '💡 솔루션', '🔄 흐름 매핑'] as const;

const LEVEL_STYLE: Record<DiagnosisLevel, { bg: string; text: string; border: string }> = {
  1: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' },
  2: { bg: '#fff7ed', text: '#ea580c', border: '#fdba74' },
  3: { bg: '#fefce8', text: '#ca8a04', border: '#fde047' },
  4: { bg: '#f0fdf4', text: '#16a34a', border: '#86efac' },
};

const CATEGORY_LABEL: Record<string, string> = {
  immediate: '⚡ 즉각 대처',
  lifestyle: '🏃 생활습관',
  nutrition: '🥗 영양',
  medical: '🏥 의료적',
  monitoring: '📊 모니터링',
};

const STATUS_BADGE = {
  implemented: { label: '구현 완료', bg: '#dcfce7', color: '#166534' },
  documented: { label: '문서화만', bg: '#fef9c3', color: '#854d0e' },
};

// 입력 그룹별 색상
const GROUP_COLOR: Record<string, string> = {
  '기본 프로필': '#e0e7ff',
  '일일 증상': '#fce7f3',
  '일일 트리거': '#fef3c7',
  '일일 기분': '#d1fae5',
  'SOS 기록': '#fee2e2',
  '건강프로필 · 지병': '#ede9fe',
  '건강프로필 · 병력': '#fce7f3',
  '건강프로필 · 약물': '#cffafe',
  '건강프로필 · 영양제': '#dcfce7',
  '건강프로필 · 생활': '#fef9c3',
};

export function LogicClient() {
  const [tab, setTab] = useState(0);

  // 그룹별 입력 정리
  const inputGroups = INPUTS.reduce<Record<string, typeof INPUTS>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  // 솔루션 카테고리별 정리
  const solutionGroups = SOLUTIONS.reduce<Record<string, typeof SOLUTIONS>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  // 흐름 매핑에서 입력 id → label 찾기
  const inputLabel = (id: string) => INPUTS.find(i => i.id === id)?.label ?? id;
  const diagnosisById = (id: string) => DIAGNOSES.find(d => d.id === id);
  const solutionById = (id: string) => SOLUTIONS.find(s => s.id === id);

  return (
    <div className="space-y-4">
      {/* 탭 */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
            style={{
              backgroundColor: tab === i ? 'white' : 'transparent',
              color: tab === i ? 'var(--c-brand)' : '#6b7280',
              boxShadow: tab === i ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── 탭 0: 수집 정보 ── */}
      {tab === 0 && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            총 <strong>{INPUTS.length}개</strong> 입력 항목 —
            구현 완료 {INPUTS.filter(i => i.status === 'implemented').length}개 /
            문서화만 {INPUTS.filter(i => i.status === 'documented').length}개
          </p>
          {Object.entries(inputGroups).map(([group, items]) => (
            <div key={group} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm">
              <div
                className="px-4 py-2.5 text-xs font-bold"
                style={{ backgroundColor: GROUP_COLOR[group] ?? '#f3f4f6', color: '#374151' }}
              >
                {group} ({items.length}개)
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-gray-800 dark:text-gray-100 text-xs">{item.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{item.id}</p>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">{item.type}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={STATUS_BADGE[item.status]}
                        >
                          {STATUS_BADGE[item.status].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* ── 탭 1: 상황 분류 ── */}
      {tab === 1 && (
        <div className="space-y-4">
          {/* 레벨 범례 */}
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(DIAGNOSIS_LEVELS) as [string, typeof DIAGNOSIS_LEVELS[1]][]).map(([lvl, meta]) => (
              <div key={lvl} className="rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: LEVEL_STYLE[Number(lvl) as DiagnosisLevel].bg }}>
                <span className="font-bold" style={{ color: LEVEL_STYLE[Number(lvl) as DiagnosisLevel].text }}>Level {lvl}: {meta.label}</span>
                <p className="text-gray-500 mt-0.5">{meta.desc}</p>
              </div>
            ))}
          </div>

          {([1, 2, 3, 4] as DiagnosisLevel[]).map(level => {
            const items = DIAGNOSES.filter(d => d.level === level);
            const style = LEVEL_STYLE[level];
            return (
              <div key={level} className="space-y-2">
                <h3 className="text-xs font-bold" style={{ color: style.text }}>
                  Level {level} — {DIAGNOSIS_LEVELS[level].label} ({items.length}개)
                </h3>
                {items.map(d => (
                  <div key={d.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border-l-4" style={{ borderColor: style.border }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400">{d.id}</span>
                        <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{d.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{d.description}</p>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={STATUS_BADGE[d.status]}
                      >
                        {STATUS_BADGE[d.status].label}
                      </span>
                    </div>
                    <div className="space-y-1 mt-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase">판단 기준</p>
                      {d.rules.map((rule, i) => (
                        <p key={i} className="text-xs text-gray-600 dark:text-gray-300 pl-2 border-l-2 border-gray-200">
                          {rule}
                        </p>
                      ))}
                    </div>
                    {d.note && (
                      <p className="mt-2 text-[10px] text-orange-600 bg-orange-50 rounded-lg px-2 py-1">
                        ⚠️ {d.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 탭 2: 솔루션 ── */}
      {tab === 2 && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            총 <strong>{SOLUTIONS.length}개</strong> 솔루션
          </p>
          {Object.entries(solutionGroups).map(([cat, items]) => (
            <div key={cat} className="space-y-2">
              <h3 className="text-xs font-bold text-gray-600">{CATEGORY_LABEL[cat] ?? cat}</h3>
              {items.map(s => (
                <div key={s.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-gray-400">{s.id}</span>
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={STATUS_BADGE[s.status]}
                        >
                          {STATUS_BADGE[s.status].label}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{s.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{s.detail}</p>
                      {s.evidence && (
                        <p className="text-[10px] text-blue-500 mt-1">📚 {s.evidence}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── 탭 3: 흐름 매핑 ── */}
      {tab === 3 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            우선순위 낮을수록 먼저 평가됩니다. 총 <strong>{FLOW.length}개</strong> 규칙.
          </p>
          {FLOW.sort((a, b) => a.priority - b.priority).map(rule => {
            const diag = diagnosisById(rule.diagnosis_id);
            if (!diag) return null;
            const style = LEVEL_STYLE[diag.level];
            return (
              <div key={rule.diagnosis_id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
                {/* 우선순위 */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono text-gray-400">P{rule.priority}</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: style.bg, color: style.text }}
                  >
                    Level {diag.level} — {DIAGNOSIS_LEVELS[diag.level].label}
                  </span>
                </div>

                {/* 3열 흐름 */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {/* 입력 */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 mb-1">📥 입력</p>
                    <div className="space-y-0.5">
                      {rule.inputs.map(id => (
                        <p key={id} className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded px-1.5 py-0.5 text-[10px] leading-snug">
                          {inputLabel(id)}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* 상황 */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 mb-1">🔍 상황</p>
                    <div
                      className="rounded-lg px-2 py-1.5"
                      style={{ backgroundColor: style.bg }}
                    >
                      <p className="text-[10px] font-mono" style={{ color: style.text }}>{diag.id}</p>
                      <p className="font-semibold text-gray-800 text-[11px] leading-snug mt-0.5">{diag.title}</p>
                    </div>
                  </div>

                  {/* 솔루션 */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 mb-1">💡 솔루션</p>
                    <div className="space-y-0.5">
                      {rule.solution_ids.map(sid => {
                        const sol = solutionById(sid);
                        return (
                          <p key={sid} className="text-[10px] text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded px-1.5 py-0.5 leading-snug">
                            <span className="font-mono text-gray-400">{sid}</span> {sol?.title}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
