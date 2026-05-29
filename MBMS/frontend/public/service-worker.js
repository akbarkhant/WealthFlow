// ─── Listen for incoming push notifications ───────────────────────
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || 'New Notification';
  const options = {
    body: data.body || 'You have a new message.',
    icon: '/icons/notification-icon.png',   // add your own icon
    badge: '/icons/badge-icon.png',         // small icon on Android
    vibrate: [200, 100, 200],               // vibration pattern
    data: { url: data.url || '/' },         // used on click
    actions: [
      { action: 'open', title: '👁 View' },
      { action: 'dismiss', title: '✖ Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ─── Handle notification click ────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If tab is already open, focus it
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ─── Handle push subscription expiry ─────────────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true })
      .then((newSubscription) => {
        return fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: newSubscription }),
        });
      })
  );
});