import React from 'react';
import LoginForm from '../components/LoginForm';
import logo from '../assets/logo.PNG';
import { Link } from 'react-router-dom';

const Login = () => (
  <div style={loginPageStyle}>
    {/* Left side - Branding section */}
    <div style={brandSectionStyle}>
      <div style={brandContentStyle}>
        <Link to="/home">
          <img src={logo} alt="Smart.cart Logo" style={logoStyle} />
        </Link>
        
        <h1 style={sloganTitleStyle}>
          Welcome back to <span style={highlightStyle}>Smart.cart</span>!
        </h1>
        
        <p style={descriptionStyle}>
          Sign in to your account and continue your tech shopping journey. 
          Discover the latest hardware products at competitive prices.
        </p>
      </div>
    </div>
    
    {/* Right side - Login form */}
    <div style={formSectionStyle}>
      <div style={formWrapperStyle}>
        <LoginForm />
      </div>
    </div>
  </div>
);

// Page layout styles
const loginPageStyle = {
  display: 'flex',
  minHeight: '100vh',
  background: '#181A1B',
};

// Left section styles
const brandSectionStyle = {
  flex: '1 1 55%',
  background: 'linear-gradient(135deg, #232526 0%, #181A1B 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
  position: 'relative',
  overflow: 'hidden',
};

const brandContentStyle = {
  maxWidth: '600px',
  padding: '20px',
  position: 'relative',
  zIndex: 2,
};

const logoStyle = {
  height: '70px',
  marginBottom: '40px',
};

const sloganTitleStyle = {
  fontSize: '42px',
  fontWeight: '700',
  color: '#fff',
  marginBottom: '24px',
  lineHeight: '1.2',
};

const highlightStyle = {
  color: '#ff9800',
};

const descriptionStyle = {
  fontSize: '20px',
  color: '#ddd',
  marginBottom: '40px',
  lineHeight: '1.6',
  maxWidth: '90%',
};

// Right section styles
const formSectionStyle = {
  flex: '1 1 45%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
  background: '#181A1B',
};

const formWrapperStyle = {
  width: '100%',
  maxWidth: '450px',
};

export default Login;
