import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { User, Bill } from '../types';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<'user' | 'advisor' | 'staff' | 'admin'>('user');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, billsResponse] = await Promise.all([
        apiService.get<User[]>('/admin/users'),
        apiService.get<Bill[]>('/admin/bills')
      ]);
      setUsers(usersResponse);
      setBills(billsResponse);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await apiService.put(`/admin/users/${selectedUser._id}/role`, { role: newRole });
      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, role: newRole } : u));
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('user');
    } catch (err) {
      setError('Failed to update user role');
      console.error('Error updating role:', err);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
    setSelectedUser(null);
    setNewRole('user');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'var(--error-500)';
      case 'advisor': return 'var(--warning-500)';
      case 'user': return 'var(--success-500)';
      case 'staff': return 'var(--primary-500)';
      default: return 'var(--gray-500)';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'var(--gray-500)';
      case 'submitted': return 'var(--warning-500)';
      case 'approved': return 'var(--success-500)';
      case 'rejected': return 'var(--error-500)';
      default: return 'var(--gray-500)';
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Admin Dashboard</h1>
          
          {/* Stats Overview */}
          <div className="stats-overview">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{users.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Bills</h3>
              <p>{bills.length}</p>
            </div>
            <div className="stat-card">
              <h3>Advisors</h3>
              <p>{users.filter(u => u.role === 'advisor').length}</p>
            </div>
            <div className="stat-card">
              <h3>Students</h3>
              <p>{users.filter(u => u.role === 'user').length}</p>
            </div>
          </div>

          {/* User Management */}
          <section className="section">
            <h2>User Management</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>School</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>{user.school || 'N/A'}</td>
                      <td>
                        <span 
                          className="role-badge"
                          style={{ backgroundColor: getRoleBadgeColor(user.role) }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-small"
                          onClick={() => openRoleModal(user)}
                        >
                          Change Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bill Management */}
          <section className="section">
            <h2>Bill Management</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>School</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill._id}>
                      <td>{bill.title}</td>
                      <td>{bill.author.firstName} {bill.author.lastName}</td>
                      <td>{bill.school}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusBadgeColor(bill.status) }}
                        >
                          {bill.status}
                        </span>
                      </td>
                      <td>{bill.category}</td>
                      <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </motion.div>

        {/* Role Change Modal */}
        {showRoleModal && (
          <div className="modal-overlay" onClick={closeRoleModal}>
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Change User Role</h2>
              <p>Change role for: {selectedUser?.firstName} {selectedUser?.lastName}</p>
              
              <div className="form-group">
                <label htmlFor="role">New Role:</label>
                <select 
                  id="role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'user' | 'advisor' | 'staff' | 'admin')}
                >
                  <option value="user">Student</option>
                  <option value="advisor">Advisor</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={closeRoleModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleRoleChange}>
                  Update Role
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 