import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../hooks/useNotification';
import { useNotificationPush } from '../hooks/useNotificationPush'; // Import the push hook
import '../styles/components/Notificationbell.css';

const TYPE_META = {
  budget_alert: { icon: '⚠️', color: '#b45309' },
  broadcast: { icon: '📢', color: '#005ac2' },
  general: { icon: '🔔', color: '#006c49' },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Minimal API mapping layer needed by useNotificationPush to speak with your router endpoints
// Minimal API mapping layer needed by useNotificationPush to speak with your router endpoints
const notificationApiClient = {
  getVapidPublicKey: () => fetch('/api/notifications/vapid-public-key').then(res => res.json()),

  saveSubscription: (payload) => fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure auth header passes
    },
    body: JSON.stringify({ subscription: payload }) // Wrap correctly for controller destructuring
  }),

  removeSubscription: (payload) => fetch('/api/notifications/unsubscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    // 🟢 Extract the raw endpoint string so your backend controller parses it cleanly
    body: JSON.stringify({ endpoint: payload?.endpoint || payload })
  })
};

export default function NotificationBell() {
  // 1. Context for UI list state and history management
  const {
    history, historyLoading, unreadCount, hasMore,
    loadHistory, markRead,
  } = useNotifications();

  // 2. Concrete hardware sync states from the push hook
  const {
    isSupported: swSupported,
    permission,
    isSubscribed: subscribed,
    isProcessing: subscribing,
    error: pushError,
    subscribe,
    unsubscribe,
  } = useNotificationPush(notificationApiClient);

  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);
  const loadedRef = useRef(false);

  // ── Load history once on first open ────────────────────────────
  useEffect(() => {
    if (open && !loadedRef.current) {
      loadHistory(true);
      loadedRef.current = true;
    }
    if (open) markRead();
  }, [open, loadHistory, markRead]);

  // ── Close on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Escape key ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const toggleOpen = () => setOpen(o => !o);

  const handleSubscribeToggle = async () => {
    if (subscribed) await unsubscribe();
    else await subscribe();
  };

  return (
    <div className="nb-root">
      {/* ── Bell button ─────────────────────────────────────── */}
      <button
        ref={bellRef}
        className={`nb-bell ${open ? 'nb-bell--active' : ''}`}
        onClick={toggleOpen}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <svg className="nb-bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="nb-badge" aria-label={`${unreadCount} unread`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ──────────────────────────────────── */}
      <div
        ref={panelRef}
        className={`nb-panel glass-card ${open ? 'nb-panel--open' : ''}`}
        role="dialog"
        aria-label="Notifications panel"
      >
        {/* Header */}
        <div className="nb-header">
          <div className="nb-header-left">
            <span className="nb-title">Notifications</span>
            {/* 🟢 Line Added: Feature Coming Soon placeholder status tag */}
            <span className="nb-count-pill" style={{ background: 'rgba(255,255,255,0.08)', color: '#a1a1aa', fontSize: '11px' }}>Coming Soon</span>
            {unreadCount > 0 && (
              <span className="nb-count-pill">{unreadCount} new</span>
            )}
          </div>
          <button className="nb-close" onClick={() => setOpen(false)} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Push subscribe toggle */}
        {swSupported && (
          <div className="nb-sub-bar">
            <div className="nb-sub-info">
              <span className={`nb-sub-dot ${subscribed ? 'nb-sub-dot--on' : ''}`} />
              <span className="nb-sub-label">
                {subscribed ? 'Push notifications on' : 'Push notifications off'}
              </span>
            </div>
            <button
              className={`nb-sub-btn ${subscribed ? 'nb-sub-btn--off' : 'nb-sub-btn--on'}`}
              onClick={handleSubscribeToggle}
              disabled={subscribing || permission === 'denied'}
            >
              {subscribing ? (
                <span className="nb-spinner" />
              ) : subscribed ? 'Turn off' : 'Turn on'}
            </button>
          </div>
        )}

        {/* Display hardware subscription or permission rejections safely */}
        {(permission === 'denied' || pushError) && (
          <div className="nb-denied">
            🚫 {pushError || 'Push blocked in browser settings. Enable it in site permissions.'}
          </div>
        )}

        {/* Notification list */}
        <div className="nb-list" role="list">
          {history.length === 0 && !historyLoading && (
            <div className="nb-empty">
              <span className="nb-empty-icon">🔔</span>
              <span className="nb-empty-text">No notifications yet</span>
            </div>
          )}

          {history.map((item, i) => {
            const meta = TYPE_META[item.type] ?? TYPE_META.general;
            return (
              <div
                key={item.id}
                className="nb-item"
                role="listitem"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="nb-item-icon" style={{ background: `${meta.color}14` }}>
                  <span>{meta.icon}</span>
                </div>
                <div className="nb-item-body">
                  <div className="nb-item-header">
                    <span className="nb-item-title">{item.title}</span>
                    <span className="nb-item-time">{timeAgo(item.sent_at)}</span>
                  </div>
                  <p className="nb-item-body-text">{item.body}</p>
                  {item.url && (
                    <a href={item.url} className="nb-item-link" onClick={() => setOpen(false)}>
                      View →
                    </a>
                  )}
                </div>
                <div className="nb-item-bar" style={{ background: meta.color }} />
              </div>
            );
          })}

          {historyLoading && (
            <div className="nb-loading">
              <span className="nb-spinner nb-spinner--lg" />
            </div>
          )}

          {hasMore && !historyLoading && (
            <button className="nb-load-more" onClick={() => loadHistory(false)}>
              Load more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}