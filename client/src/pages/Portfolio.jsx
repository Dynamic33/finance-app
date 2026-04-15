import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getPortfolio, getPortfolioSummary, buyStock, sellStock, getStockQuote } from '../services/api';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import './Portfolio.css';

function Portfolio() {
  const { user, fetchUserProfile } = useContext(AuthContext);
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [buyForm, setBuyForm] = useState({ symbol: '', quantity: 1, price: 0, companyName: '' });
  const [sellForm, setSellForm] = useState({ quantity: 1, price: 0 });
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch portfolio
      const portfolioData = await getPortfolio();
      console.log('Portfolio data:', portfolioData);
      setPortfolio(portfolioData || []);

      // Fetch summary
      const summaryData = await getPortfolioSummary();
      console.log('Summary data:', summaryData);
      setSummary(summaryData);

      setLoading(false);
    } catch (err) {
      console.error('Error loading portfolio:', err);
      setError(err.message || 'Failed to load portfolio. Please try again.');
      setLoading(false);
      
      // Set default values if fetch fails
      setPortfolio([]);
      setSummary({
        balance: 0,
        portfolioValue: 0,
        totalValue: 0,
        gainLoss: 0,
        gainLossPercent: 0
      });
    }
  };

  // Handle symbol input change and auto-fetch price
  const handleSymbolChange = async (e) => {
    const symbol = e.target.value.toUpperCase();
    setBuyForm({ ...buyForm, symbol });
    setPriceError('');

    if (symbol.length < 1) {
      setBuyForm(prev => ({ ...prev, price: 0, companyName: '' }));
      return;
    }

    setFetchingPrice(true);
    try {
      const quote = await getStockQuote(symbol);
      console.log('Quote data:', quote);
      
      if (quote && quote.c) {
        setBuyForm(prev => ({
          ...prev,
          price: quote.c,
          companyName: symbol
        }));
        setPriceError('');
      } else {
        setPriceError('Could not fetch price for this symbol. Please check the symbol and try again.');
        setBuyForm(prev => ({ ...prev, price: 0 }));
      }
    } catch (err) {
      console.error('Error fetching price:', err);
      setPriceError(`Error fetching price: ${err.message}`);
      setBuyForm(prev => ({ ...prev, price: 0 }));
    } finally {
      setFetchingPrice(false);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const quantity = parseInt(e.target.value) || 0;
    setBuyForm(prev => ({ ...prev, quantity }));
  };

  // Calculate total cost
  const totalBuyCost = buyForm.quantity * buyForm.price;
  const canAfford = summary && summary.balance >= totalBuyCost;

  const handleBuyStock = async (e) => {
    e.preventDefault();
    
    if (!buyForm.symbol) {
      setPriceError('Please enter a stock symbol');
      return;
    }

    if (buyForm.quantity <= 0) {
      setPriceError('Quantity must be greater than 0');
      return;
    }

    if (buyForm.price <= 0) {
      setPriceError('Price must be greater than 0');
      return;
    }

    if (!canAfford) {
      setPriceError(`Insufficient balance. You need $${totalBuyCost.toFixed(2)} but have $${summary.balance.toFixed(2)}`);
      return;
    }

    try {
      setLoadingPortfolio(true);
      console.log('Buying stock:', { symbol: buyForm.symbol, quantity: buyForm.quantity, price: buyForm.price });
      
      await buyStock(buyForm.symbol, buyForm.quantity, buyForm.price, buyForm.companyName);
      
      setShowBuyModal(false);
      setBuyForm({ symbol: '', quantity: 1, price: 0, companyName: '' });
      setPriceError('');
      
      // Reload data
      await loadPortfolioData();
      await fetchUserProfile();
      
      setError('');
    } catch (err) {
      console.error('Error buying stock:', err);
      setPriceError(err.message || 'Failed to buy stock. Please try again.');
    } finally {
      setLoadingPortfolio(false);
    }
  };

  // Handle sell form - auto-fetch price
  const handleOpenSell = async (stock) => {
    setSelectedStock(stock);
    setError('');
    setPriceError('');
    
    try {
      setFetchingPrice(true);
      const quote = await getStockQuote(stock.symbol);
      setSellForm({ 
        quantity: 1, 
        price: quote.c || stock.currentPrice || stock.averageBuyPrice
      });
    } catch (err) {
      console.error('Error fetching sell price:', err);
      setSellForm({ quantity: 1, price: stock.currentPrice || stock.averageBuyPrice });
    } finally {
      setFetchingPrice(false);
    }
    setShowSellModal(true);
  };

  // Handle quantity change in sell form
  const handleSellQuantityChange = (e) => {
    const quantity = parseInt(e.target.value) || 0;
    setSellForm(prev => ({ ...prev, quantity }));
  };

  // Calculate total return from sell
  const totalSellReturn = sellForm.quantity * sellForm.price;

  const handleSellStock = async (e) => {
    e.preventDefault();

    if (sellForm.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (sellForm.quantity > selectedStock.quantity) {
      setError(`Cannot sell more than ${selectedStock.quantity} shares`);
      return;
    }

    try {
      setLoadingPortfolio(true);
      console.log('Selling stock:', { symbol: selectedStock.symbol, quantity: sellForm.quantity, price: sellForm.price });
      
      await sellStock(selectedStock.symbol, sellForm.quantity, sellForm.price);
      
      setShowSellModal(false);
      setSellForm({ quantity: 1, price: 0 });
      setSelectedStock(null);
      setError('');
      
      // Reload data
      await loadPortfolioData();
      await fetchUserProfile();
    } catch (err) {
      console.error('Error selling stock:', err);
      setError(err.message || 'Failed to sell stock. Please try again.');
    } finally {
      setLoadingPortfolio(false);
    }
  };

  const handleOpenBuy = () => {
    setBuyForm({ symbol: '', quantity: 1, price: 0, companyName: '' });
    setPriceError('');
    setError('');
    setShowBuyModal(true);
  };

  if (loading) {
    return (
      <div className="portfolio-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-container">
      <h1>My Portfolio</h1>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      {summary && (
        <div className="portfolio-summary">
          <div className="summary-card">
            <span className="label">Balance</span>
            <span className="value">${(summary.balance || 0).toFixed(2)}</span>
          </div>
          <div className="summary-card">
            <span className="label">Portfolio Value</span>
            <span className="value">${(summary.portfolioValue || 0).toFixed(2)}</span>
          </div>
          <div className="summary-card">
            <span className="label">Total Value</span>
            <span className="value">${(summary.totalValue || 0).toFixed(2)}</span>
          </div>
          <div className={`summary-card ${(summary.gainLoss || 0) >= 0 ? 'gain' : 'loss'}`}>
            <span className="label">Gain/Loss</span>
            <span className="value">${(summary.gainLoss || 0).toFixed(2)} ({(summary.gainLossPercent || 0).toFixed(2)}%)</span>
          </div>
        </div>
      )}

      <div className="portfolio-actions">
        <button className="btn-buy" onClick={handleOpenBuy}>
          <FaPlus /> Buy Stock
        </button>
        <button className="btn-refresh" onClick={loadPortfolioData}>
          Refresh
        </button>
      </div>

      {portfolio.length === 0 ? (
        <div className="empty-state">
          <p>No stocks in your portfolio yet. Start investing!</p>
          <button className="btn-buy-empty" onClick={handleOpenBuy}>
            <FaPlus /> Buy Your First Stock
          </button>
        </div>
      ) : (
        <div className="portfolio-table">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company</th>
                <th>Quantity</th>
                <th>Avg Buy Price</th>
                <th>Current Price</th>
                <th>Total Cost</th>
                <th>Current Value</th>
                <th>Gain/Loss</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map(stock => (
                <tr key={stock._id}>
                  <td className="symbol">{stock.symbol}</td>
                  <td>{stock.companyName || '-'}</td>
                  <td>{stock.quantity}</td>
                  <td>${(stock.averageBuyPrice || 0).toFixed(2)}</td>
                  <td>${(stock.currentPrice || 0).toFixed(2)}</td>
                  <td>${(stock.totalCost || 0).toFixed(2)}</td>
                  <td>${(stock.currentValue || 0).toFixed(2)}</td>
                  <td className={(stock.gainLoss || 0) >= 0 ? 'positive' : 'negative'}>
                    ${(stock.gainLoss || 0).toFixed(2)} ({(stock.gainLossPercent || 0).toFixed(2)}%)
                  </td>
                  <td>
                    <button
                      className="btn-sell"
                      onClick={() => handleOpenSell(stock)}
                    >
                      <FaMinus /> Sell
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="modal-overlay" onClick={() => setShowBuyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Buy Stock</h2>
            {priceError && <div className="error-message">{priceError}</div>}
            
            <form onSubmit={handleBuyStock}>
              <div className="form-group">
                <label>Stock Symbol *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={buyForm.symbol}
                    onChange={handleSymbolChange}
                    placeholder="e.g., AAPL, GOOGL, MSFT"
                    disabled={fetchingPrice}
                    required
                    maxLength="5"
                  />
                  {fetchingPrice && <span className="loading-indicator">Fetching price...</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Current Price</label>
                <input
                  type="text"
                  value={buyForm.price > 0 ? `$${buyForm.price.toFixed(2)}` : 'N/A'}
                  disabled
                  className="price-display"
                />
                <small>Auto-fetched from Finnhub</small>
              </div>

              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={buyForm.quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  required
                  placeholder="Number of shares"
                />
              </div>

              <div className="form-summary">
                <div className="summary-item">
                  <span>Price per Share:</span>
                  <span>${buyForm.price.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Quantity:</span>
                  <span>{buyForm.quantity} shares</span>
                </div>
                <div className="summary-item total">
                  <span>Total Cost:</span>
                  <span className={canAfford ? 'can-afford' : 'cannot-afford'}>
                    ${totalBuyCost.toFixed(2)}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Available Balance:</span>
                  <span>${(summary?.balance || 0).toFixed(2)}</span>
                </div>
                {!canAfford && (
                  <div className="warning-text">
                    ⚠️ Insufficient balance to complete this purchase
                  </div>
                )}
              </div>

              <div className="button-group">
                <button 
                  type="submit" 
                  className="btn-confirm"
                  disabled={fetchingPrice || !canAfford || loadingPortfolio || buyForm.price <= 0}
                >
                  {loadingPortfolio ? 'Processing...' : 'Buy Now'}
                </button>
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowBuyModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && selectedStock && (
        <div className="modal-overlay" onClick={() => setShowSellModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Sell {selectedStock.symbol}</h2>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSellStock}>
              <div className="form-group">
                <label>Stock Symbol</label>
                <input
                  type="text"
                  value={selectedStock.symbol}
                  disabled
                  className="price-display"
                />
              </div>

              <div className="form-group">
                <label>Current Market Price</label>
                <input
                  type="text"
                  value={`$${sellForm.price.toFixed(2)}`}
                  disabled
                  className="price-display"
                />
                <small>Auto-fetched from Finnhub</small>
              </div>

              <div className="form-group">
                <label>Quantity to Sell *</label>
                <input
                  type="number"
                  value={sellForm.quantity}
                  onChange={handleSellQuantityChange}
                  min="1"
                  max={selectedStock.quantity}
                  required
                  placeholder="Number of shares"
                />
                <small>Available: {selectedStock.quantity} shares</small>
              </div>

              <div className="form-summary">
                <div className="summary-item">
                  <span>Market Price per Share:</span>
                  <span>${sellForm.price.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Quantity to Sell:</span>
                  <span>{sellForm.quantity} shares</span>
                </div>
                <div className="summary-item total">
                  <span>Total Return:</span>
                  <span className="gain">${totalSellReturn.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Cost Basis:</span>
                  <span>${(selectedStock.averageBuyPrice * sellForm.quantity).toFixed(2)}</span>
                </div>
                <div className="summary-item profit">
                  <span>Profit/Loss:</span>
                  <span className={(totalSellReturn - (selectedStock.averageBuyPrice * sellForm.quantity)) >= 0 ? 'gain' : 'loss'}>
                    ${(totalSellReturn - (selectedStock.averageBuyPrice * sellForm.quantity)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="button-group">
                <button 
                  type="submit" 
                  className="btn-confirm"
                  disabled={fetchingPrice || loadingPortfolio}
                >
                  {loadingPortfolio ? 'Processing...' : 'Sell Now'}
                </button>
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowSellModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;