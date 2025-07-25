import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderCreated, setOrderCreated] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [orderId, setOrderId] = useState('');
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, cartTotal } = useCart();

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      navigate('/login', { state: { returnTo: '/checkout' } });
      return;
    }

    // Redirect if cart is empty
    if (!cart || cart.length === 0) {
      navigate('/cart');
      return;
    }
  }, [user, cart, navigate]);

  const handleCreateOrder = async () => {
    if (!shippingAddress.trim()) {
      setError('Please enter a shipping address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/orders/create', {
        shippingAddress: shippingAddress.trim(),
        paymentMethod: 'paymob'
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setOrderCreated(true);
        setPaymentUrl(response.data.data.paymentUrl);
        setOrderId(response.data.data.orderId);
      } else {
        setError(response.data.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = () => {
    if (paymentUrl) {
      // Open payment URL in the same window for better user experience
      window.location.href = paymentUrl;
    }
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  if (!user || !cart || cart.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div style={{ background: '#181A1B', minHeight: '100vh' }}>
      <Navbar onSearch={() => {}} onLogout={() => {}} />
      
      <div style={containerStyle}>
        <h1 style={titleStyle}>Checkout</h1>
        
        {!orderCreated ? (
          <div style={checkoutContainerStyle}>
            {/* Order Summary */}
            <div style={orderSummaryStyle}>
              <h2 style={sectionTitleStyle}>Order Summary</h2>
              <div style={orderItemsStyle}>
                {cart.map(item => (
                  <div key={item.id} style={orderItemStyle}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={itemImageStyle}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div style={itemDetailsStyle}>
                      <div style={itemNameStyle}>{item.name}</div>
                      <div style={itemQuantityStyle}>Qty: {item.quantity}</div>
                    </div>
                    <div style={itemPriceStyle}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={totalSectionStyle}>
                <div style={totalRowStyle}>
                  <span>Subtotal:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div style={totalRowStyle}>
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div style={finalTotalStyle}>
                  <span>Total:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div style={shippingFormStyle}>
              <h2 style={sectionTitleStyle}>Shipping Information</h2>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Shipping Address *</label>
                <textarea
                  style={textareaStyle}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your complete shipping address..."
                  rows={4}
                />
              </div>

              {error && (
                <div style={errorStyle}>
                  {error}
                </div>
              )}

              <div style={buttonGroupStyle}>
                <button 
                  style={backButtonStyle}
                  onClick={handleBackToCart}
                  disabled={loading}
                >
                  Back to Cart
                </button>
                <button 
                  style={{
                    ...proceedButtonStyle,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  onClick={handleCreateOrder}
                  disabled={loading}
                >
                  {loading ? 'Creating Order...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Payment Section */
          <div style={paymentSectionStyle}>
            <div style={successIconStyle}>✅</div>
            <h2 style={successTitleStyle}>Order Created Successfully!</h2>
            <p style={successMessageStyle}>
              Your order #{orderId.substring(0, 8)} has been created.
              Click the button below to complete your payment.
            </p>
            
            <div style={paymentDetailsStyle}>
              <div style={paymentRowStyle}>
                <span>Order Total:</span>
                <span style={paymentAmountStyle}>${cartTotal.toFixed(2)}</span>
              </div>
              <div style={paymentRowStyle}>
                <span>Payment Method:</span>
                <span>Paymob (Credit/Debit Card)</span>
              </div>
            </div>

            <button 
              style={payNowButtonStyle}
              onClick={handlePayNow}
            >
              Pay Now
            </button>
            
            <p style={paymentNoteStyle}>
              You will be redirected to Paymob's secure payment gateway
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  padding: '48px 24px',
  maxWidth: 1200,
  margin: '0 auto',
};

const titleStyle = {
  color: '#ff9800',
  fontSize: 36,
  marginBottom: 32,
  textAlign: 'center',
};

const checkoutContainerStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 32,
  alignItems: 'start',
};

const orderSummaryStyle = {
  background: '#232526',
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.4)',
};

const shippingFormStyle = {
  background: '#232526',
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.4)',
};

const sectionTitleStyle = {
  color: '#fff',
  fontSize: 24,
  marginBottom: 20,
  margin: '0 0 20px 0',
};

const orderItemsStyle = {
  marginBottom: 24,
};

const orderItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 0',
  borderBottom: '1px solid #333',
};

const itemImageStyle = {
  width: 60,
  height: 60,
  objectFit: 'cover',
  borderRadius: 8,
};

const itemDetailsStyle = {
  flex: 1,
};

const itemNameStyle = {
  color: '#fff',
  fontSize: 16,
  marginBottom: 4,
};

const itemQuantityStyle = {
  color: '#ccc',
  fontSize: 14,
};

const itemPriceStyle = {
  color: '#ff9800',
  fontSize: 16,
  fontWeight: 'bold',
};

const totalSectionStyle = {
  borderTop: '1px solid #333',
  paddingTop: 16,
};

const totalRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 8,
  color: '#ccc',
};

const finalTotalStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 20,
  fontWeight: 'bold',
  color: '#ff9800',
  borderTop: '1px solid #333',
  paddingTop: 12,
  marginTop: 12,
};

const formGroupStyle = {
  marginBottom: 20,
};

const labelStyle = {
  display: 'block',
  color: '#fff',
  fontSize: 16,
  marginBottom: 8,
  fontWeight: '500',
};

const textareaStyle = {
  width: '100%',
  background: '#1a1a1a',
  border: '2px solid #333',
  borderRadius: 8,
  padding: 12,
  color: '#fff',
  fontSize: 16,
  resize: 'vertical',
  minHeight: 100,
  fontFamily: 'inherit',
};

const errorStyle = {
  color: '#ff5252',
  fontSize: 14,
  marginBottom: 16,
  padding: 12,
  background: 'rgba(255, 82, 82, 0.1)',
  borderRadius: 8,
  border: '1px solid #ff5252',
};

const buttonGroupStyle = {
  display: 'flex',
  gap: 16,
  marginTop: 24,
};

const backButtonStyle = {
  flex: 1,
  background: 'transparent',
  color: '#ff9800',
  border: '2px solid #ff9800',
  borderRadius: 8,
  padding: '12px 24px',
  fontSize: 16,
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const proceedButtonStyle = {
  flex: 1,
  background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
  color: '#222',
  border: 'none',
  borderRadius: 8,
  padding: '12px 24px',
  fontSize: 16,
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const paymentSectionStyle = {
  background: '#232526',
  borderRadius: 16,
  padding: 48,
  textAlign: 'center',
  maxWidth: 600,
  margin: '0 auto',
  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.4)',
};

const successIconStyle = {
  fontSize: 64,
  marginBottom: 24,
};

const successTitleStyle = {
  color: '#4caf50',
  fontSize: 28,
  marginBottom: 16,
  margin: '0 0 16px 0',
};

const successMessageStyle = {
  color: '#ccc',
  fontSize: 16,
  lineHeight: 1.6,
  marginBottom: 32,
};

const paymentDetailsStyle = {
  background: '#1a1a1a',
  borderRadius: 8,
  padding: 20,
  marginBottom: 32,
};

const paymentRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 12,
  color: '#ccc',
};

const paymentAmountStyle = {
  color: '#ff9800',
  fontWeight: 'bold',
  fontSize: 18,
};

const payNowButtonStyle = {
  background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '16px 48px',
  fontSize: 18,
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
  transition: 'all 0.2s',
  marginBottom: 16,
};

const paymentNoteStyle = {
  color: '#aaa',
  fontSize: 14,
  fontStyle: 'italic',
};

export default Checkout;