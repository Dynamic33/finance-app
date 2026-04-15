const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getUserTransactions,
  getTransactionStats,
  depositFunds,
  withdrawFunds
} = require('../controllers/transactionController');

router.get('/', authMiddleware, getUserTransactions);
router.get('/stats', authMiddleware, getTransactionStats);
router.post('/deposit', authMiddleware, depositFunds);
router.post('/withdraw', authMiddleware, withdrawFunds);

module.exports = router;