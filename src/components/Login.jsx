import React, { useState } from 'react';
import './Login.css';
import Loader from './Loader';

const DefinitionSide = () => (
  <div className="definition">
    <div className="fastline-text">
      <div className="fastline-header">
        <div className="fastline-icon"></div>
        <h1 className="fastline-title">FastLine</h1>
      </div>
      <p className="fastline-description">
        Your secure workspace for team collaboration.
      </p>
    </div>
     <div className="encryption">
      <div className="encryption-header">
        <div className="encryption-icon"></div>
        <h3 className="encryption-title">End-to-end encryption</h3>
      </div>
      <p className="encryption-description">Your messages are secure.</p>
    </div>
  </div>
);

export default function Login({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({ full_name: '', email: '', password: '' });
    setAcceptedTerms(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoginMode && !acceptedTerms) {
      alert('❌ Потрібно погодитись з умовами');
      return;
    }

    setIsLoading(true);

    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    const url = `https://backendfastline.onrender.com${endpoint}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (isLoginMode) {
            localStorage.setItem('token', data.token);
            if (onLoginSuccess) onLoginSuccess();
        } else {
            alert('✅ Акаунт створено! Увійдіть.');
            setIsLoginMode(true);
        }
      } else {
        alert(`❌ Помилка: ${data.message || 'Перевірте дані'}`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Сервер недоступний');
      setIsLoading(false);
    }
  };

  return (
    <div className="main-block">
      {isLoading && <Loader />}
      <DefinitionSide />

      <div className="registration-form">
        <div className="form-header">
          <h2 className="form-title">{isLoginMode ? 'Sign In' : 'Create Account'}</h2>
          <p className="form-description">
            {isLoginMode ? 'Welcome back to FastLine' : 'Get started with FastLine today'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div className="form-entrname">
              <h3 className="form-entrname-title">Full Name</h3>
              <input 
                type="text" 
                placeholder="Enter your full name" 
                className="form-input"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
          )}

          <div className="form-email">
            <h3 className="form-email-title">Email Address</h3>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="form-password">
            <h3 className="form-password-title">Password</h3>
            <input 
              type="password" 
              placeholder={isLoginMode ? "Enter password" : "Create password"} 
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLoginMode && (
            <div className="form-agreement">
                <input 
                  type="checkbox" 
                  className="agreement-checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span className="agreement-text">
                  I agree to the Terms and Privacy Policy
                </span>
            </div>
          )}

          <button type="submit" className="button">
            {isLoginMode ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="form-signin">
          <h4 className="signin-text">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <span onClick={toggleMode} className="signin-link" style={{cursor: 'pointer'}}>
              {isLoginMode ? 'Create one' : 'Sign in'}
            </span>
          </h4>
        </div>
      </div>
    </div>
  );
}