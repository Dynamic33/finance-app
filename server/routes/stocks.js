const express = require('express');
const router = express.Router();
const {
  getStockQuote,
  getCompanyProfile,
  getStockNews,
  searchStocks,
  getMarketStatus
} = require('../controllers/stockController');

// Stock routes
router.get('/quote/:symbol', getStockQuote);
router.get('/profile/:symbol', getCompanyProfile);
router.get('/news/:symbol', getStockNews);
router.get('/search', searchStocks);
router.get('/market/status', getMarketStatus);

module.exports = router;