import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import EditSchoolModal from '../components/EditSchoolModal';
import { School } from '../types';
import './Delegations.css';

const Delegations: React.FC = () => {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const response = await apiService.get<School[]>('/admin/schools');
      setSchools(response);
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  const approveSchool = async (schoolId: string) => {
    try {
      await apiService.put(`/admin/schools/${schoolId}/approve`);
      // Reload schools to get updated status
      loadSchools();
    } catch (error) {
      console.error('Error approving school:', error);
    }
  };

  const handleEditSchool = (school: School) => {
    setSelectedSchool(school);
    setShowEditModal(true);
  };

  const handleEditSave = (updatedSchool: School) => {
    setSchools(prev => prev.map(school => 
      school._id === updatedSchool._id ? updatedSchool : school
    ));
  };

  const pendingSchools = schools.filter(school => school.status === 'pending');
  const approvedSchools = schools.filter(school => school.status === 'approved');

  return (
    <motion.div 
      className="delegations-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Delegations</h1>
          <p>Manage school registrations and approvals</p>
        </motion.div>

        <motion.div 
          className="tabs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <button 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approval ({pendingSchools.length})
          </button>
          <button 
            className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved ({approvedSchools.length})
          </button>
        </motion.div>

        <motion.div 
          className="schools-list"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {activeTab === 'pending' ? (
            (() => {
              return pendingSchools.map((school) => (
                <motion.div 
                  key={school._id} 
                  className="school-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="school-header">
                    <h3>{school.schoolName}</h3>
                    <span className={`status ${school.status}`}>
                      {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                    </span>
                  </div>
                  <div className="school-details">
                    <div className="detail">
                      <strong>Registered by:</strong> {school.registeredBy?.firstName} {school.registeredBy?.lastName}
                    </div>
                    <div className="detail">
                      <strong>Email:</strong> {school.registeredBy?.email}
                    </div>
                    <div className="detail">
                      <strong>Students:</strong> {school.numberOfStudents}
                    </div>
                    <div className="detail">
                      <strong>Members:</strong> {school.people.length}
                    </div>
                    <div className="detail">
                      <strong>Submitted:</strong> {new Date(school.createdAt).toLocaleDateString()}
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
                  <div className="school-actions">
                    <button 
                      className="approve-btn"
                      onClick={() => approveSchool(school._id)}
                    >
                      Approve School
                    </button>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditSchool(school)}
                    >
                      Edit
                    </button>
                  </div>
                </motion.div>
              ));
            })()
          ) : (
            approvedSchools.map((school) => (
              <motion.div 
                key={school._id} 
                className="school-card approved"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="school-header">
                  <h3>{school.schoolName}</h3>
                  <span className={`status ${school.status}`}>
                    {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                  </span>
                </div>
                <div className="school-details">
                  <div className="detail">
                    <strong>Registered by:</strong> {school.registeredBy?.firstName} {school.registeredBy?.lastName}
                  </div>
                  <div className="detail">
                    <strong>Email:</strong> {school.registeredBy?.email}
                  </div>
                  <div className="detail">
                    <strong>Students:</strong> {school.numberOfStudents}
                  </div>
                  <div className="detail">
                    <strong>Members:</strong> {school.people.length}
                  </div>
                  <div className="detail">
                    <strong>Approved:</strong> {new Date(school.updatedAt || school.createdAt).toLocaleDateString()}
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
                <div className="school-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditSchool(school)}
                  >
                    Edit
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Edit School Modal */}
      <EditSchoolModal
        school={selectedSchool}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSchool(null);
        }}
        onSave={handleEditSave}
        isAdmin={true}
      />
    </motion.div>
  );
};

export default Delegations; 