'use client';

import { useState, useTransition } from 'react';
import { toggleBookmark } from '@/actions/content';
import { analytics } from '@/lib/analytics';

interface BookmarkButtonProps {
  contentId: string;
  isBookmarked: boolean;
}

export function BookmarkButton({ contentId, isBookmarked: initial }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !bookmarked;
    setBookmarked(next);
    startTransition(async () => {
      await toggleBookmark(contentId);
    });
    // GA4: 북마크 추가 시에만 이벤트 발송 (해제는 추적하지 않음)
    if (next) {
      analytics.contentBookmarked(contentId);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={bookmarked ? '북마크 해제' : '북마크 추가'}
      className="w-10 h-10 flex items-center justify-center rounded-full text-xl transition-colors disabled:opacity-50"
      style={{ backgroundColor: bookmarked ? '#fdf6f7' : '#f3f4f6' }}
    >
      {bookmarked ? '🔖' : '🏷️'}
    </button>
  );
}
