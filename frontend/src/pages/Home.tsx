import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import EditSchoolModal from '../components/EditSchoolModal';
import { School } from '../types';
import './Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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
                    Your school has been approved!
                  </p>
                  <div className="school-summary">
                    <div className="summary-header">
                      <h3>{school.schoolName}</h3>
                      <button 
                        className="edit-school-btn"
                        onClick={() => {
                          console.log('Edit button clicked!');
                          console.log('Current showEditModal state:', showEditModal);
                          console.log('School data:', school);
                          setShowEditModal(true);
                        }}
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
                        <span className="stat-label">Members</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">
                          {school.people.filter(p => p.type === 'advisor').length}
                        </span>
                        <span className="stat-label">Advisors</span>
                      </div>
                    </div>
                    <div className="school-members">
                      <h4>School Members</h4>
                      <div className="members-list">
                        {school.people.map((person, index) => (
                          <div key={index} className="member">
                            <span className="member-name">{person.name}</span>
                            <span className="member-email">{person.email}</span>
                            <span className={`member-type ${person.type}`}>
                              {person.type.charAt(0).toUpperCase() + person.type.slice(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Edit School Modal for Advisor */}
            <EditSchoolModal
              school={school}
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              onSave={handleEditSave}
              isAdmin={false}
            />
          </motion.div>
        );
      }
    }

    // Show register school button if no school registered
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
                Register your school to participate in NJYAG
              </p>
              <div className="advisor-action">
                <Link to="/register-school">
                  <motion.button 
                    className="btn btn-large register-school-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Register Your School
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Edit School Modal for Advisor */}
        <EditSchoolModal
          school={school}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
          isAdmin={false}
        />
      </motion.div>
    );
  }

  // Original home page content for non-advisors
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  };

  const features = [
    {
      title: "Submit Bills",
      description: "Create and submit legislative bills for consideration",
      color: "var(--primary-500)"
    },
    {
      title: "Collaborate",
      description: "Work with other delegates and advisors",
      color: "var(--success-500)"
    },
    {
      title: "Admin Tools",
      description: "Manage users and review submissions",
      color: "var(--warning-500)"
    },
    {
      title: "Track Progress",
      description: "Monitor your bills through the legislative process",
      color: "var(--error-500)"
    }
  ];

  const stats = [
    { label: "Active Bills", value: "150+" },
    { label: "Registered Users", value: "500+" },
    { label: "Schools", value: "25+" },
    { label: "Success Rate", value: "85%" }
  ];

  return (
    <>
      <motion.div 
        className="home-page"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.section 
          className="hero-section"
          variants={itemVariants}
        >
          <div className="container">
            <div className="hero-content">
              <motion.h1 
                className="hero-title"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome to <span className="gradient-text">YAG Bills</span>
              </motion.h1>
              <motion.p 
                className="hero-subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                The official platform for New Jersey Youth and Government bill submission and management.
                Create, submit, and track legislative proposals with ease.
              </motion.p>
              
              <motion.div 
                className="hero-actions"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {user ? (
                  <div className="flex gap-4">
                    <Link to="/bills" className="btn">
                      <span>View Bills</span>
                    </Link>
                    <Link to="/my-bills" className="btn btn-secondary">
                      <span>My Bills</span>
                    </Link>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Link to="/login" className="btn">
                      <span>Get Started</span>
                    </Link>
                    <Link to="/register" className="btn btn-secondary">
                      <span>Register</span>
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
            
            <motion.div 
              className="hero-visual"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <div className="hero-cards">
                <div className="hero-card card-1">
                  <span>Bill Submission</span>
                </div>
                <div className="hero-card card-2">
                  <span>Collaboration</span>
                </div>
                <div className="hero-card card-3">
                  <span>Management</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          className="features-section"
          variants={itemVariants}
        >
          <div className="container">
            <div className="section-header">
              <h2>Platform Features</h2>
              <p>Everything you need to manage your YAG experience</p>
            </div>
            
            <div className="features-grid">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="feature-card"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <div 
                    className="feature-icon"
                    style={{ backgroundColor: feature.color }}
                  >
                    <span>{feature.title.charAt(0)}</span>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          className="stats-section"
          variants={itemVariants}
        >
          <div className="container">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="stat-card"
                  variants={cardVariants}
                >
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </motion.div>
    </>
  );
};

export default Home; 