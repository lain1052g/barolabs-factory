'use client';

import { useActionState, useState } from 'react';
import { logSymptom } from '@/actions/symptoms';
import { deleteSymptomLog } from '@/actions/symptoms';
import { useTransition } from 'react';

type Symptom = { id: string; name: string; category_id: string; sort_order: number };
type Category = { id: string; name: string; sort_order: number };
type ExistingLog = { id: string; symptom_id: string; severity: number; symptom_name: string };

const SEVERITY_LABELS = ['', '매우 약함', '약함', '보통', '심함', '매우 심함'];
const SEVERITY_COLORS = ['', '#22c55e', '#84cc16', '#f59e0b', '#ef4444', '#dc2626'];

export function SymptomLogForm({
  categories,
  symptoms,
  existingLogs,
  date,
}: {
  categories: Category[];
  symptoms: Symptom[];
  existingLogs: ExistingLog[];
  date: string;
}) {
  const [selectedCat, setSelectedCat] = useState(categories[0]?.id ?? '');
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [severity, setSeverity] = useState(3);
  const [deletePending, startDelete] = useTransition();

  const [state, formAction, pending] = useActionState<{ error: string } | null, FormData>(
    async (_prev, formData) => {
      const result = await logSymptom(formData);
      if (!result?.error) setSelectedSymptom(null);
      return result ?? null;
    },
    null,
  );

  const catSymptoms = symptoms.filter(s => s.category_id === selectedCat);
  const loggedIds = new Set(existingLogs.map(l => l.symptom_id));

  return (
    <div className="space-y-4">
      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCat(cat.id); setSelectedSymptom(null); }}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: selectedCat === cat.id ? '#800020' : '#f3f4f6',
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
              onClick={() => { setSelectedSymptom(isSelected ? null : s.id); if (log) setSeverity(log.severity); }}
              className="relative p-3 rounded-xl text-left transition-all border-2"
              style={{
                borderColor: isSelected ? '#800020' : isLogged ? '#fca5a5' : '#e5e7eb',
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
            <button
              type="submit"
              disabled={pending}
              className="w-full h-11 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: '#800020' }}
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
                  startDelete(() => deleteSymptomLog(log.id));
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
