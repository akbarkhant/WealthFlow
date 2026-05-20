import React from 'react';
import './Badge.css';

const Badge = ({ text, type = 'success' }) => {
  return <span className={`badge badge-${type}`}>{text}</span>;
};

export default Badge;