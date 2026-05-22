const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- JWT Decoder Helper ---
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// --- Mock Database / Fallback Handler ---
const getMockData = (key, defaultVal = []) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setMockData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize some default data in mock DB if empty
if (getMockData('mock_transactions', null) === null) {
  setMockData('mock_transactions', [
    { id: '1', description: 'Grocery Store', amount: 82.50, date: '2026-05-20', category: 'Food', type: 'expense' },
    { id: '2', description: 'Salary Deposit', amount: 4500.00, date: '2026-05-01', category: 'Income', type: 'income' },
    { id: '3', description: 'Electric Bill', amount: 120.00, date: '2026-05-15', category: 'Utilities', type: 'expense' },
    { id: '4', description: 'Netflix Subscription', amount: 15.49, date: '2026-05-10', category: 'Entertainment', type: 'expense' },
    { id: '5', description: 'Freelance Design', amount: 800.00, date: '2026-05-18', category: 'Income', type: 'income' }
  ]);
}

if (getMockData('mock_budgets', null) === null) {
  setMockData('mock_budgets', [
    { id: '1', category: 'Food', limit: 500, spent: 320, color: '#10b981' },
    { id: '2', category: 'Utilities', limit: 300, spent: 240, color: '#3c475a' },
    { id: '3', category: 'Entertainment', limit: 200, spent: 150, color: '#ba1a1a' }
  ]);
}

if (getMockData('mock_bills', null) === null) {
  setMockData('mock_bills', [
    { id: '1', title: 'Electric Bill', amount: 120.00, due: '2026-06-15', due_day: 15, status: 'unpaid', type: 'electricity', payment_method: 'manual' },
    { id: '2', title: 'Water Utility', amount: 45.00, due: '2026-06-10', due_day: 10, status: 'unpaid', type: 'utility', payment_method: 'manual' },
    { id: '3', title: 'Office Rent', amount: 1200.00, due: '2026-06-01', due_day: 1, status: 'paid', type: 'rent', payment_method: 'auto' },
    { id: '4', title: 'Netflix Subscription', amount: 15.49, due: '2026-06-10', due_day: 10, status: 'unpaid', type: 'subscription', payment_method: 'auto' },
    { id: '5', title: 'Internet Service', amount: 79.99, due: '2026-05-28', due_day: 28, status: 'overdue', overdue_days: 3, type: 'internet', payment_method: 'manual' }
  ]);
}

if (getMockData('mock_savings', null) === null) {
  setMockData('mock_savings', [
    { _id: '1', title: 'Emergency Fund', targetAmount: 10000, currentAmount: 8500, monthlyContribution: 150, status: 'On Track', category: 'Savings' },
    { _id: '2', title: 'Summer Vacation', targetAmount: 3000, currentAmount: 1200, monthlyContribution: 200, status: 'On Track', category: 'Leisure' },
    { _id: '3', title: 'New Laptop', targetAmount: 2000, currentAmount: 2000, monthlyContribution: 100, status: 'Completed', category: 'Tech' }
  ]);
}

const mockRequest = async (method, endpoint, body = null) => {
  console.log(`[API Mock] Intercepted ${method} ${endpoint}`, body);
  await new Promise(r => setTimeout(r, 400)); // Simulate network lag

  // 1. Auth Endpoint Mocks
  if (endpoint === '/auth/login') {
    const users = getMockData('mock_users');
    const matchedUser = users.find(u => u.email.toLowerCase() === body.email.toLowerCase());
    if (matchedUser) {
      const mockPayload = { sub: matchedUser.id, email: matchedUser.email, name: matchedUser.name };
      const token = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify(mockPayload)) + '.mocksignature';
      localStorage.setItem('currentUser', JSON.stringify(matchedUser));
      return { accessToken: token, refreshToken: 'mock-refresh-token' };
    } else {
      // Create user on login if it doesn't exist to make testing easier
      const newUser = {
        id: Math.random().toString(36).substring(2, 9),
        name: body.email.split('@')[0],
        email: body.email,
        currency: 'USD'
      };
      users.push(newUser);
      setMockData('mock_users', users);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      const mockPayload = { sub: newUser.id, email: newUser.email, name: newUser.name };
      const token = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify(mockPayload)) + '.mocksignature';
      return { accessToken: token, refreshToken: 'mock-refresh-token' };
    }
  }

  if (endpoint === '/auth/register') {
    const users = getMockData('mock_users');
    const emailExists = users.some(u => u.email.toLowerCase() === body.email.toLowerCase());
    if (emailExists) {
      throw new Error('An account with this email already exists');
    }
    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      name: body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim() || 'User',
      email: body.email,
      currency: body.currency || 'USD'
    };
    users.push(newUser);
    setMockData('mock_users', users);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    const mockPayload = { sub: newUser.id, email: newUser.email, name: newUser.name };
    const token = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify(mockPayload)) + '.mocksignature';
    return { accessToken: token, refreshToken: 'mock-refresh-token' };
  }

  if (endpoint === '/auth/me') {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) return JSON.parse(storedUser);

    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        return { id: decoded.sub, email: decoded.email, name: decoded.name || decoded.email.split('@')[0] };
      }
    }
    throw new Error('Not authorized');
  }

  if (endpoint === '/auth/forgot-password') {
    return { message: 'Password reset link sent to your email' };
  }

  if (endpoint.startsWith('/auth/reset-password')) {
    return { message: 'Password reset successfully' };
  }

  if (endpoint === '/auth/verify-otp') {
    return { message: 'OTP verified successfully' };
  }

  // 2. Metrics Mock
  if (endpoint === '/dashboard/metrics') {
    const transactions = getMockData('mock_transactions');
    const bills = getMockData('mock_bills');
    
    // Dynamic calculations
    let balance = 5000; // start balance
    let income = 0;
    let expenses = 0;
    
    transactions.forEach(t => {
      const amt = parseFloat(t.amount);
      if (t.type === 'income') {
        balance += amt;
        income += amt;
      } else {
        balance -= amt;
        expenses += amt;
      }
    });

    const recentTx = transactions.slice(0, 5).map(t => ({
      id: t.id,
      description: t.description,
      category: t.category || 'Other',
      amount: t.type === 'expense' ? -Math.abs(t.amount) : Math.abs(t.amount),
      status: 'Completed'
    }));

    // Spending breakdown
    const categoryTotals = {};
    let totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const amt = parseFloat(t.amount);
        const cat = t.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
        totalExpense += amt;
      }
    });

    const breakdownColors = {
      'Food': '#10b981',
      'Utilities': '#3c475a',
      'Entertainment': '#ba1a1a',
      'Rent': '#005ac2',
      'Technology': '#71a1ff',
      'Other': '#bbcabf'
    };

    const spendingBreakdown = Object.keys(categoryTotals).map(cat => {
      const amt = categoryTotals[cat];
      const percent = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
      return {
        category: cat,
        percent,
        color: breakdownColors[cat] || '#888888'
      };
    });

    if (spendingBreakdown.length === 0) {
      spendingBreakdown.push({ category: 'Food', percent: 100, color: '#10b981' });
    }

    return {
      totalBalance: balance,
      totalBalanceChange: 8.4,
      monthlyIncome: income || 5300,
      monthlyExpenses: expenses || 1200,
      expensesChange: 2.1,
      monthlyChart: [
        { month: 'Jan', income: 70, expense: 40 },
        { month: 'Feb', income: 80, expense: 50 },
        { month: 'Mar', income: 60, expense: 45 },
        { month: 'Apr', income: 90, expense: 55 },
        { month: 'May', income: 85, expense: 60 },
      ],
      spendingBreakdown,
      recentTransactions: recentTx,
      upcomingBills: bills.filter(b => b.status === 'unpaid').slice(0, 3)
    };
  }

  // 3. Transactions Mocks
  if (endpoint === '/transactions') {
    if (method === 'GET') {
      return getMockData('mock_transactions');
    }
    if (method === 'POST') {
      const list = getMockData('mock_transactions');
      const item = { ...body, id: Math.random().toString(36).substring(2, 9) };
      list.unshift(item);
      setMockData('mock_transactions', list);
      return item;
    }
  }

  if (endpoint.startsWith('/transactions/')) {
    const id = endpoint.split('/').pop();
    const list = getMockData('mock_transactions');
    if (method === 'PUT') {
      const index = list.findIndex(i => i.id === id);
      if (index > -1) {
        list[index] = { ...list[index], ...body };
        setMockData('mock_transactions', list);
        return list[index];
      }
    }
    if (method === 'DELETE') {
      const filtered = list.filter(i => i.id !== id);
      setMockData('mock_transactions', filtered);
      return { success: true };
    }
  }

  // 4. Budgets Mocks
  if (endpoint === '/budgets') {
    if (method === 'GET') {
      return getMockData('mock_budgets');
    }
    if (method === 'POST') {
      const list = getMockData('mock_budgets');
      const item = { ...body, id: Math.random().toString(36).substring(2, 9), spent: 0 };
      list.push(item);
      setMockData('mock_budgets', list);
      return item;
    }
  }

  // 5. Bills Mocks
  if (endpoint === '/bills') {
    if (method === 'GET') {
      return getMockData('mock_bills');
    }
    if (method === 'POST') {
      const list = getMockData('mock_bills');
      const dueDay = body.due ? parseInt(body.due.split('-')[2], 10) : new Date().getDate();
      const item = {
        id: Math.random().toString(36).substring(2, 9),
        title: body.title || body.name || 'New Bill',
        amount: parseFloat(body.amount || 0),
        due: body.due || new Date().toISOString().split('T')[0],
        due_day: dueDay,
        status: body.status || 'unpaid',
        type: body.type || 'other',
        payment_method: body.payment_method || 'manual'
      };
      list.push(item);
      setMockData('mock_bills', list);
      return item;
    }
  }

  if (endpoint.startsWith('/bills/')) {
    const id = endpoint.split('/').pop();
    const list = getMockData('mock_bills');
    if (method === 'PUT') {
      const index = list.findIndex(i => i.id === id);
      if (index > -1) {
        const dueDay = body.due ? parseInt(body.due.split('-')[2], 10) : list[index].due_day;
        list[index] = {
          ...list[index],
          ...body,
          amount: body.amount !== undefined ? parseFloat(body.amount) : list[index].amount,
          due_day: dueDay
        };
        setMockData('mock_bills', list);
        return list[index];
      }
    }
    if (method === 'DELETE') {
      const filtered = list.filter(i => i.id !== id);
      setMockData('mock_bills', filtered);
      return { success: true };
    }
  }

  // 6. Savings Mocks
  if (endpoint === '/savings') {
    if (method === 'GET') {
      const goals = getMockData('mock_savings');
      const totalGoals = goals.length;
      const goalsOnTrack = goals.filter(g => g.status === 'On Track' || g.status === 'Completed').length;
      const completed = goals.filter(g => g.status === 'Completed').length;
      const averageMonthlySavings = goals.reduce((acc, g) => acc + (parseFloat(g.monthlyContribution) || 0), 0);
      
      const stats = {
        goalsOnTrack,
        totalGoals,
        averageMonthlySavings,
        milestonesMet: completed
      };

      const chartData = [
        { month: 'Dec', amount: 350, saved: 250 },
        { month: 'Jan', amount: 400, saved: 300 },
        { month: 'Feb', amount: 380, saved: 290 },
        { month: 'Mar', amount: 450, saved: 380 },
        { month: 'Apr', amount: 420, saved: 340 },
        { month: 'May', amount: 500, saved: 420 }
      ];

      const featuredGoal = {
        title: 'Emergency Fund',
        deadline: 'Dec 2026',
        progress: 85,
        image: 'https://images.unsplash.com/photo-1579621970795-87faff3f9050?auto=format&fit=crop&q=80&w=1000'
      };

      return {
        goals,
        stats,
        chartData,
        featuredGoal
      };
    }
    if (method === 'POST') {
      const list = getMockData('mock_savings');
      const item = {
        _id: Math.random().toString(36).substring(2, 9),
        title: body.title || body.name || 'New Goal',
        targetAmount: parseFloat(body.targetAmount || body.target || 0),
        currentAmount: parseFloat(body.currentAmount || body.current || 0),
        monthlyContribution: parseFloat(body.monthlyContribution || 100),
        status: body.status || 'On Track',
        category: body.category || 'Savings'
      };
      list.push(item);
      setMockData('mock_savings', list);
      return item;
    }
  }

  if (endpoint.startsWith('/savings/')) {
    const id = endpoint.split('/').pop();
    const list = getMockData('mock_savings');
    if (method === 'PUT') {
      const index = list.findIndex(i => (i._id === id || i.id === id));
      if (index > -1) {
        list[index] = {
          ...list[index],
          ...body,
          title: body.title || body.name || list[index].title,
          targetAmount: body.targetAmount !== undefined ? parseFloat(body.targetAmount) : list[index].targetAmount,
          currentAmount: body.currentAmount !== undefined ? parseFloat(body.currentAmount) : list[index].currentAmount,
          monthlyContribution: body.monthlyContribution !== undefined ? parseFloat(body.monthlyContribution) : list[index].monthlyContribution
        };
        setMockData('mock_savings', list);
        return list[index];
      }
    }
    if (method === 'DELETE') {
      const filtered = list.filter(i => (i._id !== id && i.id !== id));
      setMockData('mock_savings', filtered);
      return { success: true };
    }
  }

  // 7. User Update/Settings
  if (endpoint === '/users/me' || endpoint === '/auth/profile') {
    if (method === 'PUT' || method === 'PATCH') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        const updated = { ...u, ...body };
        localStorage.setItem('currentUser', JSON.stringify(updated));
        // Sync in user list
        const users = getMockData('mock_users');
        const idx = users.findIndex(x => x.id === u.id);
        if (idx > -1) {
          users[idx] = updated;
          setMockData('mock_users', users);
        }
        return updated;
      }
    }
  }

  return { success: true };
};

const handleResponse = async (response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    return Promise.reject(error);
  }

  // Auto unwrap ApiResponse structure if present
  if (data && data.hasOwnProperty('success') && data.hasOwnProperty('data')) {
    return data.data;
  }

  return data;
};

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('accessToken');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

const api = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await handleResponse(response);
    } catch (err) {
      console.warn(`[API] GET ${endpoint} failed. Using mock fallback. Error:`, err);
      return await mockRequest('GET', endpoint);
    }
  },

  post: async (endpoint, body, isFormData = false) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(isFormData),
        body: isFormData ? body : JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (err) {
      console.warn(`[API] POST ${endpoint} failed. Using mock fallback. Error:`, err);
      return await mockRequest('POST', endpoint, body);
    }
  },

  put: async (endpoint, body) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (err) {
      console.warn(`[API] PUT ${endpoint} failed. Using mock fallback. Error:`, err);
      return await mockRequest('PUT', endpoint, body);
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await handleResponse(response);
    } catch (err) {
      console.warn(`[API] DELETE ${endpoint} failed. Using mock fallback. Error:`, err);
      return await mockRequest('DELETE', endpoint);
    }
  },
};

export default api;
