'use client';

import { useState } from 'react';
import { getToken } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase/client';
import { savePushToken } from '@/actions/push';

export function PushPermissionButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'denied'>('idle');

  const handleEnable = async () => {
    setStatus('loading');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      const messaging = getFirebaseMessaging();
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js'
        ),
      });

      if (token) {
        await savePushToken(token, 'web');
        setStatus('done');
      }
    } catch (err) {
      console.error('[Push]', err);
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <p className="text-xs text-green-600 text-center">✓ 알림이 활성화되었습니다</p>
    );
  }

  if (status === 'denied') {
    return (
      <p className="text-xs text-gray-400 text-center">브라우저 설정에서 알림을 허용해주세요</p>
    );
  }

  return (
    <button
      onClick={handleEnable}
      disabled={status === 'loading'}
      className="w-full py-2.5 rounded-xl text-sm font-medium border text-gray-600 hover:bg-gray-50 disabled:opacity-50"
    >
      {status === 'loading' ? '설정 중...' : '증상 알림 받기'}
    </button>
  );
}
