const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getUserPortfolio,
  buyStock,
  sellStock,
  getPortfolioSummary
} = require('../controllers/portfolioController');

router.get('/', authMiddleware, getUserPortfolio);
router.post('/buy', authMiddleware, buyStock);
router.post('/sell', authMiddleware, sellStock);
router.get('/summary', authMiddleware, getPortfolioSummary);

module.exports = router;