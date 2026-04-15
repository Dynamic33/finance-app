import React, { useState, useEffect } from 'react';
import { getAllTransactions } from '../services/api';
import './AdminTransactions.css';

function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadTransactions();
  }, [page, typeFilter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getAllTransactions(page, 30, typeFilter);
      setTransactions(data.transactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading transactions...</div>;

  return (
    <div className="admin-transactions">
      <h1>All Transactions</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="transactions-filter">
        <select value={typeFilter} onChange={(e) => {
          setTypeFilter(e.target.value);
          setPage(1);
        }}>
          <option value="">All Types</option>
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
          <option value="DEPOSIT">Deposit</option>
          <option value="WITHDRAW">Withdraw</option>
        </select>
      </div>

      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Type</th>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx._id}>
                <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                <td>{tx.userId?.username || '-'}</td>
                <td><span className={`badge ${tx.type.toLowerCase()}`}>{tx.type}</span></td>
                <td>{tx.symbol || '-'}</td>
                <td>{tx.quantity || '-'}</td>
                <td>${tx.price?.toFixed(2)}</td>
                <td>${tx.totalAmount?.toFixed(2)}</td>
                <td><span className={`status ${tx.status.toLowerCase()}`}>{tx.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminTransactions;