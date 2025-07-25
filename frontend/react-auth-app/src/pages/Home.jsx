import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        let url = '/api/';
        if (selectedCategory !== 'all') {
          url = `/api/category/${selectedCategory}`;
        }
        
        const response = await axios.get(url, {
          withCredentials: true
        });
        
        if (response.data && response.data.success) {
          // Transform the data to match the expected format
          const transformedProducts = response.data.data.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price / 100, // Convert from cents to dollars
            image: product.photo || 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=400&q=80',
            category: product.category,
            description: product.description,
            quantity: product.quantity
          }));
          setProducts(transformedProducts);
          
          // Extract unique categories for filter
          if (selectedCategory === 'all') {
            const uniqueCategories = [...new Set(transformedProducts.map(p => p.category))];
            setCategories(uniqueCategories);
          }
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
  }, [selectedCategory]);

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
      navigate('/login');
    } catch (err) {
      setLogoutError('Logout failed. Please try again.');
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/products?id=${productId}`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearch(''); // Clear search when changing category
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: '#181A1B', minHeight: '100vh' }}>
      <Navbar onSearch={setSearch} onLogout={handleLogout} />
      {logoutError && (
        <div style={{ color: '#ff5252', textAlign: 'center', marginTop: 16 }}>{logoutError}</div>
      )}
      
      <section style={heroStyle}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 44, margin: 0 }}>
            Welcome to <span style={{ color: '#ff9800' }}>Smart.cart</span>
          </h1>
          <p style={{ color: '#ccc', fontSize: 20, marginTop: 16 }}>
            Your one-stop shop for the latest hardware tech products.
          </p>
        </div>
      </section>
      
      <section style={gridSectionStyle}>
        <div style={headerContainerStyle}>
          <h2 style={{ color: '#fff', marginBottom: 24 }}>Featured Products</h2>
          
          {/* Category Filter */}
          <div style={categoryFilterStyle}>
            <span style={{ color: '#ccc', marginRight: 16, fontSize: 16 }}>Filter by category:</span>
            <div style={categoryButtonsStyle}>
              <button
                style={{
                  ...categoryButtonStyle,
                  ...(selectedCategory === 'all' ? selectedCategoryButtonStyle : {})
                }}
                onClick={() => handleCategoryChange('all')}
              >
                All Products
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  style={{
                    ...categoryButtonStyle,
                    ...(selectedCategory === category ? selectedCategoryButtonStyle : {})
                  }}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {loading ? (
          <div style={{ color: '#ccc', textAlign: 'center', padding: '32px', fontSize: 18 }}>
            <div style={loadingStyle}>
              Loading {selectedCategory === 'all' ? 'all products' : `${selectedCategory} products`}...
            </div>
          </div>
        ) : error ? (
          <div style={{ color: '#ff5252', textAlign: 'center', padding: '32px', fontSize: 18 }}>
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ color: '#aaa', fontSize: 20, textAlign: 'center' }}>
            {search ? `No products found matching "${search}" in ${selectedCategory === 'all' ? 'all categories' : selectedCategory}.` : 
             selectedCategory === 'all' ? 'No products available.' : `No products available in ${selectedCategory} category.`}
          </div>
        ) : (
          <>
            <div style={resultsInfoStyle}>
              <span style={{ color: '#ccc' }}>
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                {search && ` matching "${search}"`}
              </span>
            </div>
            <div style={gridStyle}>
              {filteredProducts.map(product => (
                <div key={product.id} style={cardStyle}>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    style={imgStyle}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 20, marginTop: 12 }}>
                    {product.name}
                  </div>
                  <div style={{ color: '#ccc', fontSize: 14, marginTop: 4 }}>
                    {product.category}
                  </div>
                  <div style={{ color: '#ff9800', fontWeight: 700, fontSize: 18, marginTop: 6 }}>
                    ${product.price.toFixed(2)}
                  </div>
                  {product.quantity > 0 ? (
                    <div style={{ color: '#4caf50', fontSize: 14, marginTop: 4 }}>
                      In Stock ({product.quantity})
                    </div>
                  ) : (
                    <div style={{ color: '#ff5252', fontSize: 14, marginTop: 4 }}>
                      Out of Stock
                    </div>
                  )}
                  <button 
                    style={viewBtnStyle} 
                    onClick={() => handleViewProduct(product.id)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

const heroStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 220,
  background: 'linear-gradient(90deg, #232526 0%, #181A1B 100%)',
  boxShadow: '0 2px 24px #0008',
  marginBottom: 32,
};

const gridSectionStyle = { 
  maxWidth: 1200, 
  margin: '0 auto', 
  padding: '0 32px' 
};

const headerContainerStyle = {
  marginBottom: 32,
};

const categoryFilterStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  marginBottom: 24,
  padding: 20,
  background: '#232526',
  borderRadius: 12,
  boxShadow: '0 2px 16px #0006',
};

const categoryButtonsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
};

const categoryButtonStyle = {
  background: 'transparent',
  color: '#ccc',
  border: '2px solid #333',
  borderRadius: 20,
  padding: '8px 16px',
  fontSize: 14,
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontWeight: 500,
};

const selectedCategoryButtonStyle = {
  background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
  color: '#222',
  borderColor: '#ff9800',
  fontWeight: 700,
};

const resultsInfoStyle = {
  marginBottom: 16,
  fontSize: 14,
};

const loadingStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 32,
};

const cardStyle = {
  background: '#232526',
  borderRadius: 16,
  boxShadow: '0 2px 16px #0006',
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transition: 'transform 0.2s',
  cursor: 'pointer',
};

const imgStyle = {
  width: 200,
  height: 140,
  objectFit: 'cover',
  borderRadius: 12,
  boxShadow: '0 2px 8px #0004',
};

const viewBtnStyle = {
  marginTop: 18,
  background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
  color: '#222',
  fontWeight: 700,
  border: 'none',
  borderRadius: 8,
  padding: '10px 0',
  width: '100%',
  fontSize: 17,
  cursor: 'pointer',
  boxShadow: '0 2px 8px #0004',
  transition: 'filter 0.2s',
};

export default Home;