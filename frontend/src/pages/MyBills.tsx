import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Bill } from '../types';
import './MyBills.css';

const MyBills: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadMyBills = async () => {
      if (!user) {
        setError('Please log in to view your bills');
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const response = await apiService.getBills();
        console.log('All bills:', response);
        console.log('Current user:', user);
        
        // Filter bills to only show the current user's bills
        const myBills = response.filter(bill => {
          console.log('Checking bill:', bill.title, 'Author ID:', bill.author._id, 'User ID:', user._id);
          return bill.author._id === user._id;
        });
        
        console.log('Filtered bills:', myBills);
        setBills(myBills);
      } catch (error: any) {
        console.error('Error loading bills:', error);
        setError(error?.response?.data?.message || error.message || 'Failed to load your bills');
      } finally {
        setLoading(false);
      }
    };
    loadMyBills();
  }, [user]);

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
      <div className="my-bills-page loading">
        <div className="container">
          <div className="loading-spinner" />
          <p>Loading your bills...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-bills-page">
        <div className="container">
          <div className="empty-state">
            <h3>Error loading your bills</h3>
            <p style={{ color: 'red', fontWeight: 600 }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bills-page">
      <div className="container">
        {/* Header */}
        <div className="my-bills-header">
          <div className="header-content">
            <h1 className="page-title">My Bills</h1>
            <p className="page-subtitle">
              View and manage your submitted legislative bills
            </p>
          </div>
          
          <button className="btn new-bill-btn" onClick={() => navigate('/create-bill')}>
            <span>Submit New Bill</span>
          </button>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <p>
            You have {bills.length} bill{bills.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Bills Grid */}
        <div className="my-bills-grid">
          {bills.map((bill) => (
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
                  <span>Category: {bill.category.replace('_', ' ')}</span>
                </div>
                <div className="meta-item">
                  <span>Created: {new Date(bill.createdAt).toLocaleDateString()}</span>
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
        {bills.length === 0 && !loading && (
          <div className="empty-state">
            <h3>No bills found</h3>
            <p>You haven't submitted any bills yet. Start by creating your first bill!</p>
            <button className="btn" onClick={() => navigate('/create-bill')}>
              <span>Submit Your First Bill</span>
            </button>
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
                  
                  <h3>Enactment Clause</h3>
                  <p>{selectedBill.enactmentClause}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBills; 