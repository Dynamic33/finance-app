const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  getAllUsers,
  getUserDetails,
  suspendUser,
  activateUser,
  getAllTransactions,
  getDashboardStats
} = require('../controllers/adminController');

router.use(authMiddleware, adminMiddleware);

router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId/suspend', suspendUser);
router.put('/users/:userId/activate', activateUser);
router.get('/transactions', getAllTransactions);
router.get('/stats', getDashboardStats);

module.exports = router;