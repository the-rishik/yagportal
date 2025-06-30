import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import './Account.css';

const Account: React.FC = () => {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      await apiService.changePassword(oldPassword, newPassword, confirmPassword);
      setSuccess('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-page">
      {user?.mustChangePassword && (
        <div className="must-change-password-warning">
          <strong>For your security, you must change your password before continuing.</strong>
        </div>
      )}
      <h2>Account</h2>
      <div className="account-info" style={user?.mustChangePassword ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
        <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>School:</strong> {user?.school}</p>
      </div>
      <div className="change-password-section">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordChange} className="change-password-form">
          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              required
              disabled={user?.mustChangePassword}
              placeholder={user?.mustChangePassword ? 'Default password is "njyag"' : ''}
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Account; 