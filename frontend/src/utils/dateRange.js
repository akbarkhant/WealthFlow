export function getCurrentPeriod() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export function getMonthDateRange(year, month) {
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  return {
    month,
    year,
    startDate: `${year}-${mm}-01`,
    endDate: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}

export function periodFromDateInputs(startDate, endDate) {
  if (!startDate) {
    const { month, year } = getCurrentPeriod();
    return getMonthDateRange(year, month);
  }
  const start = new Date(startDate);
  return {
    month: start.getMonth() + 1,
    year: start.getFullYear(),
    startDate,
    endDate: endDate || startDate,
  };
}
