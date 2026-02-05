import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css'; // Переконайся, що ти переніс сюди свій CSS

// Спільна ліва частина (текст про FastLine)
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
    <div class="realtime">
      <div class="realtime-header">
        <div class="realtime-icon"></div>
        <h3 class="realtime-title">Real-time collaboration</h3>
      </div>
      <p class="realtime-description">Work together seamlessly with your team in real-time</p>
    </div>
    <div class="management">
      <div class="management-header">
        <div class="management-icon"></div>
        <h3 class="management-title">Project management tools</h3>
      </div>
      <p class="management-description">Organize tasks, schedule meetings, and track progress</p>
    </div>
  </div>
);

// --- КОМПОНЕНТ РЕЄСТРАЦІЇ ---
const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault(); // Зупиняємо відправку в URL!
    try {
      const response = await fetch('https://backendfastline.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Успіх! Аккаунт створено.");
      } else {
        alert("Помилка при реєстрації");
      }
    } catch (err) {
      console.error("Деталі помилки:", err); // Тепер err використовується і не підкреслюється
      alert("Помилка зв'язку з сервером");
    }
  };

  return (
    <div className="main-block">
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
            <div class="form-agreement">
                <input type="checkbox" name="terms_agreement" class="agreement-checkbox"/>
                <span class="custom-checkbox"></span>
                <h4 class="agreement-text">I agree to the <a href="#" class="agreement-link">Terms of Service</a> and <a href="#" class="agreement-link"> Privacy Policy</a></h4>
            </div>
          </div>
          <button type="submit" className="button">Create Account</button>
        </form>
        <div className="form-signin">
          <h4 className="signin-text">
            Already have an account? <Link to="/signin" className="signin-link">Sign in</Link>
          </h4>
        </div>
      </div>
    </div>
  );
};

// --- КОМПОНЕНТ ВХОДУ ---
const SignIn = () => {
  const navigate = useNavigate(); // Використовуємо для переходу після входу
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://backendfastline.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        alert('Успішний вхід!');
        navigate("/"); // Наприклад, повертаємо на головну після входу
      } else {
        alert('Помилка входу');
      }
    } catch (error) {
      console.error("Сервер не відповідає:", error); // Виправляє підсвітку error
      alert('Сервер не відповідає');
    }
  };

  return (
    <div className="main-block">
      <DefinitionSide />
      <div className="registration-form">
        <div className="form-header">
          <h2 className="form-title">Sign In</h2>
          <p class="form-description">Welcome back to FastLine</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-email">
            <h3 class="form-email-title">Email Address</h3>
            <input 
              type="email" 
              placeholder="Email" 
              className="form-input"
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
            />
          </div>
          <div className="form-password">
            <h3 class="form-password-title">Password</h3>
            <input 
              type="password" 
              placeholder="Password" 
              className="form-input"
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            />
          </div>
          <div class="form-forgot">
                <a href="#" class="forgot-link">Forgot password?</a>
          </div>
          <button type="submit" className="button">Login</button>
        </form>
        <div className="form-signin">
          <h4 className="signin-text">
            Don't have an account? <Link to="/" className="signin-link">Create one</Link>
          </h4>
        </div>
      </div>
    </div>
  );
};

// --- ГОЛОВНИЙ РОУТИНГ ---
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  );
}