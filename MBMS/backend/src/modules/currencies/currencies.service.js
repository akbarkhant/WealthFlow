/**
 * MVP currency helper — returns 1:1 rate when modules are not fully wired.
 */
async function getExchangeRate(fromCurrency, toCurrency) {
  if (!fromCurrency || !toCurrency) {
    return 1;
  }
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return 1;
  }
  return 1;
}

module.exports = {
  getExchangeRate,
};
