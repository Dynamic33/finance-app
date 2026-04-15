import React, { useState, useEffect } from 'react';
import { getTransactions, depositFunds, withdrawFunds } from '../services/api';
import './TransactionHistory.css';

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    loadTransactions();
  }, [page, typeFilter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions(page, 20, typeFilter);
      setTransactions(data.transactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      await depositFunds(parseFloat(amount));
      setShowDepositModal(false);
      setAmount('');
      await loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      await withdrawFunds(parseFloat(amount));
      setShowWithdrawModal(false);
      setAmount('');
      await loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading transactions...</div>;

  return (
    <div className="transactions-container">
      <h1>Transaction History</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="transactions-header">
        <div className="filters">
          <select value={typeFilter} onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}>
            <option value="">All Transactions</option>
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAW">Withdraw</option>
          </select>
        </div>

        <div className="action-buttons">
          <button className="btn-deposit" onClick={() => setShowDepositModal(true)}>Deposit Funds</button>
          <button className="btn-withdraw" onClick={() => setShowWithdrawModal(true)}>Withdraw Funds</button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <p>No transactions yet</p>
        </div>
      ) : (
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Symbol</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Amount</th>
                <th>Balance After</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx._id}>
                  <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td><span className={`badge ${tx.type.toLowerCase()}`}>{tx.type}</span></td>
                  <td>{tx.symbol || '-'}</td>
                  <td>{tx.quantity || '-'}</td>
                  <td>${tx.price?.toFixed(2)}</td>
                  <td>${tx.totalAmount?.toFixed(2)}</td>
                  <td>${tx.balanceAfter?.toFixed(2)}</td>
                  <td><span className={`status ${tx.status.toLowerCase()}`}>{tx.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Deposit Funds</h2>
            <form onSubmit={handleDeposit}>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                />
              </div>
              <button type="submit" className="btn-confirm">Deposit</button>
              <button type="button" className="btn-cancel" onClick={() => setShowDepositModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Withdraw Funds</h2>
            <form onSubmit={handleWithdraw}>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                />
              </div>
              <button type="submit" className="btn-confirm">Withdraw</button>
              <button type="button" className="btn-cancel" onClick={() => setShowWithdrawModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;