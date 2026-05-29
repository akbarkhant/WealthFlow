const notificationService = require('./notification.service');

// ─── GET /vapid-public-key ────────────────────────────────────────
const getVapidPublicKey = (req, res) => {
  try {
    const publicKey = notificationService.getVapidPublicKey();
    res.status(200).json({ publicKey });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve VAPID public key.' });
  }
};

// ─── POST /subscribe ──────────────────────────────────────────────
const subscribe = async (req, res) => {
  const { subscription, user_id } = req.body;

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ error: 'Invalid subscription object.' });
  }

  try {
    const saved = await notificationService.saveSubscription(subscription, user_id);
    res.status(201).json({ message: 'Subscription saved successfully.', data: saved });
  } catch (err) {
    console.error('Subscribe error:', err.message);
    res.status(500).json({ error: 'Failed to save subscription.' });
  }
};

// ─── POST /unsubscribe ────────────────────────────────────────────
const unsubscribe = async (req, res) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required.' });
  }

  try {
    const removed = await notificationService.removeSubscription(endpoint);
    if (!removed) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }
    res.status(200).json({ message: 'Unsubscribed successfully.' });
  } catch (err) {
    console.error('Unsubscribe error:', err.message);
    res.status(500).json({ error: 'Failed to unsubscribe.' });
  }
};

// ─── POST /send/:userId ───────────────────────────────────────────
const sendToUser = async (req, res) => {
  const { userId } = req.params;
  const { title, body, url } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required.' });
  }

  try {
    const result = await notificationService.notifyUser(userId, { title, body, url });
    res.status(200).json({ message: 'Notification sent.', result });
  } catch (err) {
    console.error('Send error:', err.message);
    const status = err.message.includes('No subscriptions') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
};

// ─── POST /broadcast ──────────────────────────────────────────────
const broadcast = async (req, res) => {
  const { title, body, url } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required.' });
  }

  try {
    const result = await notificationService.broadcastNotification({ title, body, url });
    res.status(200).json({ message: 'Broadcast sent.', result });
  } catch (err) {
    console.error('Broadcast error:', err.message);
    const status = err.message.includes('No subscribers') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
};

module.exports = {
  getVapidPublicKey,
  subscribe,
  unsubscribe,
  sendToUser,
  broadcast,
};