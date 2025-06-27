import React from 'react';
import { motion } from 'framer-motion';
import './Contact.css';

const Contact: React.FC = () => {
  return (
    <motion.div 
      className="contact-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <motion.div 
          className="contact-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1>Contact Us</h1>
          <p>Get in touch with the NJYAG team for any questions or support.</p>
        </motion.div>

        <motion.div 
          className="contact-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="contact-section">
            <h2>Program Head</h2>
            <div className="contact-card">
              <div className="contact-info">
                <h3>Dmitri Henry</h3>
                <p className="contact-email">dhenry@ymcace.org</p>
                <p className="contact-role">Program Director</p>
              </div>
            </div>
          </div>

          <div className="contact-section">
            <h2>Portal Leads</h2>
            <div className="contact-cards">
              <div className="contact-card">
                <div className="contact-info">
                  <h3>Rishik Narayana</h3>
                  <p className="contact-email">rishik@njyag.org</p>
                  <p className="contact-role">Portal Lead</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="contact-info">
                  <h3>Alex Eng</h3>
                  <p className="contact-email">alexeng@njyag.org</p>
                  <p className="contact-role">Portal Lead</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Contact; 