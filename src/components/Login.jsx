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

const Register = ({ onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://backendfastline.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setTimeout(() => {
          setIsLoading(false);
          alert("✅ Акаунт створено! Тепер увійдіть.");
          onSwitchToLogin();
        }, 1500);
      } else {
        setIsLoading(false);
        alert("Помилка при реєстрації");
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Деталі помилки:", err);
      alert("Помилка зв'язку з сервером");
    }
  };

// registration
  return (
    <div className="main-block">
      {isLoading && (
        <Loader 
          title="Creating your account..." 
          subtitle="Please wait a moment while we set things up." 
        />
      )}
      
      <DefinitionSide />
      
      <div className="registration-form">
        <div className="form-header">
          <h2 className="form-title">Create Account</h2>
          <p className="form-description">Get started with FastLine today</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-entrname">
            <h3 className="form-entrname-title">Full Name</h3>
            <input 
              type="text" 
              placeholder="Enter your full name" 
              className="form-input"
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
          <div className="form-email">
            <h3 className="form-email-title">Email Address</h3>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="form-input"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="form-password">
            <h3 className="form-password-title">Password</h3>
            <input 
              type="password" 
              placeholder="Create password" 
              className="form-input"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <div className="form-agreement">
                <input type="checkbox" name="terms_agreement" className="agreement-checkbox"/>
                <span className="custom-checkbox"></span>
                <h4 className="agreement-text">I agree to the <a href="#" className="agreement-link">Terms of Service</a> and <a href="#" className="agreement-link"> Privacy Policy</a></h4>
            </div>
          </div>
          <button type="submit" className="button">Create Account</button>
        </form>
        <div className="form-signin">
          <h4 className="signin-text">
            Already have an account?{' '}
            <span onClick={onSwitchToLogin} className="signin-link" style={{cursor: 'pointer'}}>Sign in</span>
          </h4>
        </div>
      </div>
    </div>
  );
};

const SignIn = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://backendfastline.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);

        setTimeout(() => {
          setIsLoading(false);
          if (onLoginSuccess) onLoginSuccess(); 
        }, 1500);
      } else {
        setIsLoading(false);
        alert(`Помилка входу: ${data.message || 'Невірні дані'}`);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Сервер не відповідає:", error);
      alert('Сервер не відповідає');
    }
  };

  // login
  return (
    <div className="main-block">
      {isLoading && (
        <Loader 
          title="Signing in..." 
          subtitle="Connecting to your secure workspace." 
        />
      )}
      
      <DefinitionSide />
      
      <div className="registration-form">
        <div className="form-header">
          <h2 className="form-title">Sign In</h2>
          <p className="form-description">Welcome back to FastLine</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-email">
            <h3 className="form-email-title">Email Address</h3>
            <input 
              type="email" 
              placeholder="Email" 
              className="form-input"
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
            />
          </div>
          <div className="form-password">
            <h3 className="form-password-title">Password</h3>
            <input 
              type="password" 
              placeholder="Password" 
              className="form-input"
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            />
          </div>
          <div className="form-forgot">
                <a href="#" className="forgot-link">Forgot password?</a>
          </div>
          <button type="submit" className="button">Login</button>
        </form>
        <div className="form-signin">
          <h4 className="signin-text">
            Don't have an account?{' '}
            <span onClick={onSwitchToRegister} className="signin-link" style={{cursor: 'pointer'}}>Create one</span>
          </h4>
        </div>
      </div>
    </div>
  );
};

export default function Login({ onLoginSuccess }) {
  const [currentView, setCurrentView] = useState('login');

  if (currentView === 'register') {
    return <Register onSwitchToLogin={() => setCurrentView('login')} />;
  }

  return (
    <SignIn 
      onSwitchToRegister={() => setCurrentView('register')} 
      onLoginSuccess={onLoginSuccess} 
    />
  );
}