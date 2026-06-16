import { useState, useEffect } from 'react';
import { notificationFetch } from '../api/notificationsApi';

// ─── Helper: convert VAPID key ────────────────────────────────────
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

const usePushNotification = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swRegistration, setSwRegistration] = useState(null);

  // ─── 1. Register service worker on mount ───────────────────────
  useEffect(() => {
    const init = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setIsSupported(false);
        setIsLoading(false);
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        setSwRegistration(registration);

        const existing = await registration.pushManager.getSubscription();
        setIsSubscribed(!!existing);
      } catch (err) {
        setError('Service Worker registration failed.');
        console.error('[usePushNotification] Registration error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // ─── 2. Subscribe ───────────────────────────────────────────────
  const subscribe = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!swRegistration) {
        throw new Error('Push manager unavailable. Service worker failed to register.');
      }

      const res = await notificationFetch('/vapid-public-key');

      if (!res.ok) {
        throw new Error(`Server returned ${res.status} — check that /api/notifications routes are registered in app.js`);
      }

      const data = await res.json();

      if (!data.publicKey) {
        throw new Error('VAPID public key missing from server response. Check your .env file.');
      }

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });

      const saveRes = await notificationFetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription }),
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save push subscription on the server.');
      }

      setIsSubscribed(true);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Permission denied. Enable notifications in browser settings.');
      } else {
        setError(err.message || 'Failed to subscribe. Please try again.');
      }
      console.error('[usePushNotification] subscribe error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── 3. Unsubscribe ─────────────────────────────────────────────
  const unsubscribe = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!swRegistration) {
        throw new Error('Push manager unavailable. Service worker missing.');
      }

      const subscription = await swRegistration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        const res = await notificationFetch('/unsubscribe', {
          method: 'POST',
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        if (!res.ok) {
          throw new Error('Failed to remove push subscription on the server.');
        }
      }

      setIsSubscribed(false);
    } catch (err) {
      setError(err.message || 'Failed to unsubscribe. Please try again.');
      console.error('[usePushNotification] unsubscribe error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── 4. Toggle ──────────────────────────────────────────────────
  const toggle = () => {
    const action = isSubscribed ? unsubscribe() : subscribe();
    action.catch(() => {});
  };

  return { isSubscribed, isSupported, isLoading, error, toggle };
};

export default usePushNotification;
