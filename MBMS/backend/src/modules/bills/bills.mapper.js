/*
 * Convert a database bill row into API response format.
 *
 * Expected row shape:
 * {
 *   id,
 *   userId,
 *   categoryId,
 *   categoryName,
 *   categoryIcon,
 *   name,
 *   amount,
 *   currency,
 *   dueDate,
 *   recurrence,
 *   status,
 *   notes,
 *   isAutopay,
 *   createdAt,
 *   updatedAt
 * }
 */

function mapBill(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.userId,

    categoryId: row.categoryId,
    categoryName: row.categoryName,
    categoryIcon: row.categoryIcon,

    name: row.name,
    amount: Number(row.amount),
    currency: row.currency,

    dueDate: row.dueDate,
    recurrence: row.recurrence,
    status: row.status,

    notes: row.notes,
    isAutopay: Boolean(row.isAutopay),

    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapBills(rows = []) {
  return rows.map(mapBill);
}

module.exports = {
  mapBill,
  mapBills,
};
