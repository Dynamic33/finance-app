const Transaction = require('../models/Transaction');

exports.getUserTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.id };

    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
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

exports.getTransactionStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Transaction.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Error getting transaction stats:', error);
    res.status(500).json({ message: 'Error getting stats', error: error.message });
  }
};

exports.depositFunds = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.balance += amount;
    user.totalDeposits += amount;
    await user.save();

    const transaction = new Transaction({
      userId: req.user.id,
      type: 'DEPOSIT',
      price: amount,
      totalAmount: amount,
      balanceAfter: user.balance,
      status: 'completed',
      description: 'Funds deposited'
    });

    await transaction.save();

    res.json({
      message: 'Funds deposited successfully',
      balanceAfter: user.balance,
      transaction
    });
  } catch (error) {
    console.error('Error depositing funds:', error);
    res.status(500).json({ message: 'Error depositing funds', error: error.message });
  }
};

exports.withdrawFunds = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    user.balance -= amount;
    user.totalWithdrawals += amount;
    await user.save();

    const transaction = new Transaction({
      userId: req.user.id,
      type: 'WITHDRAW',
      price: amount,
      totalAmount: amount,
      balanceAfter: user.balance,
      status: 'completed',
      description: 'Funds withdrawn'
    });

    await transaction.save();

    res.json({
      message: 'Funds withdrawn successfully',
      balanceAfter: user.balance,
      transaction
    });
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    res.status(500).json({ message: 'Error withdrawing funds', error: error.message });
  }
};