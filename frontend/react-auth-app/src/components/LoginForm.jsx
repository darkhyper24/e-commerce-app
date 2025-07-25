import React, { useState } from 'react';
import { loginUser, getProfile } from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await loginUser({ email: form.email, password: form.password });
      // Immediately update user in context
      const user = await getProfile();
      setUser(user);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/home'), 1500);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={formContainerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={headingStyle}>Sign In</h2>
        
        <div style={formGroupStyle}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
            autoComplete="email"
            required
          />
        </div>
        
        <div style={formGroupStyle}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            style={inputStyle}
            autoComplete="current-password"
            required
          />
        </div>
        
        <div style={rememberForgotStyle}>
          <div style={checkboxContainerStyle}>
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              style={checkboxStyle}
            />
            <label htmlFor="remember" style={checkboxLabelStyle}>Remember me</label>
          </div>
          <Link to="/forgot-password" style={forgotPasswordStyle}>
            Forgot password?
          </Link>
        </div>
        
        {error && <div style={{ color: '#ff5252', marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: '#ff9800', marginBottom: 12 }}>{success}</div>}
        
        <button
          type="submit"
          disabled={loading}
          style={{
            ...buttonStyle,
            filter: loading ? 'brightness(0.9)' : 'none',
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        
        <div style={registerLinkStyle}>
          Don't have an account?{' '}
          <Link to="/register" style={linkStyle}>Create one</Link>
        </div>
      </form>
    </div>
  );
};

const formContainerStyle = {
  width: '100%',
};

const formStyle = {
  background: '#232526',
  borderRadius: '18px',
  padding: '40px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  width: '100%',
  border: '1px solid rgba(255, 255, 255, 0.05)',
};

const headingStyle = {
  color: '#ff9800',
  fontSize: '32px',
  textAlign: 'center',
  marginBottom: '32px',
  fontWeight: '700',
};

const formGroupStyle = {
  marginBottom: '24px',
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
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid #333',
  background: 'rgba(24, 26, 27, 0.8)',
  color: '#fff',
  fontSize: '16px',
  outline: 'none',
  transition: 'border-color 0.3s, box-shadow 0.3s',
  boxSizing: 'border-box',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15) inset',
  '&:focus': {
    borderColor: '#ff9800',
    boxShadow: '0 0 0 2px rgba(255, 152, 0, 0.2)'
  }
};

const rememberForgotStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
};

const checkboxContainerStyle = {
  display: 'flex',
  alignItems: 'center',
};

const checkboxStyle = {
  marginRight: '10px',
  cursor: 'pointer',
  width: '16px',
  height: '16px',
};

const checkboxLabelStyle = {
  color: '#ccc',
  fontSize: '14px',
  cursor: 'pointer',
};

const forgotPasswordStyle = {
  color: '#ff9800',
  fontSize: '14px',
  textDecoration: 'none',
  fontWeight: '600',
  transition: 'color 0.2s',
  '&:hover': {
    color: '#ffb347'
  }
};




const buttonStyle = {
  width: '100%',
  background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
  color: '#222',
  fontWeight: '700',
  border: 'none',
  borderRadius: '10px',
  padding: '16px 0',
  fontSize: '18px',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
  transition: 'transform 0.2s, filter 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 14px rgba(255, 152, 0, 0.4)',
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 2px 8px rgba(255, 152, 0, 0.4)',
  }
};

const registerLinkStyle = {
  textAlign: 'center',
  marginTop: '28px',
  fontSize: '15px',
  color: '#aaa',
};

const linkStyle = {
  color: '#ff9800',
  textDecoration: 'none',
  fontWeight: '600',
  transition: 'color 0.2s',
  '&:hover': {
    color: '#ffb347'
  }
};

export default LoginForm;
