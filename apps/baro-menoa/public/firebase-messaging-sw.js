importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAv_s7sdXxpnOs8R1m-07YZJTZ3CknBawg',
  authDomain: 'baro-menoa.firebaseapp.com',
  projectId: 'baro-menoa',
  storageBucket: 'baro-menoa.firebasestorage.app',
  messagingSenderId: '409275888999',
  appId: '1:409275888999:web:fddda1d7b4d436f7d3ebc2',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title = '메노아', body = '' } = payload.notification ?? {};
  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: { url: payload.data?.url ?? '/dashboard' },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/dashboard';
  event.waitUntil(clients.openWindow(url));
});
