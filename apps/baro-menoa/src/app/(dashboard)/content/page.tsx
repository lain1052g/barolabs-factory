import type { Metadata } from 'next';
import { getExpertContents } from '@/actions/content';
import { CATEGORY_LABEL, CATEGORY_EMOJI } from '@/lib/content-categories';
import { ContentList } from './ContentList';

export const metadata: Metadata = {
  title: '전문가 콘텐츠 | 메노아',
  description: '갱년기 전문가가 검토한 건강 정보를 확인하세요.',
};

export const revalidate = 300;

export default async function ContentPage() {
  const { plan, contents } = await getExpertContents();

  return (
    <div className="px-4 py-6 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">전문가 콘텐츠</h1>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: plan === 'pro' ? 'var(--c-brand)' : '#f3f4f6',
            color: plan === 'pro' ? 'white' : '#6b7280',
          }}
        >
          {plan === 'pro' ? 'Pro' : 'Free'}
        </span>
      </div>

      {/* 안내 */}
      <div
        className="brand-bg flex items-start gap-3 p-4 rounded-2xl border border-[#f9d0d7] dark:border-[#5a2a30]"
        style={{ backgroundColor: 'var(--c-brand-subtle)' }}
      >
        <span className="text-xl flex-shrink-0">🔬</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--c-brand)' }}>
            전문가 검토 콘텐츠
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
            의사·영양사·운동전문가가 갱년기 여성을 위해 작성하고 검토한 건강 정보입니다.
            {plan === 'free' && ' Pro 전용 콘텐츠는 업그레이드 후 열람 가능합니다.'}
          </p>
        </div>
      </div>

      {/* 빈 상태 */}
      {contents.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 shadow-sm dark:shadow-none text-center space-y-4">
          <div className="text-5xl">📚</div>
          <p className="text-gray-700 dark:text-gray-200 font-semibold">콘텐츠가 준비 중입니다</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            전문가들이 갱년기 건강 정보를 준비하고 있어요. 곧 다양한 콘텐츠를 만나보실 수 있습니다.
          </p>

          {/* 예정 카테고리 미리보기 */}
          <div className="grid grid-cols-2 gap-3 mt-4 text-left">
            {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
              <div
                key={key}
                className="rounded-xl p-4 border border-dashed border-gray-200 dark:border-gray-700 space-y-1"
              >
                <span className="text-2xl">{CATEGORY_EMOJI[key]}</span>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">준비 중</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ContentList contents={contents} plan={plan} />
      )}
    </div>
  );
}
