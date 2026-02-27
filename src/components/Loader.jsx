import React from 'react';
import './Loader.css';

const Loader = ({ title, subtitle }) => {
  return (
    <div id="loader-overlay" className="loader-overlay">
      <div className="glass-card">
        <div className="spinner">
          <div className="circle"></div>
          <div className="checkmark">L</div> 
        </div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  );
};

export default Loader;