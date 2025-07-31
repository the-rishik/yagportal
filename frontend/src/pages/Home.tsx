import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import EditSchoolModal from '../components/EditSchoolModal';
import DateCounter from '../components/DateCounter';
import { School } from '../types';
import './Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState<{ activeBills: number; registeredUsers: number; schools: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    // Check for success message from navigation
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (user?.role === 'advisor') {
      loadSchoolStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setStatsLoading(true);
      apiService.get<{ activeBills: number; registeredUsers: number; schools: number }>('/stats')
        .then(setStats)
        .catch(() => setStatsError('Failed to load stats'))
        .finally(() => setStatsLoading(false));
    }
  }, [user]);

  const loadSchoolStatus = async () => {
    try {
      const response = await apiService.get<{ school: School }>('/auth/my-school');
      setSchool(response.school);
    } catch (err) {
      // School not found or other error - this is normal for new advisors
      setSchool(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = (updatedSchool: School) => {
    setSchool(updatedSchool);
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  };

  // If user is an admin, show simple welcome message
  if (user?.role === 'admin') {
    return (
      <motion.div 
        className="home-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="admin-home">
          <div className="container">
            <div className="welcome-message">
              <h1>Welcome to the admin portal, {getUserDisplayName()}</h1>
            </div>
          </div>
        </div>
        <DateCounter />
      </motion.div>
    );
  }

  // If user is an advisor, show the appropriate advisor view
  if (user?.role === 'advisor') {
    if (loading) {
      return (
        <motion.div 
          className="home-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="advisor-home">
            <div className="container">
              <div className="loading">Loading...</div>
            </div>
          </div>
          <DateCounter />
        </motion.div>
      );
    }

    // Show success message if exists
    if (message) {
      return (
        <motion.div 
          className="home-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="advisor-home">
            <div className="container">
              <motion.div 
                className="advisor-content"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="advisor-title">
                  Welcome, <span className="gradient-text">{getUserDisplayName()}</span>
                </h1>
                <p className="advisor-subtitle">
                  {message}
                </p>
                <div className="advisor-action">
                  <motion.button 
                    className="btn btn-large register-school-btn"
                    onClick={() => setMessage(null)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Continue
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
          <DateCounter />
        </motion.div>
      );
    }

    // Show school status based on registration
    if (school) {
      if (school.status === 'pending') {
        return (
          <motion.div 
            className="home-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="advisor-home">
              <div className="container">
                <motion.div 
                  className="advisor-content"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h1 className="advisor-title">
                    Welcome, <span className="gradient-text">{getUserDisplayName()}</span>
                  </h1>
                  <p className="advisor-subtitle">
                    Your school is awaiting approval
                  </p>
                  <div className="school-status">
                    <h3>{school.schoolName}</h3>
                    <p>Status: <span className="status pending">Pending Approval</span></p>
                    <p>Submitted on: {new Date(school.createdAt).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              </div>
            </div>
            <DateCounter />
          </motion.div>
        );
      } else if (school.status === 'approved') {
        return (
          <motion.div 
            className="home-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="advisor-home">
              <div className="container">
                <motion.div 
                  className="advisor-content"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h1 className="advisor-title">
                    Welcome, <span className="gradient-text">{getUserDisplayName()}</span>
                  </h1>
                  <p className="advisor-subtitle">
                    Your school has been approved
                  </p>
                  <div className="school-summary">
                    <div className="summary-header">
                      <h3>Your School: {school.schoolName}</h3>
                      <button 
                        onClick={() => setShowEditModal(true)}
                        className="edit-school-btn"
                      >
                        Edit School
                      </button>
                    </div>
                    
                    <div className="summary-stats">
                      <div className="stat">
                        <span className="stat-number">{school.numberOfStudents}</span>
                        <span className="stat-label">Students</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">{school.people.length}</span>
                        <span className="stat-label">Delegation Members</span>
                      </div>
                    </div>
                    
                    <div className="school-members">
                      <h4>Delegation Members</h4>
                      <div className="members-list">
                        {school.people.map((person, index) => (
                          <div key={index} className="member">
                            <span className="member-name">{person.name}</span>
                            <span className="member-email">{person.email}</span>
                            <span className={`member-type ${person.type}`}>
                              {person.type === 'student' ? 'Student' : 'Advisor'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            <DateCounter />
          </motion.div>
        );
      }
    }

    // Show registration form for new advisors
    return (
      <motion.div 
        className="home-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="advisor-home">
          <div className="container">
            <motion.div 
              className="advisor-content"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="advisor-title">
                Welcome, <span className="gradient-text">{getUserDisplayName()}</span>
              </h1>
              <p className="advisor-subtitle">
                You are registered as an advisor. You can register your school and manage your delegation.
              </p>
              
              <div className="advisor-action">
                <p>You haven't registered a school yet.</p>
                <button 
                  onClick={() => navigate('/register-school')}
                  className="register-school-btn"
                >
                  Register Your School
                </button>
              </div>
            </motion.div>
          </div>
        </div>
        <DateCounter />
      </motion.div>
    );
  }

  // If user is a student, show the student dashboard
  if (user?.role === 'Student') {
    return (
      <motion.div 
        className="home-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-section">
          <div className="container center-hero">
            <div className="hero-content">
              <motion.h1 
                className="hero-title"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome, <span className="gradient-text">{getUserDisplayName()}</span>
              </motion.h1>
              <motion.p 
                className="hero-subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Welcome to the official platform for New Jersey Youth and Government. Submit your bills and track their progress.
              </motion.p>
              <motion.div 
                className="hero-actions"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link to="/bills" className="btn btn-primary">
                  <span>View All Bills</span>
                </Link>
                <Link to="/my-bills" className="btn btn-secondary">
                  <span>My Bill</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
        <DateCounter />
      </motion.div>
    );
  }

  // Default landing page for non-authenticated users
  return (
    <motion.div 
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Hero Section */}
        <motion.section 
          className="hero-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="container center-hero">
            <div className="hero-content">
              <motion.h1 
                className="hero-title"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome to <span className="gradient-text">the NJYAG Portal</span>
              </motion.h1>
              <motion.p 
                className="hero-subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                The official platform for New Jersey Youth and Government. Please create an account or login to get started.
              </motion.p>
              <motion.div 
                className="hero-actions"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link to="/login" className="btn">
                  <span>Login</span>
                </Link>
                <Link to="/register" className="btn btn-secondary">
                  <span>Register</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Date Counter Section */}
        <DateCounter />

        {/* Stats Section */}
        <motion.section 
          className="stats-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="container">
            <div className="stats-grid">
              {statsLoading ? (
                <div>Loading stats...</div>
              ) : statsError ? (
                <div style={{ color: 'red' }}>{statsError}</div>
              ) : stats ? (
                <>
                  <motion.div 
                    className="stat-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                  >
                    <div className="stat-value">{stats.activeBills}</div>
                    <div className="stat-label">Active Bills</div>
                  </motion.div>
                  <motion.div 
                    className="stat-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                  >
                    <div className="stat-value">{stats.registeredUsers}</div>
                    <div className="stat-label">Registered Users</div>
                  </motion.div>
                  <motion.div 
                    className="stat-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                  >
                    <div className="stat-value">{stats.schools}</div>
                    <div className="stat-label">Participating Schools</div>
                  </motion.div>
                </>
              ) : (
                <div>No stats available</div>
              )}
            </div>
          </div>
        </motion.section>
      </motion.div>

      {/* Edit School Modal */}
      {showEditModal && school && (
        <EditSchoolModal
          school={school}
          isOpen={showEditModal}
          onSave={handleEditSave}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </motion.div>
  );
};

export default Home; 