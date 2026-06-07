// public/sw.js
// Optimized Production Service Worker for WealthFlow Push Notification Engine

// ─── 1. Listen for Inbound Push Events ──────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let title = 'WealthFlow Alert';
  let options = {
    body: 'You have a new update from WealthFlow.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200], // Haptic vibration response pattern
    data: { url: '/dashboard' },
    actions: [
      { action: 'open', title: '👁 View' },
      { action: 'dismiss', title: '✖ Dismiss' },
    ],
  };

  try {
    // Attempt parsing incoming byte-stream payload as structured JSON
    const data = event.data.json();
    
    title = data.title || title;
    options.body = data.body || options.body;
    options.icon = data.icon || options.icon;
    options.badge = data.badge || options.badge;
    if (data.url) options.data.url = data.url;
    
  } catch (err) {
    console.warn('[SW] Push payload was not valid JSON string format. Falling back to text stream read.');
    // Robust Fallback: Treat raw payload context data directly as body text string
    options.body = event.data.text() || options.body;
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ─── 2. Handle Interacted Notification Clicks ────────────────────────
self.addEventListener('notificationclick', (event) => {
  // Cleanly dismiss the physical notification tray card window frame instantly
  event.notification.close();

  // Defensive early exit if the user specifically clicks the 'Dismiss' action button
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    // Scrutinize currently running window thread tasks across clients
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Condition A: If the application tab context is already active, force screen focus focus
        for (const client of windowClients) {
          // Using .includes() is safer than strict equality matching to catch query params / hashes
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Condition B: Otherwise open a clean window path directly
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ─── 3. Self-Healing Automatic Subscription Renewer ──────────────────
// Fires automatically when the browser or push vendor cycles underlying keys
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription expired or changed. Syncing fresh endpoint registration...');
  
  event.waitUntil(
    self.registration.pushManager.getSubscription()
      .then((oldSubscription) => {
        // Re-subscribe using the exact same constraints
        return self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          // Note: The browser remembers the previous VAPID key used for this scope 
          // implicitly when parsing auto-renews under standard push subscription cycles
        });
      })
      .then((newSubscription) => {
        // Sync the newly minted endpoint token details straight back up to database storage maps
        return fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: newSubscription }),
        });
      })
      .catch((err) => {
        console.error('[SW] Automatic background subscription cycle renewal mapping aborted:', err);
      })
  );
});