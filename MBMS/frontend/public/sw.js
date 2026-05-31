// public/sw.js

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'You have a new update from WealthFlow.',
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      data: {
        url: data.url || '/dashboard'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'WealthFlow Alert', options)
    );
  } catch (err) {
    // Fallback if payload isn't clean JSON
    event.waitUntil(
      self.registration.showNotification('WealthFlow Alert', {
        body: event.data.text()
      }
    ));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it
      for (let client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});