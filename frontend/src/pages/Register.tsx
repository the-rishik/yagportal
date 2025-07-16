import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RegisterData } from '../types';
import { apiService } from '../services/api';
import './Register.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    middleName: '',
    pronouns: '',
    namePronunciation: '',
    phoneNumber: '',
    school: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [approvedSchools, setApprovedSchools] = useState<{ schoolName: string }[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApprovedSchools = async () => {
      try {
        const schools = await apiService.getApprovedSchools();
        setApprovedSchools(schools);
      } catch (error) {
        console.error('Error fetching approved schools:', error);
        setError('Failed to load schools. Please try again.');
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchApprovedSchools();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <h2>Register</h2>
          <p>Create your NJ YAG account</p>
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your first name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="middleName">Middle Name (Optional)</label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder="Enter your middle name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pronouns">Pronouns (Optional)</label>
                <input
                  type="text"
                  id="pronouns"
                  name="pronouns"
                  value={formData.pronouns}
                  onChange={handleChange}
                  placeholder="e.g., he/him, she/her, they/them"
                />
              </div>

              <div className="form-group">
                <label htmlFor="namePronunciation">Name Pronunciation (Optional)</label>
                <input
                  type="text"
                  id="namePronunciation"
                  name="namePronunciation"
                  value={formData.namePronunciation}
                  onChange={handleChange}
                  placeholder="e.g., REE-shik"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="school">School</label>
              <select
                id="school"
                name="school"
                value={formData.school}
                onChange={handleChange}
                required
                disabled={schoolsLoading}
              >
                <option value="">Select your school</option>
                <option value="staff">Staff</option>
                {approvedSchools.map((school) => (
                  <option key={school.schoolName} value={school.schoolName}>
                    {school.schoolName}
                  </option>
                ))}
              </select>
              {schoolsLoading && (
                <div className="loading-text">Loading schools...</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                minLength={6}
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 