'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BURGUNDY = '#800020';

const tabs = [
  {
    href: '/dashboard',
    label: '홈',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? BURGUNDY : 'none'} viewBox="0 0 24 24" stroke={active ? BURGUNDY : '#9ca3af'} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/symptoms',
    label: '증상',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={active ? BURGUNDY : '#9ca3af'} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1" strokeLinecap="round"/>
        <line x1="9" y1="12" x2="15" y2="12" strokeLinecap="round"/>
        <line x1="9" y1="16" x2="13" y2="16" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/sos',
    label: 'SOS',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={active ? BURGUNDY : '#9ca3af'} strokeWidth={1.8}>
        <circle cx="12" cy="12" r="9" strokeLinecap="round"/>
        <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="0.5" fill={active ? BURGUNDY : '#9ca3af'}/>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: '설정',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={active ? BURGUNDY : '#9ca3af'} strokeWidth={1.8}>
        <circle cx="12" cy="8" r="3" strokeLinecap="round"/>
        <path strokeLinecap="round" d="M6 20v-1a6 6 0 0 1 12 0v1"/>
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-inset-bottom z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(tab => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              className="flex flex-col items-center gap-0.5 flex-1 py-2"
            >
              {tab.icon(active)}
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? BURGUNDY : '#9ca3af' }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
