import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MobileWalletPayment.css';

const MobileWalletPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [walletNumber, setWalletNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const paymentToken = searchParams.get('token');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (!paymentToken || !amount) {
      console.error('Missing payment token or amount');
      navigate('/');
    }
  }, [paymentToken, amount, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'http://localhost:4000/api/orders/mobile-wallet-pay',
        {
          paymentKey: paymentToken,
          walletNumber: walletNumber
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.success) {
        alert('Payment initiated! Please check your mobile wallet for confirmation.');
        navigate('/payment-success?type=mobile-wallet&status=initiated');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Payment failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatWalletNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits[0] !== '0') return '01';
    if (digits.length === 1) return '01';
    if (digits.substring(0, 2) !== '01') return '01' + digits.substring(1, 10);
    return digits.substring(0, 11);
  };

  const handleWalletNumberChange = (e) => {
    const formatted = formatWalletNumber(e.target.value);
    setWalletNumber(formatted);
  };

  if (!paymentToken || !amount) {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <h2 className="payment-error-title">Invalid Payment Request</h2>
          <p className="payment-error-message">Missing payment information. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h2 className="payment-title">Mobile Wallet Payment</h2>
          <p className="payment-subtitle">Pay securely with your mobile wallet</p>
        </div>
        <div className="payment-amount-box">
          <p className="payment-amount-label">Amount to pay:</p>
          <p className="payment-amount-value">{amount} EGP</p>
        </div>
        <form onSubmit={handlePayment} className="payment-form">
          <div className="payment-form-group">
            <label className="payment-label">Mobile Wallet Number</label>
            <input
              type="tel"
              value={walletNumber}
              onChange={handleWalletNumberChange}
              placeholder="01xxxxxxxxx"
              className="payment-input"
              required
              pattern="^01[0-9]{9}$"
              maxLength="11"
            />
            <div className="payment-wallet-types">
              <span className="wallet-type vodafone">🔵 Vodafone Cash</span>
              <span className="wallet-type orange">🟠 Orange Money</span>
              <span className="wallet-type etisalat">🟢 Etisalat Cash</span>
            </div>
            <div className="payment-wallet-hint">Enter your 11-digit mobile wallet number</div>
          </div>
          {error && (
            <div className="payment-error-box">
              <span className="payment-error-icon">❌</span>
              <span>{error}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={loading || walletNumber.length !== 11}
            className="btn btn-primary payment-pay-btn"
          >
            {loading ? (
              <span className="payment-loading-spinner">
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </span>
            ) : (
              'Pay Now 📱'
            )}
          </button>
        </form>
        <div className="payment-footer">
          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-outline payment-back-btn"
          >
            ← Back to Checkout
          </button>
          <div className="payment-how-it-works">
            <p className="payment-how-title">📱 How it works:</p>
            <ol className="payment-how-list">
              <li>Enter your mobile wallet number</li>
              <li>Click "Pay Now"</li>
              <li>You'll receive an SMS with payment confirmation</li>
              <li>Approve the payment on your mobile wallet app</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileWalletPayment;