import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import EmptyCart from '../components/cart/EmptyCart';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const [loading, setLoading] = useState(true);
  const [stockLimitAlert, setStockLimitAlert] = useState({ 
    show: false, 
    product: null,
    availableStock: 0 
  });
  // Add state for authentication popup
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  
  const navigate = useNavigate();
  
  // Get user status from AuthContext
  const { user } = useAuth();
  
  // Use the cart context
  const { 
    cart, 
    cartTotal, 
    updateQuantity, 
    removeFromCart 
  } = useCart();

  useEffect(() => {
    // Simulate API delay for loading effect
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const handleContinueShopping = () => {
    navigate('/products');
  };
  
  const handleCheckout = () => {
    if (!user) {
      // If no user is logged in, show auth popup
      setShowAuthPopup(true);
    } else {
      // User is logged in, proceed to checkout
      navigate('/checkout');
    }
  };
  
  const handleLogin = () => {
    navigate('/login', { state: { returnTo: '/cart' } });
  };
  
  const handleSignup = () => {
    navigate('/register', { state: { returnTo: '/cart' } });
  };
  
  const handleClosePopup = () => {
    setShowAuthPopup(false);
  };
  
  const handleUpdateQuantity = (productId, newQuantity) => {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    // Check if new quantity exceeds stock
    if (newQuantity > item.maxStock) {
      setStockLimitAlert({
        show: true,
        product: item,
        availableStock: item.maxStock
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setStockLimitAlert({ show: false, product: null, availableStock: 0 });
      }, 3000);
      
      return;
    }
    
    // Otherwise update quantity normally
    updateQuantity(productId, newQuantity);
  };

  // Main render
  return (
    <div style={{ background: '#181A1B', minHeight: '100vh' }}>
      <Navbar onSearch={() => {}} onLogout={() => {}} />
      
      {/* Stock Limit Alert */}
      {stockLimitAlert.show && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#232526',
            borderLeft: '4px solid #ff5252',
            borderRadius: '4px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '320px',
            animation: 'slideIn 0.3s ease-out forwards',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={stockLimitAlert.product?.image} 
              alt={stockLimitAlert.product?.name}
              style={{
                width: '40px',
                height: '40px',
                objectFit: 'cover',
                borderRadius: '4px',
              }}
            />
            <div style={{ flex: 1 }}>
              <p style={{
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
                margin: 0,
              }}>
                Stock Limit Reached
              </p>
              <p style={{
                color: '#ff5252',
                fontSize: '14px',
                margin: '4px 0 0 0',
              }}>
                Only {stockLimitAlert.availableStock} units available
              </p>
            </div>
          </div>
          <div style={{
            backgroundColor: '#ff5252',
            color: 'white',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}>
            !
          </div>
        </div>
      )}
      
      {/* Auth Popup */}
      {showAuthPopup && (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <button 
              style={closeButtonStyle} 
              onClick={handleClosePopup}
            >
              ✕
            </button>
            <h2 style={popupTitleStyle}>Sign In Required</h2>
            <p style={popupTextStyle}>
              Please login or create an account to complete your purchase.
            </p>
            <div style={popupButtonsContainerStyle}>
              <button 
                style={loginButtonStyle}
                onClick={handleLogin}
              >
                Login
              </button>
              <button 
                style={signupButtonStyle}
                onClick={handleSignup}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div style={containerStyle}>
        <h1 style={{ color: '#ff9800', fontSize: 36, marginBottom: 24 }}>Your Shopping Cart</h1>
        
        {loading && (
          <div style={{ color: '#ccc', textAlign: 'center', padding: '32px' }}>Loading your cart...</div>
        )}
        
        {!loading && cart.length === 0 && (
          <EmptyCart onContinueShopping={handleContinueShopping} />
        )}
        
        {!loading && cart.length > 0 && (
          <div style={cartContainerStyle}>
            {/* Cart items */}
            <div>
              {cart.map(item => (
                <CartItem 
                  key={item.id} 
                  item={{
                    ...item, 
                    // Fix: Use the maxStock property that was set when adding to cart
                    maxStock: item.maxStock || item.quantity 
                  }} 
                  onUpdateQuantity={handleUpdateQuantity} 
                  onRemoveItem={removeFromCart} 
                />
              ))}
            </div>
            
            {/* Cart summary */}
            <CartSummary 
              totalAmount={cartTotal.toFixed(2)} 
              onCheckout={handleCheckout} // Pass the checkout handler to CartSummary
            />
          </div>
        )}
      </div>
    </div>
  );
};

// New styles for the popup
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1001,
  backdropFilter: 'blur(4px)',
};

const popupStyle = {
  backgroundColor: '#232526',
  borderRadius: 16,
  padding: 32,
  width: '90%',
  maxWidth: 400,
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  animation: 'fadeIn 0.3s ease-out forwards',
};

const closeButtonStyle = {
  position: 'absolute',
  top: 16,
  right: 16,
  background: 'none',
  border: 'none',
  color: '#aaa',
  fontSize: 20,
  cursor: 'pointer',
};

const popupTitleStyle = {
  color: '#ff9800',
  fontSize: 24,
  marginTop: 0,
  marginBottom: 16,
  textAlign: 'center',
};

const popupTextStyle = {
  color: '#ccc',
  fontSize: 16,
  lineHeight: 1.5,
  marginBottom: 24,
  textAlign: 'center',
};

const popupButtonsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const loginButtonStyle = {
  backgroundColor: '#ff9800',
  color: '#222',
  border: 'none',
  borderRadius: 8,
  padding: '12px 0',
  fontSize: 16,
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const signupButtonStyle = {
  backgroundColor: 'transparent',
  color: '#ff9800',
  border: '2px solid #ff9800',
  borderRadius: 8,
  padding: '12px 0',
  fontSize: 16,
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

// Existing styles
const containerStyle = {
  padding: '48px 24px',
  maxWidth: 1200,
  margin: '0 auto',
  textAlign: 'center',
};

const cartContainerStyle = {
  background: '#232526',
  borderRadius: 16,
  boxShadow: '0 2px 24px #0008',
  overflow: 'hidden',
  marginBottom: 32,
};

export default Cart;