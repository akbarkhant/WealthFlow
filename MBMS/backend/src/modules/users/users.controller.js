const service = require('./users.service');
const {  sendSuccess  } = require('../../shared/ApiResponse');

// ── Get Current User ─────────────────────────────────────────────
async function getMe(req, res, next) {
  try {
    const user = await service.getMe(req.user.id);

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
}
// ── Update Current User ──────────────────────────────────────────
async function updateMe(req, res, next) {
  try {
    const user = await service.updateMe(
      req.user.id,
      req.body
    );

    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

// ── Delete Current User ──────────────────────────────────────────
async function deleteMe(req, res, next) {
  try {
    await service.deleteMe(req.user.id);

    sendSuccess(res, {
      message: 'Account deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMe,
  updateMe,
  deleteMe,
};