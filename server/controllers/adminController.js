const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const portfolio = await Portfolio.find({ userId });
    const transactions = await Transaction.find({ userId }).limit(10).sort({ createdAt: -1 });

    res.json({
      user,
      portfolio,
      recentTransactions: transactions
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
};

// Suspend user
exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'suspended' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User suspended successfully',
      user
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ message: 'Error suspending user', error: error.message });
  }
};

// Activate user
exports.activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'active' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User activated successfully',
      user
    });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ message: 'Error activating user', error: error.message });
  }
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 30, type, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });

    const totalTransactions = await Transaction.countDocuments();
    const buyTransactions = await Transaction.countDocuments({ type: 'BUY' });
    const sellTransactions = await Transaction.countDocuments({ type: 'SELL' });

    const users = await User.find();
    const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
    const totalDeposits = users.reduce((sum, user) => sum + user.totalDeposits, 0);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers
      },
      transactions: {
        total: totalTransactions,
        buys: buyTransactions,
        sells: sellTransactions
      },
      financials: {
        totalBalance,
        totalDeposits
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Error getting stats', error: error.message });
  }
};