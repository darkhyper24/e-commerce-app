import React, { useState } from 'react';
import { registerUser } from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';

const RegisterForm = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await registerUser(form);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={formContainerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={headingStyle}>Create Your Account</h2>
        
        <div style={formGroupStyle}>
          <label style={labelStyle}>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Choose a username"
            value={form.username}
            onChange={handleChange}
            style={inputStyle}
            autoComplete="username"
            required
          />
        </div>
        
        <div style={formGroupStyle}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Your email address"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
            autoComplete="email"
            required
          />
        </div>
        
        <div style={formGroupStyle}>
          <label style={labelStyle}>Phone</label>
          <input
            type="tel"
            name="phone"
            placeholder="Your phone number"
            value={form.phone}
            onChange={handleChange}
            style={inputStyle}
            autoComplete="tel"
            required
          />
        </div>
        
        <div style={formGroupStyle}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a secure password"
            value={form.password}
            onChange={handleChange}
            style={inputStyle}
            autoComplete="new-password"
            required
            minLength={8}
          />
          <div style={passwordHintStyle}>Minimum length is 8 characters.</div>
        </div>
        
        {error && <div style={{ color: '#ff5252', marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: '#ff9800', marginBottom: 12 }}>{success}</div>}

        <button
          type="submit"
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div style={loginLinkStyle}>
          Already have an account?{' '}
          <Link to="/login" style={linkStyle}>Login</Link>
        </div>
      </form>
    </div>
  );
};

const formContainerStyle = {
  width: '100%',
  maxWidth: '450px',
};

const formStyle = {
  background: '#232526',
  borderRadius: '18px',
  padding: '40px',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
  width: '100%',
};

const headingStyle = {
  color: '#ff9800',
  fontSize: '28px',
  textAlign: 'center',
  marginBottom: '32px',
  fontWeight: '700',
};

const formGroupStyle = {
  marginBottom: '20px',
};

const labelStyle = {
  color: '#ff9800',
  fontWeight: '600',
  fontSize: '16px',
  marginBottom: '8px',
  display: 'block',
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #333',
  background: '#181A1B',
  color: '#fff',
  fontSize: '16px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const passwordHintStyle = {
  fontSize: '12px',
  color: '#aaa',
  marginTop: '6px',
};



const buttonStyle = {
  width: '100%',
  background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
  color: '#222',
  fontWeight: '700',
  border: 'none',
  borderRadius: '8px',
  padding: '14px 0',
  fontSize: '18px',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.2s, filter 0.2s',
};

const loginLinkStyle = {
  textAlign: 'center',
  marginTop: '24px',
  fontSize: '15px',
  color: '#ccc',
};

const linkStyle = {
  color: '#ff9800',
  textDecoration: 'none',
  fontWeight: '600',
};

export default RegisterForm;
