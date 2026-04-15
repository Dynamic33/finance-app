import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaHome, FaChartLine, FaSignOutAlt, FaUser, FaCog, FaShieldAlt } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <FaChartLine /> Finance Stock Tracker
          </Link>
          <ul className="navbar-menu">
            <li><Link to="/login" className="nav-link">Login</Link></li>
            <li><Link to="/register" className="nav-link">Register</Link></li>
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FaChartLine /> Finance Stock Tracker
        </Link>
        <ul className="navbar-menu">
          <li><Link to="/" className="nav-link"><FaHome /> Home</Link></li>
          <li><Link to="/portfolio" className="nav-link"><FaChartLine /> Portfolio</Link></li>
          <li><Link to="/transactions" className="nav-link"><FaCog /> History</Link></li>
          <li><Link to="/favorites" className="nav-link"><FaHeart /> Favorites</Link></li>
          {user.role === 'admin' && (
            <li><Link to="/admin" className="nav-link"><FaShieldAlt /> Admin</Link></li>
          )}
          <li className="user-menu">
            <span className="user-label">
              <FaUser /> {user.username}
            </span>
            <div className="user-dropdown">
              <Link to="/account" className="dropdown-item">
                <FaUser /> My Account
              </Link>
              <button className="dropdown-item btn-logout-menu" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;