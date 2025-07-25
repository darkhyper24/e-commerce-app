import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.PNG';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Navbar.css';

const Navbar = ({ onSearch }) => {
  const { isAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user state even if API call fails
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <nav style={navStyle}>
      <div style={leftStyle}>
        <Link to="/home">
          <img src={logo} alt="Smart Cart Logo" style={{ height: 40, marginRight: 16 }} />
        </Link>
      </div>
      <div style={centerStyle}>
        <input
          type="text"
          placeholder="Search hardware..."
          onChange={e => onSearch && onSearch(e.target.value)}
          style={searchStyle}
        />
      </div>
      <div style={rightStyle}>
        <Link to="/home" className="nav-link">Home</Link>
        <Link to="/products" className="nav-link">Products</Link>
        <Link to="/cart" className="nav-link">Cart</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/faqs" className="nav-link">FAQs</Link>
        {isAuthenticated ? (
          <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
        ) : (
          <button onClick={() => navigate('/login')} style={loginBtnStyle}>Login</button>
        )}
      </div>
    </nav>
  );
};

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#181A1B',
  padding: '0 32px',
  height: 70,
  boxShadow: '0 2px 12px #0006',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};


const leftStyle = { display: 'flex', alignItems: 'center' };
const centerStyle = { flex: 1, display: 'flex', justifyContent: 'center' };
const searchStyle = {
  width: 320,
  padding: '8px 16px',
  borderRadius: 20,
  border: '1px solid #333',
  background: '#232526',
  color: '#fff',
  fontSize: 16,
  outline: 'none',
};
const rightStyle = { display: 'flex', alignItems: 'center', gap: 24 };
const logoutBtnStyle = {
  background: 'linear-gradient(90deg, #ff5252 0%, #ff9800 100%)',
  color: '#fff',
  fontWeight: 700,
  border: 'none',
  borderRadius: 8,
  padding: '8px 18px',
  fontSize: 16,
  cursor: 'pointer',
  marginLeft: 8,
  boxShadow: '0 2px 8px #0004',
  transition: 'filter 0.2s',
};
const loginBtnStyle = {
  background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
  color: '#222',
  fontWeight: 700,
  border: 'none',
  borderRadius: 8,
  padding: '8px 18px',
  fontSize: 16,
  cursor: 'pointer',
  marginLeft: 8,
  boxShadow: '0 2px 8px #0004',
  transition: 'filter 0.2s',
};

export default Navbar;