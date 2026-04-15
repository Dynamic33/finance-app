import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {stats && (
        <div className="admin-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.users?.total || 0}</p>
              <span className="stat-label">Active: {stats.users?.active || 0}</span>
            </div>

            <div className="stat-card">
              <h3>Suspended Users</h3>
              <p className="stat-number">{stats.users?.suspended || 0}</p>
            </div>

            <div className="stat-card">
              <h3>Total Transactions</h3>
              <p className="stat-number">{stats.transactions?.total || 0}</p>
              <span className="stat-label">Buys: {stats.transactions?.buys || 0} | Sells: {stats.transactions?.sells || 0}</span>
            </div>

            <div className="stat-card">
              <h3>Total Balance</h3>
              <p className="stat-number">${stats.financials?.totalBalance?.toFixed(2) || '0.00'}</p>
            </div>

            <div className="stat-card">
              <h3>Total Deposits</h3>
              <p className="stat-number">${stats.financials?.totalDeposits?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="admin-actions">
        <Link to="/admin/users" className="btn-admin">Manage Users</Link>
        <Link to="/admin/transactions" className="btn-admin">View Transactions</Link>
      </div>
    </div>
  );
}

export default AdminDashboard;