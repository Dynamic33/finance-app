const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite
} = require('../controllers/favoriteController');

// Favorite routes
router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:symbol', removeFavorite);
router.get('/check/:symbol', isFavorite);

module.exports = router;