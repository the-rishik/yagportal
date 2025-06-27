import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import { School, Person } from '../types';
import './EditSchoolModal.css';

interface EditSchoolModalProps {
  school: School | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSchool: School) => void;
  isAdmin?: boolean;
}

const EditSchoolModal: React.FC<EditSchoolModalProps> = ({
  school,
  isOpen,
  onClose,
  onSave,
  isAdmin = false
}) => {
  const [formData, setFormData] = useState({
    schoolName: '',
    numberOfStudents: '',
    people: [] as Person[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (school) {
      setFormData({
        schoolName: school.schoolName,
        numberOfStudents: school.numberOfStudents.toString(),
        people: school.people.map((person, index) => ({
          ...person,
          id: person.id || `person-${index}`
        }))
      });
    }
  }, [school]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePersonChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      people: prev.people.map((person, i) => 
        i === index ? { ...person, [field]: value } : person
      )
    }));
  };

  const addPerson = () => {
    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name: '',
      email: '',
      gender: 'Prefer not to say',
      type: 'student'
    };
    setFormData(prev => ({
      ...prev,
      people: [...prev.people, newPerson]
    }));
  };

  const removePerson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      people: prev.people.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.schoolName.trim()) {
      setError('School name is required');
      return false;
    }
    
    if (!formData.numberOfStudents || parseInt(formData.numberOfStudents) < 1) {
      setError('Number of students must be at least 1');
      return false;
    }

    const studentCount = formData.people.filter(p => p.type === 'student').length;
    if (studentCount > parseInt(formData.numberOfStudents)) {
      setError(`Cannot have more students (${studentCount}) than the specified number (${formData.numberOfStudents})`);
      return false;
    }

    for (const person of formData.people) {
      if (!person.name.trim()) {
        setError('All people must have names');
        return false;
      }
      if (!person.email.trim()) {
        setError('All people must have email addresses');
        return false;
      }
    }

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
      const updatedSchool = {
        ...school!,
        schoolName: formData.schoolName,
        numberOfStudents: parseInt(formData.numberOfStudents),
        people: formData.people
      };

      const endpoint = isAdmin 
        ? `/admin/schools/${school!._id}`
        : '/auth/my-school';
        
      await apiService.put(endpoint, updatedSchool);
      onSave(updatedSchool);
      onClose();
    } catch (err) {
      setError('Failed to update school information');
      console.error('Error updating school:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {!school ? (
              <div className="modal-header">
                <h2>Loading...</h2>
                <button className="close-button" onClick={onClose}>×</button>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h2>Edit School Information</h2>
                  <button className="close-button" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="edit-form">
                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}

                  <div className="form-section">
                    <h3>School Information</h3>
                    <div className="form-group">
                      <label htmlFor="schoolName">School Name</label>
                      <input
                        type="text"
                        id="schoolName"
                        value={formData.schoolName}
                        onChange={(e) => handleInputChange('schoolName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="numberOfStudents">Number of Students</label>
                      <input
                        type="number"
                        id="numberOfStudents"
                        value={formData.numberOfStudents}
                        onChange={(e) => handleInputChange('numberOfStudents', e.target.value)}
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="section-header">
                      <h3>School Members</h3>
                      <button 
                        type="button" 
                        className="add-person-btn"
                        onClick={addPerson}
                      >
                        Add Person
                      </button>
                    </div>

                    <div className="people-list">
                      {formData.people.map((person, index) => (
                        <div key={person.id} className="person-card">
                          <div className="person-header">
                            <h4>Person {index + 1}</h4>
                            <button 
                              type="button" 
                              className="remove-person-btn"
                              onClick={() => removePerson(index)}
                            >
                              Remove
                            </button>
                          </div>

                          <div className="person-fields">
                            <div className="form-group">
                              <label>Name</label>
                              <input
                                type="text"
                                value={person.name}
                                onChange={(e) => handlePersonChange(index, 'name', e.target.value)}
                                required
                              />
                            </div>

                            <div className="form-group">
                              <label>Email</label>
                              <input
                                type="email"
                                value={person.email}
                                onChange={(e) => handlePersonChange(index, 'email', e.target.value)}
                                required
                              />
                            </div>

                            <div className="form-group">
                              <label>Gender</label>
                              <select
                                value={person.gender}
                                onChange={(e) => handlePersonChange(index, 'gender', e.target.value)}
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                              </select>
                            </div>

                            <div className="form-group">
                              <label>Type</label>
                              <select
                                value={person.type}
                                onChange={(e) => handlePersonChange(index, 'type', e.target.value as 'student' | 'advisor')}
                              >
                                <option value="student">Student</option>
                                <option value="advisor">Advisor</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="summary-info">
                      <p><strong>Students:</strong> {formData.people.filter(p => p.type === 'student').length}</p>
                      <p><strong>Advisors:</strong> {formData.people.filter(p => p.type === 'advisor').length}</p>
                      <p><strong>Total Members:</strong> {formData.people.length}</p>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditSchoolModal; 