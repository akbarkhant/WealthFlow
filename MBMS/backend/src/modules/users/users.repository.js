const { query } = require('../../config/database');

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
     WHERE id = $1
       AND deleted_at IS NULL`,
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
     WHERE id = $${idx}
       AND deleted_at IS NULL`,
    values
  );

  return getUserById(id);
}

// ── Soft Delete User ─────────────────────────────────────────────
async function softDeleteUser(id) {
  await query(
    `UPDATE users
     SET deleted_at = NOW(),
         email = email || '_deleted_' || id
     WHERE id = $1`,
    [id]
  );
}

// ── Exports ──────────────────────────────────────────────────────
module.exports = {
  getUserById,
  updateUser,
  softDeleteUser,
};