importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp(Object.fromEntries(new URL(self.location).searchParams));
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // Ak je appka práve otvorená a viditeľná, notifikáciu zobrazí sama appka – nezdviháme duplicitnú.
  self.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      if (clients.some((c) => c.visibilityState === 'visible')) return;
      const n = payload.notification || {};
      await self.registration.showNotification(n.title || 'KK Seiken', {
        body: n.body || '',
        icon: '/pwa-icon-192.png',
        tag: 'seiken-push',
      });
    })()
  );
});
