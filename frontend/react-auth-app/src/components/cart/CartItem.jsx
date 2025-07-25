import React, { useState } from 'react';

const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const [showStockWarning, setShowStockWarning] = useState(false);
  
  const handleIncrement = () => {
    // Check if we're already at max stock
    if (item.quantity >= item.maxStock) {
      setShowStockWarning(true);
      // Hide warning after 3 seconds
      setTimeout(() => setShowStockWarning(false), 3000);
      return;
    }
    
    onUpdateQuantity(item.id, item.quantity + 1);
  };
  
  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    } else {
      onRemoveItem(item.id);
    }
  };

  // Render the cart item
  return (
    <div style={cartItemStyle}>
      <div style={itemDetailsStyle}>
        <img 
          src={item.image} 
          alt={item.name} 
          style={itemImageStyle}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=400&q=80';
          }}
        />
        <div style={itemInfoStyle}>
          <h3 style={itemNameStyle}>{item.name}</h3>
          <p style={itemPriceStyle}>${item.price.toFixed(2)}</p>
          {showStockWarning && (
            <p style={stockWarningStyle}>
              Stock limit reached! Only {item.maxStock} units available.
            </p>
          )}
        </div>
      </div>
      
      <div style={quantityControlsStyle}>
        <button
          style={quantityButtonStyle}
          onClick={handleDecrement}
        >
          -
        </button>
        <span style={quantityTextStyle}>{item.quantity}</span>
        <button
          style={{
            ...quantityButtonStyle,
            opacity: item.quantity >= item.maxStock ? 0.5 : 1,
            cursor: item.quantity >= item.maxStock ? 'not-allowed' : 'pointer'
          }}
          onClick={handleIncrement}
        >
          +
        </button>
      </div>
      
      <div style={totalPriceContainerStyle}>
        <p style={totalPriceStyle}>${(item.price * item.quantity).toFixed(2)}</p>
        <button
          style={removeButtonStyle}
          onClick={() => onRemoveItem(item.id)}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

// Styles
const cartItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '24px',
  borderBottom: '1px solid #333',
  position: 'relative',
};

const itemDetailsStyle = {
  display: 'flex',
  alignItems: 'center',
  flex: 2,
  textAlign: 'left',
};

const itemImageStyle = {
  width: '80px',
  height: '80px',
  objectFit: 'cover',
  borderRadius: '8px',
  marginRight: '16px',
};

const itemInfoStyle = {
  flex: 1,
};

const itemNameStyle = {
  color: '#fff',
  fontSize: '18px',
  margin: 0,
};

const itemPriceStyle = {
  color: '#ff9800',
  fontSize: '16px',
  margin: '8px 0 0 0',
};

const quantityControlsStyle = {
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  justifyContent: 'center',
};

const quantityButtonStyle = {
  backgroundColor: '#ff9800',
  color: '#222',
  border: 'none',
  borderRadius: '4px',
  width: '32px',
  height: '32px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const quantityTextStyle = {
  color: '#fff',
  fontSize: '16px',
  margin: '0 16px',
};

const totalPriceContainerStyle = {
  flex: 1,
  textAlign: 'right',
};

const totalPriceStyle = {
  color: '#ff9800',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const removeButtonStyle = {
  background: '#222222',
  color: '#ff5252',
  padding: '4px 12px',
  border: 'none',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
borderRadius: 8,
  marginTop: 8,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
};

const stockWarningStyle = {
  color: '#ff5252',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '4px 0 0 0',
};

export default CartItem;