import React, { useState } from 'react';
import './Login.css'; 

import { registerUserOnServer } from '../script.js'; 

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    const userData = {
      full_name: fullName,
      email: email,
      password: password
    };

    const result = await registerUserOnServer(userData);

    if (result.success) {
        onLoginSuccess();
    } else {
        alert(result.message);
    }
  };

  return (
      <div className="login-page">
        <div className="main-block">
          
<div className="definition">
  
            <div className="header-section">
                <div className="logo-row">
                    <div className="fastline-icon-lg" />
                    <h1 className="app-title">FastLine</h1>
                </div>
                <p className="app-description">
                  Your secure workspace for team collaboration, project management, and professional communication.
                </p>
            </div>

            <div className="feature-item">
                <div className="feature-icon icon-purple" />
                <div className="feature-text">
                    <h3>End-to-end encryption</h3>
                    <p>Your messages are secure with military-grade encryption</p>
                </div>
            </div>

            <div className="feature-item">
                <div className="feature-icon icon-blue" />
                <div className="feature-text">
                    <h3>Real-time collaboration</h3>
                    <p>Work together seamlessly with your team in real-time</p>
                </div>
            </div>

            <div className="feature-item">
                <div className="feature-icon icon-indigo" />
                <div className="feature-text">
                    <h3>Project management tools</h3>
                    <p>Organize tasks, schedule meetings, and track progress</p>
                </div>
            </div>

          </div>
          
          <form className="registration-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <h2 className="form-title">Create Account</h2>
              <p className="form-description">Get started with FastLine today</p>
            </div>
            
            <div className="form-entrname">
              <h3 className="form-entrname-title">Full Name</h3>
              <input 
                type="text" 
                placeholder="Enter your full name" 
                className="form-input registration-field" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-email">
              <h3 className="form-email-title">Email Address</h3>
              <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="form-input-email registration-field-email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
              />
            </div>
            
            <div className="form-password">
              <h3 className="form-password-title">Password</h3>
              <input 
                  type="password" 
                  placeholder="Create a strong password" 
                  className="form-input-password registration-field-password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
              />
            </div>
            
            <div className="form-agreement">
              <input type="checkbox" className="agreement-checkbox" required />
              <h4 className="agreement-text">I agree to the <a href="#" className="agreement-link">Terms of Service</a>...</h4>
            </div>
            
            <div className="form-button">
              <button className="button" type="submit">Create Account</button>
            </div>
            
            <div className="form-signin">
              <h4 className="signin-text">Already have an account? <a href="#" className="signin-link"> Sign in</a></h4>
            </div>
          </form>
        </div>
      </div>
  );
};

export default Login;