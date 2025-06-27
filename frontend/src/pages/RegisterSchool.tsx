import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './RegisterSchool.css';

const RegisterSchool: React.FC = () => {
  const navigate = useNavigate();
  const [schoolName, setSchoolName] = useState('');
  const [numberOfStudents, setNumberOfStudents] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!schoolName.trim()) {
      setError('School name is required');
      return false;
    }
    
    if (!numberOfStudents || parseInt(numberOfStudents) < 1) {
      setError('Number of students must be at least 1');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Store school information in sessionStorage and navigate to add members page
    sessionStorage.setItem('schoolRegistration', JSON.stringify({
      schoolName: schoolName.trim(),
      numberOfStudents: parseInt(numberOfStudents)
    }));

    navigate('/register-school-members');
  };

  return (
    <motion.div 
      className="register-school-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <motion.div 
          className="register-school-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1>Register Your School</h1>
          <p>Step 1: Enter your school information</p>
        </motion.div>

        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <motion.form 
          className="register-school-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="form-section">
            <h2>School Information</h2>
            <div className="form-group">
              <label htmlFor="schoolName">School Name *</label>
              <input
                type="text"
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter your school name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="numberOfStudents">Number of Students *</label>
              <input
                type="number"
                id="numberOfStudents"
                value={numberOfStudents}
                onChange={(e) => setNumberOfStudents(e.target.value)}
                placeholder="Enter number of students"
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Continue to Add Members'}
            </button>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default RegisterSchool; 