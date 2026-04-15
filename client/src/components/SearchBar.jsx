import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { searchStocks } from '../services/api';
import './SearchBar.css';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    setQuery(e.target.value);

    if (e.target.value.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await searchStocks(e.target.value);
      setResults(data.slice(0, 5));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStock = (symbol) => {
    onSearch(symbol);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search stocks (e.g., AAPL, GOOGL, MSFT)..."
          value={query}
          onChange={handleSearch}
          className="search-input"
        />
      </div>
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((stock) => (
            <li key={stock.symbol} onClick={() => handleSelectStock(stock.symbol)}>
              <span className="stock-symbol">{stock.symbol}</span>
              <span className="stock-name">{stock.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;