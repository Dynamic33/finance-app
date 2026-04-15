const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true
    },
    companyName: String,
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    averageBuyPrice: {
      type: Number,
      required: true
    },
    currentPrice: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      required: true
    },
    currentValue: {
      type: Number,
      default: 0
    },
    gainLoss: {
      type: Number,
      default: 0
    },
    gainLossPercent: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound index to ensure unique stock per user
PortfolioSchema.index({ userId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('Portfolio', PortfolioSchema);