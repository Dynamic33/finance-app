const API_URL = process.env.REACT_APP_API_URL;

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() && { Authorization: `Bearer ${getToken()}` })
});

// ==================== AUTH SERVICES ====================
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  return await response.json();
};

export const register = async (username, email, password, confirmPassword) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, confirmPassword })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }
  return await response.json();
};

export const getProfile = async () => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: headers()
  });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return await response.json();
};

export const updateProfile = async (username, email) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ username, email })
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return await response.json();
};

// ==================== STOCK SERVICES ====================
export const getStockQuote = async (symbol) => {
  try {
    const response = await fetch(`${API_URL}/stocks/quote/${symbol}`);
    if (!response.ok) throw new Error('Failed to fetch quote');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getCompanyProfile = async (symbol) => {
  try {
    const response = await fetch(`${API_URL}/stocks/profile/${symbol}`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getStockNews = async (symbol) => {
  try {
    const response = await fetch(`${API_URL}/stocks/news/${symbol}`);
    if (!response.ok) throw new Error('Failed to fetch news');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const searchStocks = async (query) => {
  try {
    const response = await fetch(`${API_URL}/stocks/search?query=${query}`);
    if (!response.ok) throw new Error('Failed to search stocks');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getMarketStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/stocks/market/status`);
    if (!response.ok) throw new Error('Failed to fetch market status');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// ==================== FAVORITES SERVICES ====================
export const getFavorites = async () => {
  try {
    const response = await fetch(`${API_URL}/favorites`, {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch favorites');
    return await response.json();
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

export const addFavorite = async (symbol, name, description = '') => {
  try {
    const response = await fetch(`${API_URL}/favorites`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ symbol, name, description })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add favorite');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

export const removeFavorite = async (symbol) => {
  try {
    const response = await fetch(`${API_URL}/favorites/${symbol}`, {
      method: 'DELETE',
      headers: headers()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove favorite');
    }
    return await response.json();
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

export const isFavorite = async (symbol) => {
  try {
    const response = await fetch(`${API_URL}/favorites/check/${symbol}`, {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to check favorite');
    return await response.json();
  } catch (error) {
    console.error('Error checking favorite:', error);
    throw error;
  }
};

// ==================== PORTFOLIO SERVICES ====================
export const getPortfolio = async () => {
  try {
    const response = await fetch(`${API_URL}/portfolio`, {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    return await response.json();
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    throw error;
  }
};

export const getPortfolioSummary = async () => {
  try {
    const response = await fetch(`${API_URL}/portfolio/summary`, {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch summary');
    return await response.json();
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    throw error;
  }
};

export const buyStock = async (symbol, quantity, price, companyName) => {
  try {
    const response = await fetch(`${API_URL}/portfolio/buy`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ symbol, quantity, price, companyName })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to buy stock');
    }
    return await response.json();
  } catch (error) {
    console.error('Error buying stock:', error);
    throw error;
  }
};

export const sellStock = async (symbol, quantity, price) => {
  try {
    const response = await fetch(`${API_URL}/portfolio/sell`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ symbol, quantity, price })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sell stock');
    }
    return await response.json();
  } catch (error) {
    console.error('Error selling stock:', error);
    throw error;
  }
};

// ==================== TRANSACTION SERVICES ====================
export const getTransactions = async (page = 1, limit = 20, type = '') => {
  try {
    const url = new URL(`${API_URL}/transactions`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    if (type) url.searchParams.append('type', type);

    const response = await fetch(url, { headers: headers() });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const getTransactionStats = async () => {
  try {
    const response = await fetch(`${API_URL}/transactions/stats`, {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    throw error;
  }
};

export const depositFunds = async (amount) => {
  try {
    const response = await fetch(`${API_URL}/transactions/deposit`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ amount })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to deposit funds');
    }
    return await response.json();
  } catch (error) {
    console.error('Error depositing funds:', error);
    throw error;
  }
};

export const withdrawFunds = async (amount) => {
  try {
    const response = await fetch(`${API_URL}/transactions/withdraw`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ amount })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to withdraw funds');
    }
    return await response.json();
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    throw error;
  }
};

// ==================== ADMIN SERVICES ====================
export const getAllUsers = async (page = 1, limit = 20, status = '') => {
  try {
    const url = new URL(`${API_URL}/admin/users`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    if (status) url.searchParams.append('status', status);

    const response = await fetch(url, { headers: headers() });
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserDetails = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch user details');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

export const suspendUser = async (userId, reason) => {
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}/suspend`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ reason })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to suspend user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error suspending user:', error);
    throw error;
  }
};

export const activateUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}/activate`, {
      method: 'PUT',
      headers: headers()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to activate user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error activating user:', error);
    throw error;
  }
};

export const getAllTransactions = async (page = 1, limit = 30, type = '', status = '') => {
  try {
    const url = new URL(`${API_URL}/admin/transactions`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    if (type) url.searchParams.append('type', type);
    if (status) url.searchParams.append('status', status);

    const response = await fetch(url, { headers: headers() });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// ==================== EXPORT ALL ====================
export default {
  // Auth
  login,
  register,
  getProfile,
  updateProfile,
  // Stocks
  getStockQuote,
  getCompanyProfile,
  getStockNews,
  searchStocks,
  getMarketStatus,
  // Favorites
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  // Portfolio
  getPortfolio,
  getPortfolioSummary,
  buyStock,
  sellStock,
  // Transactions
  getTransactions,
  getTransactionStats,
  depositFunds,
  withdrawFunds,
  // Admin
  getAllUsers,
  getUserDetails,
  suspendUser,
  activateUser,
  getAllTransactions,
  getDashboardStats
};