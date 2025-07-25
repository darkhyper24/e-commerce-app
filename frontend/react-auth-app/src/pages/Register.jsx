import React from 'react';
import RegisterForm from '../components/RegisterForm';
import logo from '../assets/logo.PNG';
import { Link } from 'react-router-dom';

const Register = () => (
  <div style={registerPageStyle}>
    {/* Left side - Branding section */}
    <div style={brandSectionStyle}>
      <div style={brandContentStyle}>
        <Link to="/home">
          <img src={logo} alt="Smart.cart Logo" style={logoStyle} />
        </Link>
        
        <h1 style={sloganTitleStyle}>
          Your smart choice for 
          <span style={highlightStyle}> electronic needs</span>
          <br />and <span style={highlightStyle}>wants</span>!
        </h1>
        
        <p style={descriptionStyle}>
          Join our community of tech enthusiasts and get access to the latest hardware
          at competitive prices. Smart shopping for smart people!
        </p>
        
        <div style={benefitsContainerStyle}>
          <div style={benefitItemStyle}>
            <div style={benefitIconStyle}>✓</div>
            <span>Fast shipping on all orders</span>
          </div>
          <div style={benefitItemStyle}>
            <div style={benefitIconStyle}>✓</div>
            <span>High-quality, curated products</span>
          </div>
          <div style={benefitItemStyle}>
            <div style={benefitIconStyle}>✓</div>
            <span>Exclusive member-only deals</span>
          </div>
          <div style={benefitItemStyle}>
            <div style={benefitIconStyle}>✓</div>
            <span>30-day hassle-free returns</span>
          </div>
        </div>
      </div>
    </div>
    
    {/* Right side - Registration form */}
    <div style={formSectionStyle}>
      <RegisterForm />
    </div>
  </div>
);

// Page layout styles
const registerPageStyle = {
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
};

const brandContentStyle = {
  maxWidth: '600px',
  padding: '20px',
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
  fontSize: '18px',
  color: '#ccc',
  marginBottom: '40px',
  lineHeight: '1.6',
};

const benefitsContainerStyle = {
  marginTop: '24px',
};

const benefitItemStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
  color: '#ddd',
  fontSize: '16px',
};

const benefitIconStyle = {
  color: '#ff9800',
  fontWeight: 'bold',
  marginRight: '12px',
  fontSize: '18px',
};

// Right section styles
const formSectionStyle = {
  flex: '1 1 45%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
};

export default Register;
