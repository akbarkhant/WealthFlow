const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function mapBudgetForUi(budget) {
  const limit = Number(budget.amountLimit ?? budget.amount ?? budget.limit ?? 0);
  const spent = Number(budget.spent ?? 0);
  const usedPercent =
    budget.percentUsed != null
      ? Math.round(Number(budget.percentUsed))
      : limit > 0
        ? Math.round((spent / limit) * 100)
        : 0;

  return {
    ...budget,
    category: budget.categoryName ?? budget.category,
    limit,
    used: spent,
    usedPercent,
    fillClass: usedPercent >= 90 ? 'danger' : usedPercent >= 70 ? 'warning' : 'success',
  };
}

export function mapDashboardMetrics({
  monthly,
  yearly,
  breakdown,
  budgets,
  transactions,
  transactionsMeta,
}) {
  const txList = Array.isArray(transactions) ? transactions : [];
  const budgetList = (Array.isArray(budgets) ? budgets : []).map(mapBudgetForUi);

  const monthlyIncome = Number(monthly?.totalIncome ?? 0);
  const monthlyExpenses = Number(monthly?.totalExpenses ?? 0);
  const netSavings = Number(monthly?.netSavings ?? monthlyIncome - monthlyExpenses);
  const savingsRate =
    monthlyIncome > 0 ? Math.round((netSavings / monthlyIncome) * 100) : 0;

  const monthlyChart = (Array.isArray(yearly) ? yearly : [])
    .filter((row) => row?.month != null)
    .map((row) => ({
      month: MONTH_LABELS[(row.month ?? 1) - 1] ?? String(row.month),
      income: Number(row.totalIncome ?? 0),
      expense: Number(row.totalExpenses ?? 0),
    }));

  const spendingBreakdown = (Array.isArray(breakdown) ? breakdown : []).map((item) => ({
    category: item.categoryName ?? item.name ?? 'Other',
    percent: Math.round(Number(item.percentage ?? 0)),
    color: item.categoryColor ?? item.color ?? '#006c49',
    total: Number(item.total ?? 0),
  }));

  const budgetsAtRisk = budgetList.filter((b) => b.usedPercent >= 90);

  const recentTransactions = txList.map((tx) => ({
    id: tx.id,
    description: tx.description || tx.categoryName || 'Transaction',
    category: tx.categoryName ?? tx.category,
    amount: tx.type === 'expense' ? -Number(tx.amount) : Number(tx.amount),
    type: tx.type,
    date: tx.date,
    status: 'Posted',
  }));

  return {
    monthlyIncome,
    monthlyExpenses,
    netSavings,
    savingsRate,
    totalBalance: netSavings,
    monthlyChart,
    spendingBreakdown,
    recentTransactions,
    budgetsAtRisk,
    transactionsMeta: transactionsMeta ?? null,
  };
}

export function mapBudgetsToNotifications(budgetsAtRisk) {
  return budgetsAtRisk.map((b) => ({
    id: b.id,
    title: `${b.category} budget at ${b.usedPercent}%`,
    detail: b.usedPercent >= 100 ? 'Over monthly limit.' : 'Approaching monthly limit.',
  }));
}
