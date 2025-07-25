import React from 'react';
import { Link } from 'react-router-dom';

const CartSummary = ({ totalAmount, onCheckout }) => {
  return (
    <div style={summaryStyle}>
      <div style={summaryRowStyle}>
        <span style={{ color: '#ccc' }}>Subtotal:</span>
        <span style={{ color: '#fff' }}>${totalAmount}</span>
      </div>
      <div style={summaryRowStyle}>
        <span style={{ color: '#ccc' }}>Shipping:</span>
        <span style={{ color: '#fff' }}>Free</span>
      </div>
      <div style={{ ...summaryRowStyle, borderTop: '1px solid #333', paddingTop: 12, marginTop: 8 }}>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Total:</span>
        <span style={{ color: '#ff9800', fontSize: 20, fontWeight: 700 }}>${totalAmount}</span>
      </div>
      
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button 
          style={checkoutBtnStyle}
          onClick={onCheckout} // Add click handler
        >
          Proceed to Checkout
        </button>
        <Link to="/products" style={continueShoppingLinkStyle}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

// Styles
const summaryStyle = {
  background: '#1E2021',
  padding: 24,
};

const summaryRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 12,
};

const checkoutBtnStyle = {
  background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
  color: '#222',
  fontWeight: 700,
  border: 'none',
  borderRadius: 8,
  padding: '12px 0',
  width: '100%',
  fontSize: 17,
  cursor: 'pointer',
  boxShadow: '0 2px 8px #0004',
  transition: 'filter 0.2s',
};

const continueShoppingLinkStyle = {
  color: '#ff9800',
  textDecoration: 'none',
  textAlign: 'center',
  fontWeight: 500,
};

export default CartSummary;