'use client';

import { useActionState, useState } from 'react';
import { logSymptom } from '@/actions/symptoms';
import { deleteSymptomLog } from '@/actions/symptoms';
import { useTransition } from 'react';
import { analytics } from '@/lib/analytics';
import type { Tip } from '@/lib/daily-tips';
import { getStreakCelebration } from '@/lib/badges';

type Symptom = { id: string; name: string; category_id: string; sort_order: number };
type Category = { id: string; name: string; sort_order: number };
type ExistingLog = { id: string; symptom_id: string; severity: number; symptom_name: string; note?: string | null };

const SEVERITY_LABELS = ['', '매우 약함', '약함', '보통', '심함', '매우 심함'];
const SEVERITY_COLORS = ['', '#22c55e', '#84cc16', '#f59e0b', '#ef4444', '#dc2626'];

export function SymptomLogForm({
  categories,
  symptoms,
  existingLogs,
  date,
  tip,
  streakCount,
}: {
  categories: Category[];
  symptoms: Symptom[];
  existingLogs: ExistingLog[];
  date: string;
  tip: Tip;
  streakCount: number;
}) {
  const [selectedCat, setSelectedCat] = useState(categories[0]?.id ?? '');
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [severity, setSeverity] = useState(3);
  const [note, setNote] = useState('');
  const [deletePending, startDelete] = useTransition();
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState<{ error: string } | null, FormData>(
    async (_prev, formData) => {
      const result = await logSymptom(formData);
      if (!result?.error) {
        const savedName = symptoms.find(s => s.id === formData.get('symptom_id'))?.name ?? '증상';
        setLastSaved(savedName);
        setSelectedSymptom(null);
        setNote('');
        // GA4: 증상 기록 성공 이벤트 (저장 후 기록된 총 개수 +1 반영)
        analytics.symptomLogged(existingLogs.length + 1);
      }
      return result ?? null;
    },
    null,
  );

  const catSymptoms = symptoms.filter(s => s.category_id === selectedCat);
  const loggedIds = new Set(existingLogs.map(l => l.symptom_id));

  return (
    <div className="space-y-4">

      {/* 저장 완료 축하 패널 */}
      {lastSaved && (
        <div
          className="rounded-2xl p-4 space-y-3 animate-menoa-fade-up"
          style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-green-800">{getStreakCelebration(streakCount)}</p>
              <p className="text-xs text-green-700 mt-0.5">{lastSaved} 기록이 저장됐어요.</p>
            </div>
            <button onClick={() => setLastSaved(null)} aria-label="닫기" className="text-green-400 hover:text-green-600 text-lg leading-none">✕</button>
          </div>
          {/* 팁 */}
          <div className="rounded-xl p-3 space-y-1" style={{ backgroundColor: 'var(--c-brand-subtle)' }}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">오늘의 팁</p>
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">{tip.emoji}</span>
              <div>
                <p className="text-xs font-semibold text-gray-800">{tip.title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{tip.body}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCat(cat.id); setSelectedSymptom(null); }}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: selectedCat === cat.id ? 'var(--c-brand)' : '#f3f4f6',
              color: selectedCat === cat.id ? 'white' : '#6b7280',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 증상 목록 */}
      <div className="grid grid-cols-2 gap-2">
        {catSymptoms.map(s => {
          const isLogged = loggedIds.has(s.id);
          const isSelected = selectedSymptom === s.id;
          const log = existingLogs.find(l => l.symptom_id === s.id);
          return (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSymptom(isSelected ? null : s.id);
                if (log) { setSeverity(log.severity); setNote(log.note ?? ''); }
                else { setSeverity(3); setNote(''); }
              }}
              className="relative p-3 rounded-xl text-left transition-all border-2"
              style={{
                borderColor: isSelected ? 'var(--c-brand)' : isLogged ? '#fca5a5' : '#e5e7eb',
                backgroundColor: isSelected ? '#fdf6f7' : isLogged ? '#fff5f5' : 'white',
              }}
            >
              <span className="text-sm font-medium text-gray-800">{s.name}</span>
              {isLogged && (
                <div className="flex gap-0.5 mt-1">
                  {[1,2,3,4,5].map(n => (
                    <div key={n} className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: n <= (log?.severity ?? 0) ? SEVERITY_COLORS[log?.severity ?? 0] : '#e5e7eb' }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 증상 기록 폼 */}
      {selectedSymptom && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          <p className="font-medium text-gray-800">
            {symptoms.find(s => s.id === selectedSymptom)?.name} 기록
          </p>

          {state && (
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-sm">{state.error}</div>
          )}

          {/* Severity 선택 */}
          <div>
            <p className="text-xs text-gray-500 mb-2">심각도: {SEVERITY_LABELS[severity]}</p>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSeverity(n)}
                  aria-label={`심각도 ${n} - ${SEVERITY_LABELS[n]}`}
                  aria-pressed={severity === n}
                  className="flex-1 h-10 rounded-xl text-sm font-bold transition-all"
                  style={{
                    backgroundColor: severity === n ? SEVERITY_COLORS[n] : '#f3f4f6',
                    color: severity === n ? 'white' : '#9ca3af',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <form action={formAction} className="space-y-3">
            <input type="hidden" name="symptom_id" value={selectedSymptom} />
            <input type="hidden" name="severity" value={severity} />
            <input type="hidden" name="log_date" value={date} />

            {/* 메모 */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">메모 (선택)</label>
              <textarea
                name="note"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="증상에 대한 메모를 남겨보세요..."
                maxLength={500}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 placeholder:text-gray-300"
                style={{ '--tw-ring-color': 'var(--c-brand)' } as React.CSSProperties}
              />
              <p className="text-right text-[10px] text-gray-400 mt-0.5">{note.length}/500</p>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full h-11 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: 'var(--c-brand)' }}
            >
              {pending ? '저장 중...' : '저장'}
            </button>
          </form>

          {/* 기존 기록 삭제 */}
          {loggedIds.has(selectedSymptom) && (
            <button
              onClick={() => {
                const log = existingLogs.find(l => l.symptom_id === selectedSymptom);
                if (log && confirm('이 증상 기록을 삭제하시겠습니까?')) {
                  startDelete(() => { void deleteSymptomLog(log.id); });
                }
              }}
              disabled={deletePending}
              className="w-full h-9 rounded-xl text-sm text-red-500 border border-red-200 disabled:opacity-50"
            >
              {deletePending ? '삭제 중...' : '기록 삭제'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
