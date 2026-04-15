import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import './StockCard.css';

function StockCard({ stock, isFav, onFavoriteClick }) {
  const priceChange = stock.d;
  const percentChange = stock.dp;
  const isPositive = priceChange >= 0;

  return (
    <div className="stock-card">
      <div className="stock-card-header">
        <Link to={`/stock/${stock.symbol}`} className="stock-link">
          <h3 className="stock-symbol">{stock.symbol}</h3>
          <p className="stock-name">{stock.name || 'Stock'}</p>
        </Link>
        <button
          className="favorite-btn"
          onClick={() => onFavoriteClick(stock.symbol, stock.name)}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFav ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <div className="stock-card-body">
        <div className="stock-price">
          <span className="price">${stock.c ? stock.c.toFixed(2) : 'N/A'}</span>
          <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{priceChange ? priceChange.toFixed(2) : 'N/A'} ({percentChange ? percentChange.toFixed(2) : 'N/A'}%)
          </span>
        </div>
      </div>
    </div>
  );
}

export default StockCard;