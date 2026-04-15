import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import StockCard from '../components/StockCard';
import { getStockQuote, addFavorite, removeFavorite, isFavorite } from '../services/api';
import './Home.css';

function Home({ onFavoriteUpdated }) {
  const [stock, setStock] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (symbol) => {
    setLoading(true);
    setError('');
    try {
      const data = await getStockQuote(symbol);
      setStock({ ...data, symbol });
      
      // Check if it's a favorite
      const favStatus = await isFavorite(symbol);
      setIsFav(favStatus.isFavorite);
    } catch (err) {
      setError('Error fetching stock data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = async (symbol, name) => {
    try {
      if (isFav) {
        await removeFavorite(symbol);
      } else {
        await addFavorite(symbol, name);
      }
      setIsFav(!isFav);
      onFavoriteUpdated();
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Stock Market Tracker</h1>
        <p>Real-time stock prices powered by Finnhub API</p>
      </div>

      <SearchBar onSearch={handleSearch} />

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {stock && (
        <div className="stock-display">
          <StockCard
            stock={stock}
            isFav={isFav}
            onFavoriteClick={handleFavoriteClick}
          />
          <button
            className="view-details-btn"
            onClick={() => navigate(`/stock/${stock.symbol}`)}
          >
            View Details →
          </button>
        </div>
      )}

      {!stock && !loading && (
        <div className="welcome-message">
          <p>Search for a stock symbol to get started</p>
        </div>
      )}
    </div>
  );
}

export default Home;