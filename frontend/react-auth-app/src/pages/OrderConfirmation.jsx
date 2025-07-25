import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const OrderConfirmation = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, completed, failed
  
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Simulate checking payment status
    const checkPaymentStatus = async () => {
      try {
        // For now, we'll simulate payment completion after 5 seconds
        setTimeout(() => {
          setPaymentStatus('completed');
          completeOrder();
        }, 5000);
      } catch (error) {
        console.error('Error checking payment status:', error);
        setPaymentStatus('failed');
      }
    };

    checkPaymentStatus();
  }, [user, orderId, navigate]);

  const completeOrder = async () => {
    try {
      const response = await axios.post(`/api/orders/complete/${orderId}`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        setPaymentStatus('completed');
        // Fetch order details for display
        fetchOrderDetails();
      }
    } catch (error) {
      console.error('Error completing order:', error);
      setPaymentStatus('failed');
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get('/api/orders/history', {
        withCredentials: true
      });

      if (response.data.success) {
        const userOrder = response.data.data.find(o => o.id === orderId);
        setOrder(userOrder);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleViewOrders = () => {
    navigate('/profile');
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ background: '#181A1B', minHeight: '100vh' }}>
      <Navbar onSearch={() => {}} onLogout={() => {}} />
      
      <div style={containerStyle}>
        {paymentStatus === 'pending' && (
          <div style={statusContainerStyle}>
            <div style={loadingIconStyle}>⏳</div>
            <h1 style={statusTitleStyle}>Processing Payment...</h1>
            <p style={statusMessageStyle}>
              Please wait while we confirm your payment. This may take a few moments.
            </p>
            <div style={loaderStyle}></div>
          </div>
        )}

        {paymentStatus === 'completed' && (
          <div style={statusContainerStyle}>
            <div style={successIconStyle}>✅</div>
            <h1 style={successTitleStyle}>Order Confirmed!</h1>
            <p style={successMessageStyle}>
              Thank you for your purchase! Your order has been successfully placed and confirmed.
            </p>
            
            {order && (
              <div style={orderDetailsStyle}>
                <h3 style={orderDetailsTitleStyle}>Order Details</h3>
                <div style={orderInfoStyle}>
                  <div style={orderRowStyle}>
                    <span>Order ID:</span>
                    <span style={orderValueStyle}>#{order.id.substring(0, 8)}</span>
                  </div>
                  <div style={orderRowStyle}>
                    <span>Total Amount:</span>
                    <span style={orderValueStyle}>${order.totalAmount}</span>
                  </div>
                  <div style={orderRowStyle}>
                    <span>Status:</span>
                    <span style={statusBadgeStyle}>{order.status}</span>
                  </div>
                  <div style={orderRowStyle}>
                    <span>Order Date:</span>
                    <span style={orderValueStyle}>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div style={orderItemsStyle}>
                    <h4 style={itemsTitleStyle}>Items Ordered:</h4>
                    {order.items.map((item, index) => (
                      <div key={index} style={orderItemStyle}>
                        <img 
                          src={item.photo} 
                          alt={item.name} 
                          style={itemImageStyle}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div style={itemInfoStyle}>
                          <div style={itemNameStyle}>{item.name}</div>
                          <div style={itemQuantityStyle}>Qty: {item.quantity}</div>
                        </div>
                        <div style={itemPriceStyle}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={actionButtonsStyle}>
              <button style={continueShoppingStyle} onClick={handleContinueShopping}>
                Continue Shopping
              </button>
              <button style={viewOrdersStyle} onClick={handleViewOrders}>
                View All Orders
              </button>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div style={statusContainerStyle}>
            <div style={errorIconStyle}>❌</div>
            <h1 style={errorTitleStyle}>Payment Failed</h1>
            <p style={errorMessageStyle}>
              We couldn't process your payment. Please try again or contact support.
            </p>
            <div style={actionButtonsStyle}>
              <button style={retryButtonStyle} onClick={() => navigate('/cart')}>
                Try Again
              </button>
              <button style={continueShoppingStyle} onClick={handleContinueShopping}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  padding: '48px 24px',
  maxWidth: 800,
  margin: '0 auto',
  textAlign: 'center',
};

const statusContainerStyle = {
  background: '#232526',
  borderRadius: 16,
  padding: 48,
  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.4)',
};

const loadingIconStyle = {
  fontSize: 64,
  marginBottom: 24,
  animation: 'pulse 2s infinite',
};

const successIconStyle = {
  fontSize: 64,
  marginBottom: 24,
};

const errorIconStyle = {
  fontSize: 64,
  marginBottom: 24,
};

const statusTitleStyle = {
  color: '#ff9800',
  fontSize: 32,
  marginBottom: 16,
  margin: '0 0 16px 0',
};

const successTitleStyle = {
  color: '#4caf50',
  fontSize: 32,
  marginBottom: 16,
  margin: '0 0 16px 0',
};

const errorTitleStyle = {
  color: '#ff5252',
  fontSize: 32,
  marginBottom: 16,
  margin: '0 0 16px 0',
};

const statusMessageStyle = {
  color: '#ccc',
  fontSize: 18,
  lineHeight: 1.6,
  marginBottom: 32,
};

const successMessageStyle = {
  color: '#ccc',
  fontSize: 18,
  lineHeight: 1.6,
  marginBottom: 32,
};

const errorMessageStyle = {
  color: '#ccc',
  fontSize: 18,
  lineHeight: 1.6,
  marginBottom: 32,
};

const loaderStyle = {
  width: 40,
  height: 40,
  border: '4px solid #333',
  borderTop: '4px solid #ff9800',
  borderRadius: '50%',
  margin: '0 auto',
  animation: 'spin 1s linear infinite',
};

const orderDetailsStyle = {
  background: '#1a1a1a',
  borderRadius: 12,
  padding: 24,
  marginBottom: 32,
  textAlign: 'left',
};

const orderDetailsTitleStyle = {
  color: '#fff',
  fontSize: 20,
  marginBottom: 16,
  margin: '0 0 16px 0',
};

const orderInfoStyle = {
  marginBottom: 24,
};

const orderRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 12,
  color: '#ccc',
};

const orderValueStyle = {
  color: '#fff',
  fontWeight: 'bold',
};

const statusBadgeStyle = {
  background: '#4caf50',
  color: '#fff',
  padding: '4px 12px',
  borderRadius: 16,
  fontSize: 12,
  fontWeight: 'bold',
  textTransform: 'uppercase',
};

const orderItemsStyle = {
  borderTop: '1px solid #333',
  paddingTop: 16,
};

const itemsTitleStyle = {
  color: '#fff',
  fontSize: 16,
  marginBottom: 12,
  margin: '0 0 12px 0',
};

const orderItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '8px 0',
  borderBottom: '1px solid #333',
};

const itemImageStyle = {
  width: 50,
  height: 50,
  objectFit: 'cover',
  borderRadius: 6,
};

const itemInfoStyle = {
  flex: 1,
  textAlign: 'left',
};

const itemNameStyle = {
  color: '#fff',
  fontSize: 14,
  marginBottom: 4,
};

const itemQuantityStyle = {
  color: '#aaa',
  fontSize: 12,
};

const itemPriceStyle = {
  color: '#ff9800',
  fontSize: 14,
  fontWeight: 'bold',
};

const actionButtonsStyle = {
  display: 'flex',
  gap: 16,
  justifyContent: 'center',
  flexWrap: 'wrap',
};

const continueShoppingStyle = {
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

const viewOrdersStyle = {
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

const retryButtonStyle = {
  background: 'linear-gradient(90deg, #ff5252 0%, #ff7043 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '12px 24px',
  fontSize: 16,
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

export default OrderConfirmation;