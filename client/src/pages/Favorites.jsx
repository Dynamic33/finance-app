import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { getFavorites, removeFavorite, getStockQuote } from '../services/api';
import StockCard from '../components/StockCard';
import './Favorites.css';

function Favorites({ onFavoriteUpdated }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavoritesWithQuotes();
  }, []);

  const fetchFavoritesWithQuotes = async () => {
    try {
      setLoading(true);
      const favData = await getFavorites();

      // Fetch quotes for each favorite
      const favWithQuotes = await Promise.all(
        favData.map(async (fav) => {
          try {
            const quote = await getStockQuote(fav.symbol);
            return { ...fav, ...quote };
          } catch (err) {
            console.error(`Error fetching quote for ${fav.symbol}:`, err);
            return fav;
          }
        })
      );

      setFavorites(favWithQuotes);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (symbol) => {
    try {
      await removeFavorite(symbol);
      setFavorites(favorites.filter(f => f.symbol !== symbol));
      onFavoriteUpdated();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) return <div className="loading">Loading favorites...</div>;

  return (
    <div className="favorites-container">
      <h1>My Favorite Stocks</h1>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <p>No favorites yet. Go back home and add some stocks!</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Browse Stocks
          </button>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((stock) => (
            <div key={stock.symbol} className="favorite-card-wrapper">
              <StockCard
                stock={stock}
                isFav={true}
                onFavoriteClick={() => handleRemoveFavorite(stock.symbol)}
              />
              <button
                className="delete-btn"
                onClick={() => handleRemoveFavorite(stock.symbol)}
                title="Delete favorite"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;