'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('pwa-install-dismissed')) {
      setDismissed(true);
      return;
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    // Android / Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as { standalone?: boolean }).standalone;
    if (isIOS && !isInStandaloneMode) {
      setShowIOSGuide(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', '1');
    setDismissed(true);
    setDeferredPrompt(null);
    setShowIOSGuide(false);
  };

  if (dismissed || (!deferredPrompt && !showIOSGuide)) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
            style={{ backgroundColor: '#800020' }}
          >
            메
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">홈 화면에 추가하기</p>
            {showIOSGuide ? (
              <p className="text-xs text-gray-500 mt-0.5">
                Safari 하단 공유 버튼 → &quot;홈 화면에 추가&quot;
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-0.5">앱처럼 빠르게 사용하세요</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!showIOSGuide && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
              style={{ backgroundColor: '#800020' }}
            >
              설치
            </button>
          )}
          <button
            onClick={handleDismiss}
            aria-label="설치 배너 닫기"
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
