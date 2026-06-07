// hooks/useNotifications.js
import { createContext, useContext, useEffect, useReducer, useCallback, useRef } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/notifications';

// ─── Context ──────────────────────────────────────────────────────
const NotificationCtx = createContext(null);

// ─── State shape ──────────────────────────────────────────────────
const initialState = {
  // push subscription
  swSupported:    false,
  permission:     'default',   // 'default' | 'granted' | 'denied'
  subscribed:     false,
  subscribing:    false,

  // in-app history
  history:        [],
  historyTotal:   0,
  historyPage:    0,
  historyLoading: false,
  unreadCount:    0,

  // preferences
  preferences:    [],
  prefsLoading:   false,

  // global
  error:          null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET':        return { ...state, ...action.payload };
    case 'CLEAR_ERR':  return { ...state, error: null };
    case 'HISTORY_APPEND':
      return {
        ...state,
        history:      [...state.history, ...action.payload.data],
        historyTotal: action.payload.total,
        historyPage:  state.historyPage + 1,
        historyLoading: false,
      };
    case 'MARK_READ':
      return { ...state, unreadCount: 0 };
    case 'PREFS_LOADED':
      return { ...state, preferences: action.payload, prefsLoading: false };
    case 'PREF_UPDATED':
      return {
        ...state,
        preferences: state.preferences.map(p =>
          p.type === action.payload.type ? action.payload : p
        ),
      };
    default: return state;
  }
}

// ─── Helper: get or fetch VAPID key ──────────────────────────────
let _vapidKey = null;
async function getVapidKey() {
  if (_vapidKey) return _vapidKey;
  const res  = await fetch(`${BASE_URL}/vapid-public-key`);
  if (!res.ok) throw new Error(`VAPID key fetch failed with status ${res.status}`);
  const json = await res.json();
  _vapidKey  = json.publicKey;
  return _vapidKey;
}

// ─── Helper: base64 url → Uint8Array (for VAPID) ─────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

// ─── Provider ────────────────────────────────────────────────────
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const swReg = useRef(null);

  // ── Bootstrap ───────────────────────────────────────────────────
  useEffect(() => {
    const swOk = 'serviceWorker' in navigator && 'PushManager' in window;
    dispatch({ type: 'SET', payload: {
      swSupported: swOk,
      permission:  swOk ? Notification.permission : 'denied',
    }});

    if (!swOk) return;

    // Register SW and check existing subscription
    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      swReg.current = reg;
      const existing = await reg.pushManager.getSubscription();
      dispatch({ type: 'SET', payload: { subscribed: !!existing } });
    }).catch(err => {
      console.error('SW registration failed:', err);
    });
  }, []);

  // ── Subscribe ───────────────────────────────────────────────────
  const subscribe = useCallback(async () => {
    if (!swReg.current) return;
    dispatch({ type: 'SET', payload: { subscribing: true, error: null } });

    try {
      const permission = await Notification.requestPermission();
      dispatch({ type: 'SET', payload: { permission } });

      if (permission !== 'granted') {
        dispatch({ type: 'SET', payload: { subscribing: false } });
        return;
      }

      const vapidKey     = await getVapidKey();
      const subscription = await swReg.current.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // SECURE FIX: Removed payload user_id body dependency — handle implicitly on server via authorization token session state maps
      const res = await fetch(`${BASE_URL}/subscribe`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subscription }),
      });

      if (!res.ok) throw new Error('Failed to register subscription endpoints on remote cluster backend service layer.');

      dispatch({ type: 'SET', payload: { subscribed: true, subscribing: false } });
    } catch (err) {
      dispatch({ type: 'SET', payload: { subscribing: false, error: err.message } });
    }
  }, []);

  // ── Unsubscribe ─────────────────────────────────────────────────
  const unsubscribe = useCallback(async () => {
    if (!swReg.current) return;
    dispatch({ type: 'SET', payload: { subscribing: true, error: null } });

    try {
      const subscription = await swReg.current.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await fetch(`${BASE_URL}/unsubscribe`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }
      dispatch({ type: 'SET', payload: { subscribed: false, subscribing: false } });
    } catch (err) {
      dispatch({ type: 'SET', payload: { subscribing: false, error: err.message } });
    }
  }, []);

  // ── Load history (paginated) ────────────────────────────────────
  const loadHistory = useCallback(async (reset = false) => {
    dispatch({ type: 'SET', payload: { historyLoading: true } });

    const page   = reset ? 0 : state.historyPage;
    const limit  = 15;
    const offset = page * limit;

    try {
      // SECURE FIX: Changed from `/history/${userId}` to implicit token path matching `/history`
      const res  = await fetch(`${BASE_URL}/history?limit=${limit}&offset=${offset}`);
      if (!res.ok) throw new Error(`Server returned error status context: ${res.status}`);
      const json = await res.json();

      if (reset) {
        dispatch({ type: 'SET', payload: {
          history:        json.data || [],
          historyTotal:   json.pagination?.total || 0,
          historyPage:    1,
          historyLoading: false,
          unreadCount:    json.pagination?.total > 0 ? Math.min(json.pagination.total, 9) : 0,
        }});
      } else {
        dispatch({ type: 'HISTORY_APPEND', payload: { data: json.data || [], total: json.pagination?.total || 0 } });
      }
    } catch (err) {
      dispatch({ type: 'SET', payload: { historyLoading: false, error: err.message } });
    }
  }, [state.historyPage]);

  const markRead = useCallback(() => dispatch({ type: 'MARK_READ' }), []);

  // ── Load preferences ────────────────────────────────────────────
  const loadPreferences = useCallback(async () => {
    dispatch({ type: 'SET', payload: { prefsLoading: true } });

    try {
      // SECURE FIX: Changed from `/preferences/${userId}` to implicit path `/preferences`
      const res  = await fetch(`${BASE_URL}/preferences`);
      if (!res.ok) throw new Error(`Server returned error status context: ${res.status}`);
      const json = await res.json();
      
      const knownTypes = [
        { type: 'budget_alert', label: 'Budget Alerts',       desc: 'When you exceed a category budget' },
        { type: 'general',      label: 'General Notifications', desc: 'Product updates and announcements' },
        { type: 'broadcast',    label: 'Broadcasts',           desc: 'Messages sent to all users' },
      ];
      const merged = knownTypes.map(k => {
        const saved = (json.data || []).find(p => p.type === k.type);
        return { ...k, enabled: saved ? saved.enabled : true, updated_at: saved?.updated_at ?? null };
      });
      dispatch({ type: 'PREFS_LOADED', payload: merged });
    } catch (err) {
      dispatch({ type: 'SET', payload: { prefsLoading: false, error: err.message } });
    }
  }, []);

  // ── Update a preference ─────────────────────────────────────────
  const updatePreference = useCallback(async (type, enabled) => {
    // Optimistic update
    dispatch({ type: 'PREF_UPDATED', payload: { type, enabled } });

    try {
      // SECURE FIX: Changed from `/preferences/${userId}` to implicit path `/preferences`
      const res = await fetch(`${BASE_URL}/preferences`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type, enabled }),
      });
      if (!res.ok) throw new Error('Failed preference serialization synchronization updates execution.');
    } catch (err) {
      // Revert on failure
      dispatch({ type: 'PREF_UPDATED', payload: { type, enabled: !enabled } });
      dispatch({ type: 'SET', payload: { error: 'Failed to update preference.' } });
    }
  }, []);

  const value = {
    ...state,
    subscribe,
    unsubscribe,
    loadHistory,
    markRead,
    loadPreferences,
    updatePreference,
    hasMore: state.history.length < state.historyTotal,
  };

  return <NotificationCtx.Provider value={value}>{children}</NotificationCtx.Provider>;
}

// ─── Consumer hook ────────────────────────────────────────────────
export function useNotifications() {
  const ctx = useContext(NotificationCtx);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
}