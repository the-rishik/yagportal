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
  const [approvingSchools, setApprovingSchools] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingSchoolId, setDeletingSchoolId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      console.log('Approving school:', schoolId);
      setApprovingSchools(prev => new Set(prev).add(schoolId));
      setError(null);
      
      const result = await apiService.approveSchool(schoolId);
      console.log('Approval result:', result);
      
      // Show success message
      setSuccessMessage(`School approved successfully! ${result.createdUsers?.length || 0} user accounts created.`);
      
      // Reload schools to get updated status
      await loadSchools();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error('Error approving school:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || 'Failed to approve school');
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setApprovingSchools(prev => {
        const newSet = new Set(prev);
        newSet.delete(schoolId);
        return newSet;
      });
    }
  };

  const deleteSchool = async (schoolId: string) => {
    try {
      console.log('Starting delete for school:', schoolId);
      console.log('Current user:', user);
      console.log('User role:', user?.role);
      setIsDeleting(true);
      setError(null);
      
      const result = await apiService.deleteSchool(schoolId);
      console.log('Delete result:', result);
      
      setSuccessMessage('School and all associated users deleted successfully.');
      await loadSchools();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error('Delete error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to delete school');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(false);
      setDeletingSchoolId(null);
      setShowDeleteConfirm(false);
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

  // Confirmation modal JSX
  const renderDeleteConfirmModal = () => {
    if (!deletingSchoolId) return null;
    const school = schools.find(s => s._id === deletingSchoolId);
    if (!school) return null;
    return (
      <div className="modal-overlay">
        <div className="modal">
          <h2>Confirm Delete</h2>
          <p>Are you sure you want to delete <strong>{school.schoolName}</strong> and <strong>all users associated with this school</strong>? This action cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDeletingSchoolId(null)} disabled={isDeleting}>Cancel</button>
            <button className="btn btn-danger" onClick={() => deleteSchool(school._id)} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };

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

        {/* Success and Error Messages */}
        {successMessage && (
          <motion.div 
            className="success-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {successMessage}
          </motion.div>
        )}
        
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

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
                      disabled={approvingSchools.has(school._id)}
                    >
                      {approvingSchools.has(school._id) ? 'Approving...' : 'Approve School'}
                    </button>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditSchool(school)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => setDeletingSchoolId(school._id)}
                    >
                      Delete
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
                  <button 
                    className="delete-btn"
                    onClick={() => setDeletingSchoolId(school._id)}
                  >
                    Delete
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
      {renderDeleteConfirmModal()}
    </motion.div>
  );
};

export default Delegations; 