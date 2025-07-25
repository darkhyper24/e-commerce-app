import React, { useState, useEffect, useRef, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const Products = () => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCartSummary, setShowCartSummary] = useState(false);
  const [stockLimitAlert, setStockLimitAlert] = useState({ 
    show: false, 
    product: null,
    availableStock: 0 
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    cart = [], 
    cartTotal = 0 
  } = useCart();
  
  // Create refs for products to scroll to
  const productRefs = useRef({});
  const hasScrolledRef = useRef(false);
  
  // Get the selected product ID from URL
  const params = new URLSearchParams(location.search);
  const selectedProductId = params.get('id');
  
  // Load products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get('/api/', {
          withCredentials: true
        });
        
        if (response.data && response.data.success) {
          // Transform the data to match our expected format
          const transformedProducts = response.data.data.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price / 100, // Convert from cents to dollars
            image: product.photo || 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=400&q=80',
            description: product.description,
            category: product.category,
            quantity: product.quantity,
            // Create specs array from product properties
            specs: [
              `Category: ${product.category}`,
              `Stock: ${product.quantity} units`,
              // Add additional specs if available
              ...(product.category === 'GPU' ? ['Ray Tracing Enabled', 'DLSS Support'] : []),
              ...(product.category === 'CPU' ? ['High Performance', 'Multi-threading Support'] : []),
              ...(product.category === 'Storage' ? ['Fast Read/Write', 'Durable Design'] : []),
            ]
          }));
          setProducts(transformedProducts);
        } else {
          setError('Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
  // Handle scrolling in a separate effect
  useEffect(() => {
    if (selectedProductId && !loading && !hasScrolledRef.current) {
      // Small delay to ensure DOM is ready
      const scrollTimer = setTimeout(() => {
        const targetElement = productRefs.current[selectedProductId];
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
          hasScrolledRef.current = true;
        }
      }, 100);
      
      return () => clearTimeout(scrollTimer);
    }
  }, [selectedProductId, loading]);
  
  // Reset scroll tracking when URL changes
  useEffect(() => {
    hasScrolledRef.current = false;
  }, [location.search]);

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
  };

  const handleDecrementQuantity = (productId) => {
    const currentQuant = cartQuantities[productId] || 0;
    if (currentQuant <= 1) {
      // Remove from cart if quantity would go to 0
      removeFromCart(productId);
    } else {
      updateQuantity(productId, currentQuant - 1);
    }
  };
  
  const handleIncrementQuantity = (product) => {
    const currentQuant = cartQuantities[product.id] || 0;
    
    // Check if adding one more would exceed available stock
    if (currentQuant + 1 > product.quantity) {
      // Show stock limit notification
      setStockLimitAlert({
        show: true,
        product: product,
        availableStock: product.quantity
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setStockLimitAlert({ show: false, product: null, availableStock: 0 });
      }, 3000);
      
      return;
    }
    
    if (currentQuant === 0) {
      // If not in cart yet, add it
      handleAddToCart(product);
    } else {
      // Otherwise just increment
      updateQuantity(product.id, currentQuant + 1, product.quantity);
    }
  };
  
  const handleAddToCart = (product) => {
    // Check if adding would exceed available stock
    const currentQuant = cartQuantities[product.id] || 0;
    if (currentQuant + 1 > product.quantity) {
      setStockLimitAlert({
        show: true,
        product: product,
        availableStock: product.quantity
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setStockLimitAlert({ show: false, product: null, availableStock: 0 });
      }, 3000);
      
      return;
    }
    
    // If we have stock, proceed with adding to cart
    addToCart(product);
    setShowCartSummary(true);
  };
  
  const goToCart = () => {
    navigate('/cart');
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  
  // Check if cart has items on component mount
  useEffect(() => {
    if ((cart?.length > 0) && totalItems > 0) {
      setShowCartSummary(true);
    }
  }, []);

  // Calculate total items in cart
  const totalItems = cart?.reduce((sum, item) => sum + (item?.quantity || 0), 0) || 0;

  // Map to get current quantity for each product in cart
  const cartQuantities = useMemo(() => {
    const quantMap = {};
    cart.forEach(item => {
      quantMap[item.id] = item.quantity;
    });
    return quantMap;
  }, [cart]);

  return (
    <div style={{ background: '#181A1B', minHeight: '100vh', position: 'relative', paddingBottom: '80px' }}>
      <Navbar onSearch={handleSearch} onLogout={() => {}} />
      
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
      
      <div style={containerStyle}>
        <h1 style={{ color: '#ff9800', fontSize: 36, marginBottom: 24, textAlign: 'center' }}>
          Our Products
        </h1>
        
        {loading ? (
          <div style={{ color: '#ccc', textAlign: 'center', padding: '32px' }}>
            Loading products...
          </div>
        ) : error ? (
          <div style={{ color: '#ff5252', textAlign: 'center', padding: '32px' }}>
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ color: '#ccc', textAlign: 'center', padding: '32px' }}>
            No products found matching "{search}".
          </div>
        ) : (
          <div style={productsContainerStyle}>
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                style={{
                  ...productCardStyle,
                  boxShadow: product.id === selectedProductId 
                    ? '0 0 0 3px #ff9800, 0 2px 16px rgba(0, 0, 0, 0.4)' 
                    : '0 2px 16px rgba(0, 0, 0, 0.4)'
                }}
                ref={el => productRefs.current[product.id] = el}
              >
                {/* Product image container */}
                <div style={productImageContainerStyle}>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    style={productImageStyle}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
                
                {/* Product info container */}
                <div style={productContentStyle}>
                  <h2 style={productTitleStyle}>{product.name}</h2>
                  <p style={productPriceStyle}>${product.price.toFixed(2)}</p>
                  
                  <div style={productDescriptionStyle}>
                    <h3 style={sectionTitleStyle}>Description</h3>
                    <p style={descriptionTextStyle}>{product.description}</p>
                  </div>
                  
                  <div style={productSpecsStyle}>
                    <h3 style={sectionTitleStyle}>Specifications</h3>
                    <ul style={specListStyle}>
                      {product.specs.map((spec, index) => (
                        <li key={index} style={specItemStyle}>{spec}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Replace button with quantity controls */}
                  <div style={quantityControlsStyle}>
                    {product.quantity <= 0 ? (
                      <div style={outOfStockStyle}>Out of Stock</div>
                    ) : cartQuantities[product.id] ? (
                      <>
                        <button 
                          style={quantityBtnStyle}
                          onClick={() => handleDecrementQuantity(product.id)}
                        >
                          -
                        </button>
                        <span style={quantityDisplayStyle}>
                          {cartQuantities[product.id]}
                        </span>
                        <button 
                          style={quantityBtnStyle}
                          onClick={() => handleIncrementQuantity(product)}
                        >
                          +
                        </button>
                      </>
                    ) : (
                      <button 
                        style={addToCartBtnStyle}
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Dynamic Cart Summary Button */}
      {totalItems > 0 && (
        <div 
          style={{
            ...cartSummaryContainerStyle,
            opacity: showCartSummary ? 1 : 0,
            transform: showCartSummary ? 'translateY(0)' : 'translateY(100%)',
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
          }}
        >
          <button 
            style={cartSummaryButtonStyle}
            onClick={goToCart}
          >
            <div style={cartItemsCountStyle}>
              <img 
                src="https://static.vecteezy.com/system/resources/previews/019/787/018/original/shopping-cart-icon-shopping-basket-on-transparent-background-free-png.png" 
                alt="Cart"
                style={cartIconStyle}
              />
              <span style={cartCountBadgeStyle}>{totalItems}</span>
              <span>items in cart</span>
            </div>
            <div style={cartTotalStyle}>
              <span>${cartTotal.toFixed(2)}</span>
              <span style={viewCartTextStyle}>View Cart</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyle = {
  padding: '48px 24px',
  maxWidth: 1100,
  margin: '0 auto',
};

const productsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 40,
};

const productCardStyle = {
  background: '#232526',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.4)',
  display: 'flex',
  flexDirection: 'row', 
};

const productImageContainerStyle = {
  width: '35%', // Fixed width for image container
  padding: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRight: '1px solid #333',
};

const productImageStyle = {
  width: '100%',
  maxHeight: 320,
  objectFit: 'cover',
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
};

const productContentStyle = {
  flex: 1,
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
};

const productTitleStyle = {
  color: '#fff',
  fontSize: 28,
  marginBottom: 8,
};

const productPriceStyle = {
  color: '#ff9800',
  fontSize: 22,
  fontWeight: 600,
  marginBottom: 20,
};

const productDescriptionStyle = {
  marginBottom: 20,
};

const productSpecsStyle = {
  marginBottom: 32,
};

const sectionTitleStyle = {
  color: '#ff9800',
  fontSize: 18,
  marginBottom: 8,
  fontWeight: 600,
};

const descriptionTextStyle = {
  color: '#ccc',
  lineHeight: 1.6,
};

const specListStyle = {
  color: '#ccc',
  paddingLeft: 20,
  columns: 2,
};

const specItemStyle = {
  marginBottom: 6,
};

const addToCartBtnStyle = {
  alignSelf: 'flex-start',
  background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
  color: '#222',
  fontWeight: 700,
  border: 'none',
  borderRadius: 8,
  padding: '12px 24px',
  fontSize: 16,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  transition: 'filter 0.2s, transform 0.1s',
};

// Updated cartSummaryContainerStyle - removed opacity & transform as they're set inline
const cartSummaryContainerStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '16px 24px',
  background: 'rgba(24, 26, 27, 0.95)',
  backdropFilter: 'blur(8px)',
  borderTop: '1px solid #333',
  zIndex: 900,
  display: 'flex',
  justifyContent: 'center',
};

const cartSummaryButtonStyle = {
  width: '100%',
  maxWidth: '800px',
  background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
  border: 'none',
  borderRadius: '8px',
  padding: '16px 24px',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.1s, filter 0.2s',
};

const cartItemsCountStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: '#222',
  fontWeight: 'bold',
  fontSize: '16px',
};

const cartCountBadgeStyle = {
  background: '#222',
  color: '#ff9800',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
};

const cartTotalStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  color: '#222',
  fontWeight: 'bold',
  fontSize: '18px',
};

const viewCartTextStyle = {
  fontSize: '14px',
  marginTop: '4px',
};

const quantityControlsStyle = {
  display: 'flex',
  alignItems: 'center',
  marginTop: '12px',
};

const quantityBtnStyle = {
  background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
  color: '#222',
  fontWeight: '700',
  border: 'none',
  borderRadius: '8px',
  width: '40px',
  height: '40px',
  fontSize: '20px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  transition: 'filter 0.2s, transform 0.1s',
};

const quantityDisplayStyle = {
  color: '#fff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 16px',
  minWidth: '24px',
  textAlign: 'center',
};

const cartIconStyle = {
  width: '48px',
  height: '48px',
  objectFit: 'contain',
  filter: 'invert(1)',
};

// Add this new style for out-of-stock products
const outOfStockStyle = {
  color: '#ff5252',
  fontSize: '16px',
  fontWeight: '600',
  padding: '10px 0',
};

// New styles for stock limit alert
const stockLimitAlertStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  padding: '12px 24px',
  background: 'rgba(255, 152, 0, 0.9)',
  color: '#181A1B',
  fontWeight: 'bold',
  fontSize: '16px',
  textAlign: 'center',
  zIndex: 1000,
  transition: 'opacity 0.3s ease-out',
};

const stockLimitAlertTextStyle = {
  margin: 0,
};

export default Products;