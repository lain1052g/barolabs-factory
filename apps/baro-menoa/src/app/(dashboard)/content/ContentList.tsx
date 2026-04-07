'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CATEGORY_LABEL, CATEGORY_EMOJI } from '@/lib/content-categories';

type ContentItem = {
  id: string;
  title: string;
  category: string;
  is_pro_only: boolean;
  is_bookmarked: boolean;
  author_name: string;
  author_title: string | null;
  thumbnail_url: string | null;
};

const ALL = 'all';

export function ContentList({ contents, plan }: { contents: ContentItem[]; plan: string }) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [showBookmarked, setShowBookmarked] = useState(false);

  const categories = [ALL, ...Object.keys(CATEGORY_LABEL)];

  const filtered = contents.filter(item => {
    if (showBookmarked && !item.is_bookmarked) return false;
    if (activeCategory !== ALL && item.category !== activeCategory) return false;
    return true;
  });

  const bookmarkCount = contents.filter(c => c.is_bookmarked).length;

  return (
    <div className="space-y-3">
      {/* 카테고리 필터 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor: activeCategory === cat ? 'var(--c-brand)' : '#f3f4f6',
              color: activeCategory === cat ? 'white' : '#6b7280',
            }}
          >
            {cat === ALL ? '전체' : (
              <>{CATEGORY_EMOJI[cat]} {CATEGORY_LABEL[cat]}</>
            )}
          </button>
        ))}
      </div>

      {/* 북마크 필터 토글 */}
      {bookmarkCount > 0 && (
        <button
          onClick={() => setShowBookmarked(prev => !prev)}
          aria-pressed={showBookmarked}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          style={{
            backgroundColor: showBookmarked ? '#fdf6f7' : '#f3f4f6',
            color: showBookmarked ? 'var(--c-brand)' : '#6b7280',
            border: showBookmarked ? '1px solid var(--c-brand-border)' : '1px solid transparent',
          }}
        >
          🔖 저장한 콘텐츠 ({bookmarkCount})
        </button>
      )}

      {/* 콘텐츠 목록 */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center space-y-2 shadow-sm dark:shadow-none">
          <p className="text-3xl">{showBookmarked ? '🔖' : '📭'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {showBookmarked ? '저장한 콘텐츠가 없어요' : '해당 카테고리 콘텐츠가 없어요'}
          </p>
        </div>
      ) : (
        filtered.map((item) => {
          const isLocked = item.is_pro_only && plan !== 'pro';
          return (
            <Link
              key={item.id}
              href={isLocked ? '/settings' : `/content/${item.id}`}
              className="block bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none overflow-hidden active:scale-[0.99] transition-transform"
            >
              <div className="p-4 flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl overflow-hidden"
                  style={{ backgroundColor: 'var(--c-brand-subtle)' }}
                >
                  {item.thumbnail_url ? (
                    <Image
                      src={item.thumbnail_url}
                      alt=""
                      width={56}
                      height={56}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    CATEGORY_EMOJI[item.category] ?? '📄'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'var(--c-brand-subtle)', color: 'var(--c-brand)' }}
                    >
                      {CATEGORY_LABEL[item.category] ?? item.category}
                    </span>
                    {item.is_pro_only && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className={`text-sm font-semibold leading-snug ${isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
                    {isLocked ? '🔒 ' : ''}{item.title}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {item.author_name}
                    {item.author_title && ` · ${item.author_title}`}
                  </p>
                </div>
                {item.is_bookmarked && (
                  <span className="text-lg flex-shrink-0">🔖</span>
                )}
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
