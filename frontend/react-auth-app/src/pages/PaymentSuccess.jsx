import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('verifying'); // verifying, success, failed
  const [orderDetails, setOrderDetails] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ADD THESE NEW VARIABLES FOR MOBILE WALLET
  const paymentType = searchParams.get('type');
  const mobileWalletStatus = searchParams.get('status');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const verifyPayment = async () => {
      try {
        // Get payment parameters from URL
        const success = searchParams.get('success');
        const orderId = searchParams.get('order');
        const transactionId = searchParams.get('id');

        console.log('Payment parameters:', { success, orderId, transactionId, paymentType, mobileWalletStatus });

        // ADD THIS CONDITION FOR MOBILE WALLET
        if (paymentType === 'mobile-wallet') {
          if (mobileWalletStatus === 'initiated') {
            setPaymentStatus('mobile-wallet-initiated');
          } else {
            setPaymentStatus('success');
          }
          setLoading(false);
          return;
        }

        if (success === 'true' && orderId) {
          // Payment was successful, complete the order
          try {
            const response = await axios.post(`/api/orders/complete/${orderId}`, {}, {
              withCredentials: true
            });

            if (response.data.success) {
              setPaymentStatus('success');
              // Fetch order details
              fetchOrderDetails(orderId);
            } else {
              setPaymentStatus('failed');
            }
          } catch (error) {
            console.error('Error completing order:', error);
            setPaymentStatus('failed');
          }
        } else {
          // Payment failed or was cancelled
          setPaymentStatus('failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setPaymentStatus('failed');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [user, searchParams, navigate, paymentType, mobileWalletStatus]); // ADD DEPENDENCIES

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get('/api/orders/history', {
        withCredentials: true
      });

      if (response.data.success) {
        const order = response.data.data.find(o => o.id === orderId);
        setOrderDetails(order);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/profile');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="payment-page-container">
      <Navbar onSearch={() => {}} onLogout={() => {}} />
      
      <div className="payment-container">
        {loading && (
          <div className="payment-status-container">
            <div className="payment-loading-icon">⏳</div>
            <h1 className="payment-status-title">Verifying Payment...</h1>
            <p className="payment-status-message">
              Please wait while we verify your payment status.
            </p>
            <div className="payment-loader"></div>
          </div>
        )}

        {/* ADD THIS NEW MOBILE WALLET STATUS SECTION */}
        {!loading && paymentStatus === 'mobile-wallet-initiated' && (
          <div className="payment-status-container">
            <div className="payment-mobilewallet-icon">📱</div>
            <h1 className="payment-mobilewallet-title">Mobile Wallet Payment Initiated</h1>
            <p className="payment-mobilewallet-message">
              Your payment request has been sent to your mobile wallet. Please check your phone for the payment confirmation.
            </p>
            
            <div className="payment-mobilewallet-steps">
              <h3 className="payment-steps-header">Next Steps:</h3>
              <div className="payment-step">
                <span className="payment-step-icon">1️⃣</span>
                <span>Check your mobile phone for an SMS notification</span>
              </div>
              <div className="payment-step">
                <span className="payment-step-icon">2️⃣</span>
                <span>Open your mobile wallet app (Vodafone Cash, Orange Money, etc.)</span>
              </div>
              <div className="payment-step">
                <span className="payment-step-icon">3️⃣</span>
                <span>Confirm the payment request</span>
              </div>
              <div className="payment-step">
                <span className="payment-step-icon">✅</span>
                <span>Your order will be automatically confirmed</span>
              </div>
            </div>

            <div className="payment-mobilewallet-notice">
              <p className="payment-notice-text">
                <strong>Note:</strong> This window will automatically update once your payment is confirmed. 
                You can also check your order status in your profile.
              </p>
            </div>

            <div className="payment-action-buttons">
              <button className="btn btn-outline payment-continue-shopping" onClick={handleContinueShopping}>
                Continue Shopping
              </button>
              <button className="btn btn-primary payment-view-orders" onClick={handleViewOrders}>
                Check Order Status
              </button>
            </div>
          </div>
        )}

        {!loading && paymentStatus === 'success' && (
          <div className="payment-status-container">
            <div className="payment-success-icon">✅</div>
            <h1 className="payment-success-title">Payment Successful!</h1>
            <p className="payment-success-message">
              Thank you for your purchase! Your payment has been processed successfully and your order is confirmed.
            </p>
            
            {/* ADD MOBILE WALLET SUCCESS SECTION */}
            {paymentType === 'mobile-wallet' && (
              <div className="payment-mobilewallet-success">
                <h3 className="payment-mobilewallet-success-header">📱 Mobile Wallet Payment</h3>
                <p className="payment-mobilewallet-success-text">
                  Your mobile wallet payment has been completed successfully!
                </p>
              </div>
            )}
            
            {orderDetails && (
              <div className="payment-order-details">
                <h3 className="payment-order-details-title">Order Details</h3>
                <div className="payment-order-info">
                  <div className="payment-order-row">
                    <span>Order ID:</span>
                    <span className="payment-order-value">#{orderDetails.id.substring(0, 8)}</span>
                  </div>
                  <div className="payment-order-row">
                    <span>Total Amount:</span>
                    <span className="payment-order-value">${orderDetails.totalAmount}</span>
                  </div>
                  <div className="payment-order-row">
                    <span>Status:</span>
                    <span className="payment-status-badge">{orderDetails.status}</span>
                  </div>
                  <div className="payment-order-row">
                    <span>Order Date:</span>
                    <span className="payment-order-value">
                      {new Date(orderDetails.orderDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {orderDetails.items && orderDetails.items.length > 0 && (
                  <div className="payment-order-items">
                    <h4 className="payment-items-title">Items Ordered:</h4>
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="payment-order-item">
                        <img 
                          src={item.photo} 
                          alt={item.name} 
                          className="payment-item-image"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div className="payment-item-info">
                          <div className="payment-item-name">{item.name}</div>
                          <div className="payment-item-quantity">Qty: {item.quantity}</div>
                        </div>
                        <div className="payment-item-price">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="payment-action-buttons">
              <button className="btn btn-outline payment-continue-shopping" onClick={handleContinueShopping}>
                Continue Shopping
              </button>
              <button className="btn btn-primary payment-view-orders" onClick={handleViewOrders}>
                View All Orders
              </button>
            </div>
          </div>
        )}

        {!loading && paymentStatus === 'failed' && (
          <div className="payment-status-container">
            <div className="payment-error-icon">❌</div>
            <h1 className="payment-error-title">Payment Failed</h1>
            <p className="payment-error-message">
              Unfortunately, your payment could not be processed. This could be due to insufficient funds, card issues, or payment cancellation.
            </p>
            <div className="payment-action-buttons">
              <button className="btn btn-danger payment-retry-button" onClick={() => navigate('/cart')}>
                Try Again
              </button>
              <button className="btn btn-outline payment-continue-shopping" onClick={handleContinueShopping}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;