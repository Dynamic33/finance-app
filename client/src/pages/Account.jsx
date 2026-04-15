import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { updateProfile, getProfile } from '../services/api';
import { FaUser, FaEnvelope, FaLock, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import './Account.css';

function Account() {
  const { user, logout, fetchUserProfile } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [passwordMode, setPasswordMode] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setFormData({
        username: data.username,
        email: data.email
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
    setSuccess('');
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.email.trim()) {
      setError('Username and email are required');
      return;
    }

    try {
      setSavingProfile(true);
      setError('');
      await updateProfile(formData.username, formData.email);
      await fetchUserProfile();
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      await loadProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData({
      username: profile.username,
      email: profile.email
    });
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      // Note: You need to implement change password endpoint in your backend
      setError('Password change feature coming soon');
      // After successful change:
      // setSuccess('Password changed successfully!');
      // setPasswordMode(false);
      // setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading account...</div>;

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>My Account</h1>
        <p>Manage your profile and settings</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="account-content">
        {/* Profile Section */}
        <div className="account-section">
          <div className="section-header">
            <h2>Profile Information</h2>
            {!editMode && (
              <button className="btn-edit" onClick={handleEditClick}>
                <FaEdit /> Edit Profile
              </button>
            )}
          </div>

          {!editMode ? (
            <div className="profile-display">
              <div className="profile-item">
                <span className="profile-label">
                  <FaUser /> Username
                </span>
                <span className="profile-value">{profile?.username}</span>
              </div>

              <div className="profile-item">
                <span className="profile-label">
                  <FaEnvelope /> Email
                </span>
                <span className="profile-value">{profile?.email}</span>
              </div>

              <div className="profile-item">
                <span className="profile-label">Role</span>
                <span className={`profile-value role-${profile?.role}`}>
                  {profile?.role?.toUpperCase()}
                </span>
              </div>

              <div className="profile-item">
                <span className="profile-label">Account Status</span>
                <span className={`profile-value status-${profile?.status}`}>
                  {profile?.status?.toUpperCase()}
                </span>
              </div>

              <div className="profile-item">
                <span className="profile-label">Member Since</span>
                <span className="profile-value">
                  {new Date(profile?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={savingProfile}>
                  <FaSave /> {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn-cancel-edit" onClick={handleCancelEdit}>
                  <FaTimes /> Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Account Stats Section */}
        <div className="account-section">
          <div className="section-header">
            <h2>Account Statistics</h2>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Current Balance</span>
              <span className="stat-value">${profile?.balance?.toFixed(2)}</span>
            </div>

            <div className="stat-item">
              <span className="stat-label">Total Deposits</span>
              <span className="stat-value">${profile?.totalDeposits?.toFixed(2)}</span>
            </div>

            <div className="stat-item">
              <span className="stat-label">Total Withdrawals</span>
              <span className="stat-value">${profile?.totalWithdrawals?.toFixed(2)}</span>
            </div>

            <div className="stat-item">
              <span className="stat-label">Net Amount</span>
              <span className="stat-value">
                ${(profile?.totalDeposits - profile?.totalWithdrawals).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="account-section">
          <div className="section-header">
            <h2>Security</h2>
          </div>

          {!passwordMode ? (
            <div className="security-display">
              <div className="security-item">
                <div className="security-info">
                  <FaLock className="security-icon" />
                  <div>
                    <p className="security-title">Password</p>
                    <p className="security-desc">Change your account password</p>
                  </div>
                </div>
                <button className="btn-security" onClick={() => setPasswordMode(true)}>
                  Change Password
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="password-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  required
                />
                <small>Must be at least 6 characters</small>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  Update Password
                </button>
                <button 
                  type="button" 
                  className="btn-cancel-edit" 
                  onClick={() => {
                    setPasswordMode(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Danger Zone */}
        <div className="account-section danger-zone">
          <div className="section-header">
            <h2>Danger Zone</h2>
          </div>

          <div className="danger-item">
            <div className="danger-info">
              <p className="danger-title">Sign Out</p>
              <p className="danger-desc">Sign out from your account</p>
            </div>
            <button className="btn-logout" onClick={() => {
              logout();
              window.location.href = '/login';
            }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;