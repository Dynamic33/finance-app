const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAW'],
      required: true
    },
    symbol: {
      type: String,
      uppercase: true
    },
    companyName: String,
    quantity: {
      type: Number,
      min: 0
    },
    price: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed'
    },
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);