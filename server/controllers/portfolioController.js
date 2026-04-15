const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const axios = require('axios');

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Get user portfolio
exports.getUserPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.find({ userId: req.user.id });

    // Fetch current prices
    const portfolioWithPrices = await Promise.all(
      portfolio.map(async (item) => {
        try {
          const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
            params: {
              symbol: item.symbol,
              token: FINNHUB_API_KEY
            }
          });

          const currentPrice = response.data.c || 0;
          const currentValue = currentPrice * item.quantity;
          const gainLoss = currentValue - item.totalCost;
          const gainLossPercent = (gainLoss / item.totalCost) * 100;

          return {
            ...item.toObject(),
            currentPrice,
            currentValue,
            gainLoss,
            gainLossPercent
          };
        } catch (error) {
          console.error(`Error fetching price for ${item.symbol}:`, error);
          return item.toObject();
        }
      })
    );

    res.json(portfolioWithPrices);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Error fetching portfolio', error: error.message });
  }
};

// Buy stock
exports.buyStock = async (req, res) => {
  try {
    const { symbol, quantity, price, companyName } = req.body;
    const userId = req.user.id;

    if (!symbol || !quantity || !price) {
      return res.status(400).json({ message: 'Symbol, quantity, and price are required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const totalCost = quantity * price;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check balance
    if (user.balance < totalCost) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update or create portfolio item
    let portfolio = await Portfolio.findOne({ userId, symbol: symbol.toUpperCase() });

    if (portfolio) {
      // Update existing holding
      const totalQuantity = portfolio.quantity + quantity;
      const newTotalCost = portfolio.totalCost + totalCost;
      portfolio.averageBuyPrice = newTotalCost / totalQuantity;
      portfolio.quantity = totalQuantity;
      portfolio.totalCost = newTotalCost;
      portfolio.currentPrice = price;
      portfolio.currentValue = totalQuantity * price;
    } else {
      // Create new portfolio item
      portfolio = new Portfolio({
        userId,
        symbol: symbol.toUpperCase(),
        companyName,
        quantity,
        averageBuyPrice: price,
        currentPrice: price,
        totalCost,
        currentValue: totalCost
      });
    }

    await portfolio.save();

    // Deduct from user balance
    user.balance -= totalCost;
    await user.save();

    // Create transaction
    const transaction = new Transaction({
      userId,
      type: 'BUY',
      symbol: symbol.toUpperCase(),
      companyName,
      quantity,
      price,
      totalAmount: totalCost,
      balanceAfter: user.balance,
      status: 'completed'
    });

    await transaction.save();

    res.status(201).json({
      message: 'Stock purchased successfully',
      portfolio,
      balanceAfter: user.balance,
      transaction
    });
  } catch (error) {
    console.error('Error buying stock:', error);
    res.status(500).json({ message: 'Error buying stock', error: error.message });
  }
};

// Sell stock
exports.sellStock = async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    const userId = req.user.id;

    if (!symbol || !quantity || !price) {
      return res.status(400).json({ message: 'Symbol, quantity, and price are required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // Get portfolio
    const portfolio = await Portfolio.findOne({ userId, symbol: symbol.toUpperCase() });

    if (!portfolio) {
      return res.status(404).json({ message: 'Stock not found in portfolio' });
    }

    if (portfolio.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity to sell' });
    }

    const totalAmount = quantity * price;

    // Update portfolio
    portfolio.quantity -= quantity;

    if (portfolio.quantity === 0) {
      await Portfolio.deleteOne({ _id: portfolio._id });
    } else {
      portfolio.totalCost = (portfolio.totalCost / (portfolio.quantity + quantity)) * portfolio.quantity;
      await portfolio.save();
    }

    // Add to user balance
    const user = await User.findById(userId);
    user.balance += totalAmount;
    await user.save();

    // Create transaction
    const transaction = new Transaction({
      userId,
      type: 'SELL',
      symbol: symbol.toUpperCase(),
      companyName: portfolio.companyName,
      quantity,
      price,
      totalAmount,
      balanceAfter: user.balance,
      status: 'completed'
    });

    await transaction.save();

    res.json({
      message: 'Stock sold successfully',
      balanceAfter: user.balance,
      transaction
    });
  } catch (error) {
    console.error('Error selling stock:', error);
    res.status(500).json({ message: 'Error selling stock', error: error.message });
  }
};

// Get portfolio summary
exports.getPortfolioSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const portfolio = await Portfolio.find({ userId });
    const user = await User.findById(userId);

    let totalPortfolioValue = 0;
    let totalCostBasis = 0;

    portfolio.forEach(item => {
      totalCostBasis += item.totalCost;
      totalPortfolioValue += item.currentValue || item.totalCost;
    });

    const totalGainLoss = totalPortfolioValue - totalCostBasis;
    const gainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

    res.json({
      balance: user.balance,
      portfolioValue: totalPortfolioValue,
      costBasis: totalCostBasis,
      gainLoss: totalGainLoss,
      gainLossPercent,
      totalValue: user.balance + totalPortfolioValue,
      holdings: portfolio.length
    });
  } catch (error) {
    console.error('Error getting portfolio summary:', error);
    res.status(500).json({ message: 'Error getting portfolio summary', error: error.message });
  }
};