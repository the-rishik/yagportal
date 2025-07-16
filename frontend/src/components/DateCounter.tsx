import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './DateCounter.css';

const DateCounter: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysUntilPreLeg, setDaysUntilPreLeg] = useState(0);
  const [daysUntilConference, setDaysUntilConference] = useState(0);

  // Event dates
  const preLegDate = new Date('2026-03-15');
  const conferenceDate = new Date('2026-04-17'); // Updated to April 17th

  useEffect(() => {
    const calculateDays = () => {
      const now = new Date();
      setCurrentDate(now);

      // Calculate days until Pre-Leg (March 15, 2026)
      const preLegTime = preLegDate.getTime() - now.getTime();
      const preLegDays = Math.ceil(preLegTime / (1000 * 60 * 60 * 24));
      setDaysUntilPreLeg(preLegDays);

      // Calculate days until Conference (April 16, 2026)
      const conferenceTime = conferenceDate.getTime() - now.getTime();
      const conferenceDays = Math.ceil(conferenceTime / (1000 * 60 * 60 * 24));
      setDaysUntilConference(conferenceDays);
    };

    // Calculate immediately
    calculateDays();

    // Update at midnight each day
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      calculateDays();
      // Then update every 24 hours
      setInterval(calculateDays, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusText = (days: number, eventType: 'preLeg' | 'conference') => {
    if (days < 0) return 'Past';
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow!';
    const eventName = eventType === 'preLeg' ? 'Pre-Leg' : 'Conference';
    return `days until ${eventName}`;
  };

  const getStatusClass = (days: number) => {
    if (days < 0) return 'past';
    if (days <= 7) return 'urgent';
    if (days <= 30) return 'soon';
    return 'upcoming';
  };

  return (
    <motion.section 
      className="date-counter-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="date-counter-container">
        <div className="date-counter-content">
          <div className="current-date">
            <h3>Today's Date</h3>
            <p className="date-display">{formatDate(currentDate)}</p>
          </div>
          
          <div className="event-counters">
            <div className="event-counter">
              <div className="event-header">
                <h3>Pre-Leg Date</h3>
                <span className="event-date">March 15, 2026</span>
              </div>
              <div className={`countdown ${getStatusClass(daysUntilPreLeg)}`}>
                <span className="countdown-number">{Math.abs(daysUntilPreLeg)}</span>
                <span className="countdown-text">{getStatusText(daysUntilPreLeg, 'preLeg')}</span>
              </div>
            </div>

            <div className="event-counter">
              <div className="event-header">
                <h3>Conference Date</h3>
                <span className="event-date">April 17-19, 2026</span>
              </div>
              <div className={`countdown ${getStatusClass(daysUntilConference)}`}>
                <span className="countdown-number">{Math.abs(daysUntilConference)}</span>
                <span className="countdown-text">{getStatusText(daysUntilConference, 'conference')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default DateCounter; 