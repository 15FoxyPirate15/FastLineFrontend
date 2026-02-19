import React from 'react';
import './Loader.css';

const Loader = () => {
  return (
    <div id="loader-overlay" className="loader-overlay">
      <div className="glass-card">
        <div className="spinner">
          <div className="circle"></div>
          <div className="checkmark">L</div> 
        </div>
        <h3>Creating your account...</h3>
        <p>Please wait a moment while we set things up.</p>
      </div>
    </div>
  );
};

export default Loader;