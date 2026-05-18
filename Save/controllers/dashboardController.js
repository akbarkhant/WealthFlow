// @desc    Get dashboard metrics
// @route   GET /api/dashboard/metrics
// @access  Private
const getDashboardMetrics = async (req, res) => {
  try {
    // In a real app, calculate this from transactions in the database
    res.json({
      totalBalance: 124592.00,
      totalBalanceChange: 2.4,
      monthlyIncome: 12400.00,
      monthlyExpenses: 8210.50,
      expensesChange: 12,
      recentTransactions: [
        {
          id: '1',
          description: 'Whole Foods Market',
          category: 'Groceries',
          amount: -142.30,
          status: 'Completed',
          date: 'Today, 2:45 PM',
          icon: 'shopping_cart',
          iconColor: 'primary'
        },
        {
          id: '2',
          description: 'Uber Technologies',
          category: 'Transport',
          amount: -34.50,
          status: 'Completed',
          date: 'Yesterday, 9:15 PM',
          icon: 'directions_car',
          iconColor: 'tertiary'
        },
        {
          id: '3',
          description: 'Payroll Deposit',
          category: 'Income',
          amount: 4200.00,
          status: 'Completed',
          date: 'Oct 28, 8:00 AM',
          icon: 'payments',
          iconColor: 'primary'
        }
      ]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardMetrics
};
