import React, { useState } from 'react';
import './Login.css';

// --- ЛІВА ЧАСТИНА (Опис) ---
const DefinitionSide = () => (
  <div className="definition">
    <div className="fastline-text">
      <div className="fastline-header">
        <div className="fastline-icon"></div>
        <h1 className="fastline-title">FastLine</h1>
      </div>
      <p className="fastline-description">
        Your secure workspace for team collaboration, project management, and professional communication.
      </p>
    </div>
    <div className="encryption">
      <div className="encryption-header">
        <div className="encryption-icon"></div>
        <h3 className="encryption-title">End-to-end encryption</h3>
      </div>
      <p className="encryption-description">Your messages are secure with military-grade encryption</p>
    </div>
    <div className="realtime">
      <div className="realtime-header">
        <div className="realtime-icon"></div>
        <h3 className="realtime-title">Real-time collaboration</h3>
      </div>
      <p className="realtime-description">Work together seamlessly with your team in real-time</p>
    </div>
    <div className="management">
      <div className="management-header">
        <div className="management-icon"></div>
        <h3 className="management-title">Project management tools</h3>
      </div>
      <p className="management-description">Organize tasks, schedule meetings, and track progress</p>
    </div>
  </div>
);

// --- ГОЛОВНИЙ КОМПОНЕНТ LOGIN ---
// Він приймає функцію onLoginSuccess, яку ми передали з App.jsx
export default function Login({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(false); // false = Реєстрація, true = Вхід
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Очищення форми при перемиканні
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({ full_name: '', email: '', password: '' });
    setAcceptedTerms(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валідація для реєстрації
    if (!isLoginMode && !acceptedTerms) {
      alert('❌ Потрібно погодитись з умовами');
      return;
    }

    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    const url = `https://backendfastline.onrender.com${endpoint}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Успіх!
        if (isLoginMode) {
            // Якщо це був вхід -> запускаємо функцію успіху
            onLoginSuccess(); 
        } else {
            // Якщо це була реєстрація -> перемикаємо на форму входу
            alert('✅ Акаунт створено! Увійдіть.');
            setIsLoginMode(true);
        }
      } else {
        alert('❌ Помилка: Перевірте дані');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Сервер недоступний');
    }
  };

  return (
    <div className="main-block">
      <DefinitionSide />
      
      <div className="registration-form">
        <div className="form-header">
          <h2 className="form-title">{isLoginMode ? 'Sign In' : 'Create Account'}</h2>
          <p className="form-description">
            {isLoginMode ? 'Welcome back to FastLine' : 'Get started with FastLine today'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Поле імені показуємо тільки при реєстрації */}
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
                  I agree to the <a href="#" className="agreement-link">Terms</a> and <a href="#" className="agreement-link">Privacy Policy</a>
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