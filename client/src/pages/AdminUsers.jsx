import React, { useState, useEffect } from 'react';
import { getAllUsers, suspendUser, activateUser, getUserDetails } from '../services/api';
import './AdminUsers.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers(page, 20, statusFilter);
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const data = await getUserDetails(userId);
      setSelectedUser(data);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSuspend = async (userId) => {
    if (window.confirm('Are you sure you want to suspend this user?')) {
      try {
        await suspendUser(userId, 'Suspended by admin');
        await loadUsers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleActivate = async (userId) => {
    try {
      await activateUser(userId);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="admin-users">
      <h1>Manage Users</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="users-filter">
        <select value={statusFilter} onChange={(e) => {
          setStatusFilter(e.target.value);
          setPage(1);
        }}>
          <option value="">All Users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td><span className={`badge ${user.role}`}>{user.role}</span></td>
                <td>${user.balance?.toFixed(2)}</td>
                <td><span className={`status ${user.status}`}>{user.status}</span></td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn-view" onClick={() => handleViewDetails(user._id)}>View</button>
                  {user.status === 'active' ? (
                    <button className="btn-suspend" onClick={() => handleSuspend(user._id)}>Suspend</button>
                  ) : (
                    <button className="btn-activate" onClick={() => handleActivate(user._id)}>Activate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedUser.user?.username}</h2>
            <div className="user-details">
              <p><strong>Email:</strong> {selectedUser.user?.email}</p>
              <p><strong>Balance:</strong> ${selectedUser.user?.balance?.toFixed(2)}</p>
              <p><strong>Total Deposits:</strong> ${selectedUser.user?.totalDeposits?.toFixed(2)}</p>
              <p><strong>Role:</strong> {selectedUser.user?.role}</p>
              <p><strong>Status:</strong> {selectedUser.user?.status}</p>

              <h3>Portfolio</h3>
              {selectedUser.portfolio?.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Quantity</th>
                      <th>Avg Price</th>
                      <th>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.portfolio.map(item => (
                      <tr key={item._id}>
                        <td>{item.symbol}</td>
                        <td>{item.quantity}</td>
                        <td>${item.averageBuyPrice?.toFixed(2)}</td>
                        <td>${item.totalCost?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No portfolio items</p>
              )}
            </div>
            <button onClick={() => setShowDetailModal(false)} className="btn-close">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;