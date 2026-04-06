'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes는 hydration 이후에만 실제 테마를 알 수 있음
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        className="w-9 h-9 flex items-center justify-center rounded-full text-lg opacity-0"
        aria-label="테마 전환"
      >
        ☀️
      </button>
    );
  }

  const cycle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const icon = theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '⚙️';
  const label =
    theme === 'light' ? '라이트 모드' : theme === 'dark' ? '다크 모드' : '시스템 설정';

  return (
    <button
      onClick={cycle}
      title={label}
      aria-label={`현재 ${label} — 클릭하여 전환`}
      className="w-9 h-9 flex items-center justify-center rounded-full text-lg
        hover:bg-[var(--surface)] transition-colors"
    >
      {icon}
    </button>
  );
}
