import React from 'react';

const EmptyCart = ({ onContinueShopping }) => {
  return (
    <div style={emptyCartStyle}>
      <div style={iconStyle}>🛒</div>
      <h2 style={titleStyle}>Your cart is empty</h2>
      <p style={messageStyle}>Looks like you haven't added any products to your cart yet.</p>
      <button 
        style={shopNowButtonStyle}
        onClick={onContinueShopping}
      >
        Continue Shopping
      </button>
    </div>
  );
};

// Styles
const emptyCartStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '64px 24px',
  backgroundColor: '#232526',
  borderRadius: '16px',
  boxShadow: '0 2px 24px #0008',
};

const iconStyle = {
  fontSize: '64px',
  marginBottom: '24px',
};

const titleStyle = {
  color: '#ff9800',
  fontSize: '28px',
  margin: '0 0 16px 0',
};

const messageStyle = {
  color: '#ccc',
  fontSize: '16px',
  maxWidth: '400px',
  textAlign: 'center',
  marginBottom: '32px',
};

const shopNowButtonStyle = {
  background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
  color: '#222',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 32px',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'transform 0.1s, filter 0.2s',
};

export default EmptyCart;