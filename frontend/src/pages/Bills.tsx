import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Bill } from '../types';
import './Bills.css';

const Bills: React.FC = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showModal, setShowModal] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'education', label: 'Education' },
    { value: 'environment', label: 'Environment' },
    { value: 'health', label: 'Health' },
    { value: 'public_safety', label: 'Public Safety' },
    { value: 'other', label: 'Other' }
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    const loadBills = async () => {
      try {
        setError(null);
        const response = await apiService.getBills();
        setBills(response);
      } catch (error: any) {
        setError(error?.response?.data?.message || error.message || 'Failed to load bills');
      } finally {
        setLoading(false);
      }
    };
    loadBills();
  }, []);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.author.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.author.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || bill.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || bill.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openBillModal = (bill: Bill) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  const closeBillModal = () => {
    setShowModal(false);
    setSelectedBill(null);
  };

  if (loading) {
    return (
      <div className="bills-page loading">
        <div className="container">
          <div className="loading-spinner" />
          <p>Loading bills...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bills-page">
        <div className="container">
          <div className="empty-state">
            <h3>Error loading bills</h3>
            <p style={{ color: 'red', fontWeight: 600 }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bills-page">
      <div className="container">
        {/* Header */}
        <div className="bills-header">
          <div className="header-content">
            <h1 className="page-title">Bills Directory</h1>
            <p className="page-subtitle">
              Browse and search through all submitted legislative bills
            </p>
          </div>
          
          {user && (
            <button className="btn new-bill-btn">
              <span>Submit New Bill</span>
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="search-filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search bills by title, content, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span>Filters</span>
            <span>{showFilters ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="filter-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="filter-group">
                <label className="filter-label">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="filter-select"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="results-info">
          <p>
            Showing {filteredBills.length} of {bills.length} bills
          </p>
        </div>

        {/* Bills Grid */}
        <div className="bills-grid">
          {filteredBills.map((bill) => (
            <div
              key={bill._id}
              className="bill-card"
              onClick={() => openBillModal(bill)}
            >
              <div className="bill-header">
                <h3 className="bill-title">{bill.title}</h3>
                <span className={`badge badge-${bill.status}`}>
                  {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                </span>
              </div>

              <div className="bill-meta">
                <div className="meta-item">
                  <span>Author: {bill.author.firstName} {bill.author.lastName}</span>
                </div>
                <div className="meta-item">
                  <span>Date: {new Date(bill.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="bill-category">
                <span className="category-badge">{bill.category.replace('_', ' ')}</span>
              </div>

              <p className="bill-excerpt">
                {bill.content.length > 150 
                  ? `${bill.content.substring(0, 150)}...` 
                  : bill.content
                }
              </p>

              <div className="bill-actions">
                <button className="view-btn">
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBills.length === 0 && !loading && (
          <div className="empty-state">
            <h3>No bills found</h3>
            <p>Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>

      {/* Bill Modal */}
      <AnimatePresence>
        {showModal && selectedBill && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBillModal}
          >
            <motion.div
              className="bill-modal"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{selectedBill.title}</h2>
                <button 
                  className="close-btn"
                  onClick={closeBillModal}
                >
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="modal-meta">
                  <div className="meta-row">
                    <span className="meta-label">Author:</span>
                    <span>{selectedBill.author.firstName} {selectedBill.author.lastName}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Category:</span>
                    <span>{selectedBill.category.replace('_', ' ')}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Status:</span>
                    <span className={`badge badge-${selectedBill.status}`}>
                      {selectedBill.status.charAt(0).toUpperCase() + selectedBill.status.slice(1)}
                    </span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Created:</span>
                    <span>{new Date(selectedBill.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="bill-content">
                  <h3>Bill Content</h3>
                  <p>{selectedBill.content}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bills; 