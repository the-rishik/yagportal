import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Account.css';

const Account: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Profile completion state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [namePronunciation, setNamePronunciation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Form state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setMiddleName(user.middleName || '');
      setPronouns(user.pronouns || '');
      setNamePronunciation(user.namePronunciation || '');
      setPhoneNumber(user.phoneNumber || '');
      
      // Set old password to 'njyag' if user must change password
      if (user.mustChangePassword) {
        setOldPassword('njyag');
      }
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      const result = await apiService.updateAccount({
        firstName,
        lastName,
        middleName,
        pronouns,
        namePronunciation,
        phoneNumber
      });
      setSuccess('Profile updated successfully.');
      
      // Refresh user data to update mustCompleteProfile flag
      await refreshUser();
      
      // Redirect to home page after successful profile update
      setTimeout(() => {
        navigate('/');
      }, 1500); // Wait 1.5 seconds to show success message
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      await apiService.updateAccount({
        oldPassword,
        newPassword,
        confirmPassword
      });
      setSuccess('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Refresh user data to update mustChangePassword flag
      await refreshUser();
      
      // Redirect to home page after successful password change
      setTimeout(() => {
        navigate('/');
      }, 1500); // Wait 1.5 seconds to show success message
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  // Show profile completion form if user must complete profile
  if (user?.mustCompleteProfile) {
    return (
      <div className="account-page">
        <div className="must-complete-profile-warning">
          <strong>Please complete your profile information before continuing.</strong>
        </div>
        <h2>Complete Your Profile</h2>
        <form onSubmit={handleProfileUpdate} className="profile-completion-form">
          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Middle Name (Optional)</label>
            <input
              type="text"
              value={middleName}
              onChange={e => setMiddleName(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Pronouns (Optional)</label>
            <input
              type="text"
              value={pronouns}
              onChange={e => setPronouns(e.target.value)}
              placeholder="e.g., he/him, she/her, they/them"
            />
          </div>
          
          <div className="form-group">
            <label>Name Pronunciation (Optional)</label>
            <input
              type="text"
              value={namePronunciation}
              onChange={e => setNamePronunciation(e.target.value)}
              placeholder="e.g., REE-shik"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    );
  }

  // Show password change form if user must change password
  if (user?.mustChangePassword) {
    return (
      <div className="account-page">
        <div className="must-change-password-warning">
          <strong>For your security, you must change your password before continuing.</strong>
        </div>
        <h2>Change Password</h2>
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
    );
  }

  // Show regular account page
  return (
    <div className="account-page">
      <h2>Account</h2>
      <div className="account-info">
        <p><strong>Name:</strong> {user?.firstName} {user?.middleName && `${user.middleName} `}{user?.lastName}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Phone:</strong> {user?.phoneNumber}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>School:</strong> {user?.school}</p>
        {user?.pronouns && <p><strong>Pronouns:</strong> {user.pronouns}</p>}
        {user?.namePronunciation && <p><strong>Name Pronunciation:</strong> {user.namePronunciation}</p>}
      </div>
      
      <div className="update-profile-section">
        <h3>Update Profile Information</h3>
        <form onSubmit={handleProfileUpdate} className="update-profile-form">
          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Middle Name (Optional)</label>
            <input
              type="text"
              value={middleName}
              onChange={e => setMiddleName(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Pronouns (Optional)</label>
              <input
                type="text"
                value={pronouns}
                onChange={e => setPronouns(e.target.value)}
                placeholder="e.g., he/him, she/her, they/them"
              />
            </div>
            
            <div className="form-group">
              <label>Name Pronunciation (Optional)</label>
              <input
                type="text"
                value={namePronunciation}
                onChange={e => setNamePronunciation(e.target.value)}
                placeholder="e.g., REE-shik"
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
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