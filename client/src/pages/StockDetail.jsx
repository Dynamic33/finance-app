import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHeart, FaRegHeart } from 'react-icons/fa';
import {
  getStockQuote,
  getCompanyProfile,
  getStockNews,
  addFavorite,
  removeFavorite,
  isFavorite
} from '../services/api';
import './StockDetail.css';

function StockDetail({ onFavoriteUpdated }) {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [profile, setProfile] = useState(null);
  const [news, setNews] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quoteData, profileData, newsData, favStatus] = await Promise.all([
          getStockQuote(symbol),
          getCompanyProfile(symbol),
          getStockNews(symbol),
          isFavorite(symbol)
        ]);

        setQuote(quoteData);
        setProfile(profileData);
        setNews(newsData.slice(0, 5));
        setIsFav(favStatus.isFavorite);
      } catch (err) {
        setError('Error loading stock details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  const handleFavoriteClick = async () => {
    try {
      if (isFav) {
        await removeFavorite(symbol);
      } else {
        await addFavorite(symbol, profile?.name || symbol);
      }
      setIsFav(!isFav);
      onFavoriteUpdated();
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  if (loading) return <div className="loading">Loading stock details...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const priceChange = quote?.d || 0;
  const percentChange = quote?.dp || 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="stock-detail">
      <button className="back-btn" onClick={() => navigate('/')}>
        <FaArrowLeft /> Back to Home
      </button>

      <div className="detail-header">
        <div>
          <h1>{symbol}</h1>
          <p>{profile?.name}</p>
        </div>
        <button className="favorite-btn" onClick={handleFavoriteClick}>
          {isFav ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <div className="price-section">
        <div className="current-price">
          <span className="price">${quote?.c?.toFixed(2) || 'N/A'}</span>
          <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{priceChange?.toFixed(2) || 'N/A'} ({percentChange?.toFixed(2) || 'N/A'}%)
          </span>
        </div>

        <div className="price-details">
          <div className="detail-item">
            <span className="label">High</span>
            <span className="value">${quote?.h?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Low</span>
            <span className="value">${quote?.l?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Open</span>
            <span className="value">${quote?.o?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Previous Close</span>
            <span className="value">${quote?.pc?.toFixed(2) || 'N/A'}</span>
          </div>
        </div>
      </div>

      {profile && (
        <div className="company-info">
          <h2>Company Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Industry</span>
              <span className="value">{profile?.finnhubIndustry || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="label">Market Cap</span>
              <span className="value">{profile?.marketCapitalization ? `$${(profile.marketCapitalization / 1e9).toFixed(2)}B` : 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="label">Website</span>
              <span className="value">
                {profile?.weburl ? (
                  <a href={profile.weburl} target="_blank" rel="noopener noreferrer">
                    Visit →
                  </a>
                ) : (
                  'N/A'
                )}
              </span>
            </div>
            <div className="info-item">
              <span className="label">CEO</span>
              <span className="value">{profile?.ceo || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {news.length > 0 && (
        <div className="news-section">
          <h2>Latest News</h2>
          <div className="news-list">
            {news.map((article, index) => (
              <div key={index} className="news-item">
                {article.image && (
                  <img src={article.image} alt={article.headline} className="news-image" />
                )}
                <div className="news-content">
                  <h3>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      {article.headline}
                    </a>
                  </h3>
                  <p>{article.summary}</p>
                  <small>{new Date(article.datetime * 1000).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StockDetail;