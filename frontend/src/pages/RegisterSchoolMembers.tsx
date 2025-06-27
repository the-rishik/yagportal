import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import './RegisterSchool.css';

interface Person {
  id: string;
  name: string;
  email: string;
  gender: string;
  type: 'student' | 'advisor';
}

interface SchoolInfo {
  schoolName: string;
  numberOfStudents: number;
}

const RegisterSchoolMembers: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: '', email: '', gender: '', type: 'student' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get school information from sessionStorage
    const storedSchoolInfo = sessionStorage.getItem('schoolRegistration');
    if (!storedSchoolInfo) {
      navigate('/register-school');
      return;
    }

    try {
      const parsedInfo = JSON.parse(storedSchoolInfo);
      setSchoolInfo(parsedInfo);
    } catch (err) {
      navigate('/register-school');
    }
  }, [navigate]);

  const addPerson = () => {
    if (!schoolInfo) return;
    
    // Check if adding another person would exceed the number of students
    const currentStudentCount = people.filter(p => p.type === 'student').length;
    if (currentStudentCount >= schoolInfo.numberOfStudents) {
      setError(`Cannot add more students. Maximum allowed: ${schoolInfo.numberOfStudents}`);
      return;
    }

    const newPerson: Person = {
      id: Date.now().toString(),
      name: '',
      email: '',
      gender: '',
      type: 'student'
    };
    setPeople([...people, newPerson]);
    setError(null);
  };

  const removePerson = (id: string) => {
    if (people.length > 1) {
      setPeople(people.filter(person => person.id !== id));
      setError(null);
    }
  };

  const updatePerson = (id: string, field: keyof Person, value: string) => {
    setPeople(people.map(person => 
      person.id === id ? { ...person, [field]: value } : person
    ));
    setError(null);
  };

  const validateForm = () => {
    if (!schoolInfo) {
      setError('School information not found. Please start over.');
      return false;
    }

    if (!user) {
      setError('User not authenticated. Please log in again.');
      return false;
    }

    for (const person of people) {
      if (!person.name.trim()) {
        setError('All people must have a name');
        return false;
      }
      if (!person.email.trim()) {
        setError('All people must have an email');
        return false;
      }
      if (!person.gender) {
        setError('All people must select a gender');
        return false;
      }
    }

    // Check if student count doesn't exceed the limit
    const students = people.filter(p => p.type === 'student');
    if (students.length > schoolInfo.numberOfStudents) {
      setError(`Cannot have more than ${schoolInfo.numberOfStudents} students`);
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

    setLoading(true);
    setError(null);

    try {
      // Add the current user as an advisor
      const currentUserAsAdvisor = {
        name: `${user!.firstName} ${user!.lastName}`,
        email: user!.email,
        gender: 'Prefer not to say',
        type: 'advisor' as const
      };

      const schoolData = {
        schoolName: schoolInfo!.schoolName,
        numberOfStudents: schoolInfo!.numberOfStudents,
        people: [
          currentUserAsAdvisor,
          ...people.map(person => ({
            name: person.name.trim(),
            email: person.email.trim(),
            gender: person.gender,
            type: person.type
          }))
        ]
      };

      await apiService.post('/auth/register-school', schoolData);
      
      // Clear sessionStorage after successful registration
      sessionStorage.removeItem('schoolRegistration');
      
      // Redirect to home page after successful registration
      navigate('/', { 
        state: { 
          message: 'School registered successfully! Your school is now awaiting approval.' 
        } 
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register school');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/register-school');
  };

  if (!schoolInfo) {
    return <div>Loading...</div>;
  }

  const currentStudentCount = people.filter(p => p.type === 'student').length;
  const currentAdvisorCount = people.filter(p => p.type === 'advisor').length;

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
          <h1>Add School Members</h1>
          <p>Step 2: Add members for {schoolInfo.schoolName}</p>
          <div className="school-info-summary">
            <p><strong>School:</strong> {schoolInfo.schoolName}</p>
            <p><strong>Maximum Students:</strong> {schoolInfo.numberOfStudents}</p>
            <p><strong>Current Students:</strong> {currentStudentCount}</p>
            <p><strong>Current Advisors:</strong> {currentAdvisorCount}</p>
            <p><strong>You will be added as an advisor automatically</strong></p>
          </div>
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
            <div className="section-header">
              <h2>School Members</h2>
              <button 
                type="button" 
                className="add-person-btn"
                onClick={addPerson}
                disabled={currentStudentCount >= schoolInfo.numberOfStudents}
              >
                Add Person
              </button>
            </div>
            
            {currentStudentCount >= schoolInfo.numberOfStudents && (
              <div className="info-message">
                Maximum number of students reached ({schoolInfo.numberOfStudents})
              </div>
            )}
            
            {people.map((person, index) => (
              <motion.div 
                key={person.id}
                className="person-row"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="person-header">
                  <h3>Person {index + 1}</h3>
                  {people.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-person-btn"
                      onClick={() => removePerson(person.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="person-fields">
                  <div className="form-group">
                    <label htmlFor={`name-${person.id}`}>Name *</label>
                    <input
                      type="text"
                      id={`name-${person.id}`}
                      value={person.name}
                      onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={`email-${person.id}`}>Email *</label>
                    <input
                      type="email"
                      id={`email-${person.id}`}
                      value={person.email}
                      onChange={(e) => updatePerson(person.id, 'email', e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={`gender-${person.id}`}>Gender *</label>
                    <select
                      id={`gender-${person.id}`}
                      value={person.gender}
                      onChange={(e) => updatePerson(person.id, 'gender', e.target.value)}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={`type-${person.id}`}>Type *</label>
                    <select
                      id={`type-${person.id}`}
                      value={person.type}
                      onChange={(e) => updatePerson(person.id, 'type', e.target.value as 'student' | 'advisor')}
                      required
                    >
                      <option value="student">Student</option>
                      <option value="advisor">Advisor</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="back-btn"
              onClick={goBack}
            >
              Back to School Info
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Registering School...' : 'Register School'}
            </button>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default RegisterSchoolMembers; 