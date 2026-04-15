const axios = require('axios');

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Get Stock Quote
exports.getStockQuote = async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({ message: 'Symbol is required' });
    }

    const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
      params: {
        symbol: symbol.toUpperCase(),
        token: FINNHUB_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching stock quote:', error.message);
    res.status(500).json({ message: 'Error fetching stock data', error: error.message });
  }
};

// Get Company Profile
exports.getCompanyProfile = async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({ message: 'Symbol is required' });
    }

    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/profile2`, {
      params: {
        symbol: symbol.toUpperCase(),
        token: FINNHUB_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching company profile:', error.message);
    res.status(500).json({ message: 'Error fetching company profile', error: error.message });
  }
};

// Get Stock News
exports.getStockNews = async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({ message: 'Symbol is required' });
    }

    const response = await axios.get(`${FINNHUB_BASE_URL}/company-news`, {
      params: {
        symbol: symbol.toUpperCase(),
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
        token: FINNHUB_API_KEY
      }
    });

    res.json(response.data || []);
  } catch (error) {
    console.error('Error fetching stock news:', error.message);
    res.status(500).json({ message: 'Error fetching news', error: error.message });
  }
};

// Search Stocks
exports.searchStocks = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters' });
    }

    const response = await axios.get(`${FINNHUB_BASE_URL}/search`, {
      params: {
        q: query,
        token: FINNHUB_API_KEY
      }
    });

    const results = response.data.result || [];
    res.json(results.slice(0, 10));
  } catch (error) {
    console.error('Error searching stocks:', error.message);
    res.status(500).json({ message: 'Error searching stocks', error: error.message });
  }
};

// Get Market Status
exports.getMarketStatus = async (req, res) => {
  try {
    const response = await axios.get(`${FINNHUB_BASE_URL}/marketstatus`, {
      params: {
        exchange: 'US',
        token: FINNHUB_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching market status:', error.message);
    res.status(500).json({ message: 'Error fetching market status', error: error.message });
  }
};