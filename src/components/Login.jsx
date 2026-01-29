import React, { useState } from 'react';
import './Login.css'; 

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

    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registration successful:', data);
        onLoginSuccess();
      } else {
        alert(data.message || 'Registration failed');
        console.error('Server error:', data);
      }

    } catch (error) {
      console.error('Network error:', error);
      alert('Failed. Check connection with server.');
    }
  };

  return (
      <div className="login-page">
        
        <div className="main-block">
          <div className="definition">
            <div className="fastline-text">
              <div className="fastline-header">
                <div className="fastline-icon" />
                <h1 className="fastline-title">FastLine</h1>
              </div>
              <p className="fastline-description">Your secure workspace for team collaboration, project management, and professional communication.</p>
            </div>
            
            <div className="encryption">
                <div className="encryption-header">
                <div className="encryption-icon" />
                <h3 className="encryption-title">End-to-end encryption</h3>
                </div>
                <p className="encryption-description">Your messages are secure with military-grade encryption</p>
            </div>
            
            <div className="realtime">
                <div className="realtime-header">
                <div className="realtime-icon" />
                <h3 className="realtime-title">Real-time collaboration</h3>
                </div>
                <p className="realtimen-description">Work together seamlessly with your team in real-time</p>
            </div>
            
            <div className="management">
                <div className="management-header">
                <div className="management-icon" />
                <h3 className="management-title">Project management tools</h3>
                </div>
                <p className="management-description">Organize tasks, schedule meetings, and track progress</p>
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
                name="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            
            <div className="form-email">
              <h3 className="form-email-title">Email Address</h3>
              <input 
                  type="text" 
                  placeholder="Enter your email address" 
                  className="form-input-email registration-field-email" 
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            
            <div className="form-password">
              <h3 className="form-password-title">Password</h3>
              <input 
                  type="password" 
                  placeholder="Create a strong password" 
                  className="form-input-password registration-field-password" 
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            
            <div className="form-agreement">
              <input type="checkbox" name="terms_agreement" className="agreement-checkbox" />
              <h4 className="agreement-text">I agree to the <a href="#" className="agreement-link">Terms of Service</a> and <a href="#" className="agreement-link"> Privacy Policy</a></h4>
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