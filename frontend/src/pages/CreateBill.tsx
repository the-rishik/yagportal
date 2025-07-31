import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import './CreateBill.css';

const CreateBill: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    enactmentClause: '',
    category: 'civil_rights' as 'civil_rights' | 'finance' | 'human_rights' | 'education'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const categories = [
    { value: 'civil_rights', label: 'Civil Rights' },
    { value: 'finance', label: 'Finance' },
    { value: 'human_rights', label: 'Human Rights' },
    { value: 'education', label: 'Education' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiService.createBill(formData);
      setSuccess('Bill created successfully!');
      setTimeout(() => {
        navigate('/my-bills');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="create-bill-page">
        <div className="container">
          <div className="error-message">
            <h3>Access Denied</h3>
            <p>You must be logged in to create a bill.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-bill-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">Create New Bill</h1>
            <p className="page-subtitle">
              Draft and submit your legislative bill for consideration
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="create-bill-form">
            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                className="success-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {success}
              </motion.div>
            )}

            <div className="form-group">
              <label htmlFor="title">Bill Title *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a clear, descriptive title for your bill"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Topic *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="enactmentClause">Enactment Clause *</label>
              <input
                type="text"
                id="enactmentClause"
                value={formData.enactmentClause}
                onChange={(e) => handleInputChange('enactmentClause', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Bill Content *</label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your bill content here. Be specific and detailed about the legislation you're proposing."
                rows={12}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/bills')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Bill'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateBill; 