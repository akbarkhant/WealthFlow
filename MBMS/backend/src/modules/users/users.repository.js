const { query } = require('../../config/db.config');

// ── Get User By ID ───────────────────────────────────────────────
async function getUserById(id) {
  const rows = await query(
    `SELECT
        id,
        name,
        email,
        avatar_url AS "avatarUrl",
        currency,
        created_at AS "createdAt"
     FROM users
     WHERE id = $1`,
    [id]
  );

  return rows[0] || null;
}

// ── Update User ──────────────────────────────────────────────────
async function updateUser(id, data) {
  const fields = [];
  const values = [];

  let idx = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(data.name);
  }

  if (data.currency !== undefined) {
    fields.push(`currency = $${idx++}`);
    values.push(data.currency);
  }

  if (data.avatarUrl !== undefined) {
    fields.push(`avatar_url = $${idx++}`);
    values.push(data.avatarUrl);
  }

  // Nothing to update
  if (fields.length === 0) {
    return getUserById(id);
  }

  fields.push('updated_at = NOW()');

  values.push(id);

  await query(
    `UPDATE users
     SET ${fields.join(', ')}
     WHERE id = $${idx}`,
    values
  );

  return getUserById(id);
}

// ── Hard Delete User ─────────────────────────────────────────────
async function deleteUser(id) {
  await query(
    `DELETE FROM users
     WHERE id = $1`,
    [id]
  );
}

// ── Exports ──────────────────────────────────────────────────────
module.exports = {
  getUserById,
  updateUser,
  deleteUser, // Renamed from softDeleteUser to reflect hard delete
};