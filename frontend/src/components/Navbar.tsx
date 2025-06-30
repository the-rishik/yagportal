import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Safe helper functions for user data
  const getUserInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase();
  };

  const getUserDisplayName = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName} ${lastName}`.trim() || user?.email || 'User';
  };

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/bills', label: 'Bills' },
    { to: '/my-bills', label: 'My Bills' },
    { to: '/contact', label: 'Contact' },
  ];

  const advisorItems = [
    { to: '/', label: 'Home' },
    { to: '/contact', label: 'Contact' },
  ];

  const adminItems = [
    { to: '/admin', label: 'Admin Dashboard' },
    { to: '/delegations', label: 'Delegations' },
  ];

  // Determine which navigation items to show based on user role
  let allItems = navItems; // Default for regular users (students)
  if (user?.role === 'advisor') {
    allItems = advisorItems;
  } else if (user?.role === 'admin') {
    // For admins, include all items except "My Bills" plus admin items
    allItems = [
      { to: '/', label: 'Home' },
      { to: '/bills', label: 'Bills' },
      { to: '/contact', label: 'Contact' },
      ...adminItems
    ];
  } else if (user?.role === 'staff') {
    // For staff, include all items except "My Bills"
    allItems = [
      { to: '/', label: 'Home' },
      { to: '/bills', label: 'Bills' },
      { to: '/contact', label: 'Contact' },
    ];
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            <div className="logo-text">
              NJYAG Portal
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-menu desktop-menu">
          {allItems.map((item, index) => (
            <div key={item.to}>
              <Link 
                to={item.to} 
                className="nav-link"
                onClick={closeMenu}
              >
                <span>{item.label}</span>
              </Link>
            </div>
          ))}
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          {user ? (
            <div className="user-menu">
              <Link to="/account" className="user-info" style={{ textDecoration: 'none' }}>
                <div className="user-avatar">
                  <span>{getUserInitials()}</span>
                </div>
                <div className="user-details">
                  <span className="user-name">
                    {getUserDisplayName()}
                  </span>
                  <span className={`badge badge-${user.role}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </Link>
              <button
                className="btn btn-secondary logout-btn"
                onClick={handleLogout}
              >
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div>
              <Link to="/login" className="btn">
                <span>Login</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={toggleMenu}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="mobile-menu-content">
              {allItems.map((item, index) => (
                <div key={item.to}>
                  <Link 
                    to={item.to} 
                    className="mobile-nav-link"
                    onClick={closeMenu}
                  >
                    <span>{item.label}</span>
                  </Link>
                </div>
              ))}
              
              {user && (
                <div className="mobile-user-info">
                  <Link to="/account" className="mobile-user-details" style={{ textDecoration: 'none' }} onClick={closeMenu}>
                    <div className="user-avatar">
                      <span>{getUserInitials()}</span>
                    </div>
                    <div>
                      <span className="user-name">
                        {getUserDisplayName()}
                      </span>
                      <span className={`badge badge-${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  </Link>
                  <button
                    className="btn btn-secondary mobile-logout-btn"
                    onClick={handleLogout}
                  >
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar; 