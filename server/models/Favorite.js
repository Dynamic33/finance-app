const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Favorite', FavoriteSchema);