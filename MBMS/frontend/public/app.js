const API_BASE = '/api/notifications';// use it in env.

let swRegistration = null;
let isSubscribed = false;

// ─── Helper: convert VAPID key to Uint8Array ──────────────────────
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
};

// ─── 1. Register Service Worker ───────────────────────────────────
const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported in this browser.');
    updateUI(false);
    return;
  }

  try {
    swRegistration = await navigator.serviceWorker.register('./service-worker.js');
    console.log('Service Worker registered.');
    await checkSubscriptionStatus();
  } catch (err) {
    console.error('Service Worker registration failed:', err);
  }
};

// ─── 2. Check if already subscribed ──────────────────────────────
const checkSubscriptionStatus = async () => {
  const subscription = await swRegistration.pushManager.getSubscription();
  isSubscribed = subscription !== null;
  updateUI(isSubscribed);
};

// ─── 3. Subscribe user ────────────────────────────────────────────
const subscribeUser = async () => {
  try {
    // Fetch VAPID public key from your backend
    const res = await fetch(`${API_BASE}/vapid-public-key`);
    const { publicKey } = await res.json();

    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // Save subscription to your backend
    await fetch(`${API_BASE}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        user_id: getCurrentUserId(), // replace with your auth logic
      }),
    });

    isSubscribed = true;
    updateUI(true);
    console.log('Subscribed successfully.');
  } catch (err) {
    console.error('Subscription failed:', err);
  }
};

// ─── 4. Unsubscribe user ──────────────────────────────────────────
const unsubscribeUser = async () => {
  try {
    const subscription = await swRegistration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      await fetch(`${API_BASE}/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    }

    isSubscribed = false;
    updateUI(false);
    console.log('Unsubscribed successfully.');
  } catch (err) {
    console.error('Unsubscription failed:', err);
  }
};

// ─── 5. Toggle on button click ────────────────────────────────────
const handleToggle = () => {
  if (isSubscribed) {
    unsubscribeUser();
  } else {
    subscribeUser();
  }
};

// ─── 6. Update button UI ──────────────────────────────────────────
const updateUI = (subscribed) => {
  const btn = document.getElementById('notif-btn');
  if (!btn) return;

  btn.textContent = subscribed ? '🔔 Disable Notifications' : '🔕 Enable Notifications';
  btn.style.backgroundColor = subscribed ? '#e53e3e' : '#3182ce';
};

// ─── 7. Get current logged-in user ID ────────────────────────────
const getCurrentUserId = () => {
  // Replace this with your actual auth logic
  // e.g. from localStorage, JWT, or session
  return localStorage.getItem('user_id') || null;
};

// ─── Init ─────────────────────────────────────────────────────────
window.addEventListener('load', registerServiceWorker);