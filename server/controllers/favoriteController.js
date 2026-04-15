const Favorite = require('../models/Favorite');

// Get All Favorites
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find().sort({ addedAt: -1 });
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error.message);
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
};

// Add Favorite
exports.addFavorite = async (req, res) => {
  try {
    const { symbol, name, description } = req.body;

    if (!symbol || !name) {
      return res.status(400).json({ message: 'Symbol and name are required' });
    }

    // Check if already exists
    const existing = await Favorite.findOne({ symbol: symbol.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Stock already in favorites' });
    }

    const favorite = new Favorite({
      symbol: symbol.toUpperCase(),
      name,
      description
    });

    await favorite.save();
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Error adding favorite:', error.message);
    res.status(500).json({ message: 'Error adding favorite', error: error.message });
  }
};

// Remove Favorite
exports.removeFavorite = async (req, res) => {
  try {
    const { symbol } = req.params;

    const result = await Favorite.findOneAndDelete({ symbol: symbol.toUpperCase() });
    
    if (!result) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Error removing favorite:', error.message);
    res.status(500).json({ message: 'Error removing favorite', error: error.message });
  }
};

// Check if Stock is Favorite
exports.isFavorite = async (req, res) => {
  try {
    const { symbol } = req.params;

    const favorite = await Favorite.findOne({ symbol: symbol.toUpperCase() });
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Error checking favorite:', error.message);
    res.status(500).json({ message: 'Error checking favorite', error: error.message });
  }
};