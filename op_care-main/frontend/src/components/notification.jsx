import React, { useState, useEffect } from 'react';
import '../styles/notifications.css';

const Notification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);
  if (!message) return null;
  return (
    <div className="notification">
      {message}
      <button className="close-btn" aria-label="Close notification" onClick={onClose}>&times;</button>
    </div>
  );
};

export default Notification;
