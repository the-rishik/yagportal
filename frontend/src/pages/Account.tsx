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
  
  // New fields state
  const [foodAllergies, setFoodAllergies] = useState('');
  const [tshirtSize, setTshirtSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL'>('M');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactEmail, setEmergencyContactEmail] = useState('');
  
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
      setFoodAllergies(user.foodAllergies || '');
      setTshirtSize(user.tshirtSize || 'M');
      setEmergencyContactName(user.emergencyContact?.name || '');
      setEmergencyContactRelationship(user.emergencyContact?.relationship || '');
      setEmergencyContactPhone(user.emergencyContact?.phoneNumber || '');
      setEmergencyContactEmail(user.emergencyContact?.email || '');
      
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
      await apiService.updateAccount({
        firstName,
        lastName,
        middleName,
        pronouns,
        namePronunciation,
        phoneNumber,
        foodAllergies,
        tshirtSize: tshirtSize || 'M',
        emergencyContact: {
          name: emergencyContactName || 'Emergency Contact',
          relationship: emergencyContactRelationship || 'Emergency Contact',
          phoneNumber: emergencyContactPhone || '555-0000',
          email: emergencyContactEmail || 'emergency@example.com'
        }
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
          
          <div className="form-group">
            <label>Food Allergies (Optional)</label>
            <textarea
              value={foodAllergies}
              onChange={e => setFoodAllergies(e.target.value)}
              placeholder="List any food allergies or dietary restrictions..."
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>T-Shirt Size *</label>
            <select
              value={tshirtSize}
              onChange={e => setTshirtSize(e.target.value as any)}
              required
            >
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="XXXL">XXXL</option>
            </select>
          </div>
          
          <div className="emergency-contact-section">
            <h4>Emergency Contact Information *</h4>
            
            <div className="form-group">
              <label>Emergency Contact Name *</label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={e => setEmergencyContactName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Relationship *</label>
              <input
                type="text"
                value={emergencyContactRelationship}
                onChange={e => setEmergencyContactRelationship(e.target.value)}
                placeholder="e.g., Parent, Spouse, Friend"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Emergency Contact Phone *</label>
              <input
                type="tel"
                value={emergencyContactPhone}
                onChange={e => setEmergencyContactPhone(e.target.value)}
                placeholder="Phone number"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Emergency Contact Email *</label>
              <input
                type="email"
                value={emergencyContactEmail}
                onChange={e => setEmergencyContactEmail(e.target.value)}
                placeholder="Email address"
                required
              />
            </div>
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
        {user?.foodAllergies && <p><strong>Food Allergies:</strong> {user.foodAllergies}</p>}
        {user?.tshirtSize && <p><strong>T-Shirt Size:</strong> {user.tshirtSize}</p>}
        {user?.emergencyContact && (
          <div className="emergency-contact-info">
            <p><strong>Emergency Contact:</strong></p>
            <ul>
              {user.emergencyContact.name && <li><strong>Name:</strong> {user.emergencyContact.name}</li>}
              {user.emergencyContact.relationship && <li><strong>Relationship:</strong> {user.emergencyContact.relationship}</li>}
              {user.emergencyContact.phoneNumber && <li><strong>Phone:</strong> {user.emergencyContact.phoneNumber}</li>}
              {user.emergencyContact.email && <li><strong>Email:</strong> {user.emergencyContact.email}</li>}
            </ul>
          </div>
        )}
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
          
          <div className="form-group">
            <label>Food Allergies (Optional)</label>
            <textarea
              value={foodAllergies}
              onChange={e => setFoodAllergies(e.target.value)}
              placeholder="List any food allergies or dietary restrictions..."
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>T-Shirt Size *</label>
            <select
              value={tshirtSize}
              onChange={e => setTshirtSize(e.target.value as any)}
              required
            >
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="XXXL">XXXL</option>
            </select>
          </div>
          
          <div className="emergency-contact-section">
            <h4>Emergency Contact Information *</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label>Emergency Contact Name *</label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={e => setEmergencyContactName(e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Relationship *</label>
                <input
                  type="text"
                  value={emergencyContactRelationship}
                  onChange={e => setEmergencyContactRelationship(e.target.value)}
                  placeholder="e.g., Parent, Spouse, Friend"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Emergency Contact Phone *</label>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={e => setEmergencyContactPhone(e.target.value)}
                  placeholder="Phone number"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Emergency Contact Email *</label>
                <input
                  type="email"
                  value={emergencyContactEmail}
                  onChange={e => setEmergencyContactEmail(e.target.value)}
                  placeholder="Email address"
                  required
                />
              </div>
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