// categories.repository.js

const { query } = require('../../config/db.config');
const { v4: uuidv4 } = require('uuid');

const CATEGORY_SELECT = `
  id,
  user_id AS "userId",
  name,
  icon,
  color,
  type,
  is_default AS "isDefault",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

async function findAll(userId) {
  return query(
    `SELECT ${CATEGORY_SELECT}
     FROM categories
     WHERE user_id = $1
     ORDER BY is_default DESC, name ASC`,
    [userId]
  );
}

async function findById(id, userId) {
  const rows = await query(
    `SELECT ${CATEGORY_SELECT}
     FROM categories
     WHERE id = $1
       AND user_id = $2`,
    [id, userId]
  );

  return rows[0] || null;
}

async function findByName(userId, name) {
  const rows = await query(
    `SELECT ${CATEGORY_SELECT}
     FROM categories
     WHERE user_id = $1
       AND LOWER(name) = LOWER($2)`,
    [userId, name]
  );

  return rows[0] || null;
}

async function create(userId, input) {
  const id = uuidv4();

  await query(
    `INSERT INTO categories
      (
        id,
        user_id,
        name,
        icon,
        color,
        type,
        is_default
      )
     VALUES
      ($1,$2,$3,$4,$5,$6,false)`,
    [
      id,
      userId,
      input.name,
      input.icon,
      input.color,
      input.type,
    ]
  );

  return findById(id, userId);
}

async function update(id, userId, input) {
  const fields = [];
  const values = [];

  let idx = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(input.name);
  }

  if (input.icon !== undefined) {
    fields.push(`icon = $${idx++}`);
    values.push(input.icon);
  }

  if (input.color !== undefined) {
    fields.push(`color = $${idx++}`);
    values.push(input.color);
  }

  if (input.type !== undefined) {
    fields.push(`type = $${idx++}`);
    values.push(input.type);
  }

  if (fields.length === 0) {
    return findById(id, userId);
  }

  fields.push('updated_at = NOW()');

  values.push(id, userId);

  await query(
    `UPDATE categories
     SET ${fields.join(', ')}
     WHERE id = $${idx++}
       AND user_id = $${idx}`,
    values
  );

  return findById(id, userId);
}

async function remove(id, userId) {
  const rows = await query(
    `DELETE FROM categories
     WHERE id = $1
       AND user_id = $2
       AND is_default = false
     RETURNING id`,
    [id, userId]
  );

  return rows.length > 0;
}

module.exports = {
  findAll,
  findById,
  findByName,
  create,
  update,
  remove,
};