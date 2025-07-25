import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { isAuthenticated, user, setUser } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Use the documented profile endpoint to get user data
        const profileResponse = await axios.get('/api/auth/profile', {
          withCredentials: true
        });
        
        if (profileResponse.data && profileResponse.data.user) {
          setUserData(profileResponse.data.user);
          setUser(profileResponse.data.user); // Update auth context
          
          // Now fetch orders for this user
          try {
            // Use the correct endpoint for order history
            const ordersResponse = await axios.get(`/api/orders/history`, {
              withCredentials: true
            });
            
            if (ordersResponse.data && ordersResponse.data.data) {
              setOrderHistory(ordersResponse.data.data);
            }
          } catch (orderErr) {
            console.warn('Could not fetch orders:', orderErr);
            setOrderHistory([]);
          }
        } else {
          setError('Unexpected response format from server');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        
        if (err.response && err.response.status === 401) {
          setError('Authentication required. Please login again.');
        } else {
          setError('Failed to load profile data. Please try again later.');
        }
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, setUser]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div style={{ background: '#181A1B', minHeight: '100vh' }}>
        <Navbar onSearch={() => {}} onLogout={handleLogout} />
        <div style={unauthContainerStyle}>
          <h1 style={{ color: '#ff9800', fontSize: 36, marginBottom: 24 }}>Profile</h1>
          <div style={unauthMessageStyle}>
            <p style={{ color: '#ccc', fontSize: 20, marginBottom: 24 }}>
              Please sign in or create an account to view your profile
            </p>
            <div style={unauthButtonsStyle}>
              <button 
                style={loginBtnStyle} 
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button 
                style={registerBtnStyle} 
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#181A1B', minHeight: '100vh' }}>
      <Navbar onSearch={() => {}} onLogout={handleLogout} />
      <div style={containerStyle}>
        <h1 style={{ color: '#ff9800', fontSize: 36, marginBottom: 24 }}>My Profile</h1>
        
        {loading ? (
          <div style={{ color: '#ccc', textAlign: 'center', padding: '32px' }}>
            Loading profile data...
          </div>
        ) : error ? (
          <div style={{ color: '#ff5252', textAlign: 'center', padding: '32px' }}>
            {error}
          </div>
        ) : (
          <div style={profileContentStyle}>
            {/* Personal Information Section */}
            <div style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Personal Information</h2>
              <div style={cardStyle}>
                <div style={infoRowStyle}>
                  <div style={infoLabelStyle}>Username</div>
                  <div style={infoValueStyle}>{userData?.username || 'Not set'}</div>
                </div>
                <div style={infoRowStyle}>
                  <div style={infoLabelStyle}>Email</div>
                  <div style={infoValueStyle}>{userData?.email || 'Not set'}</div>
                </div>
                <div style={infoRowStyle}>
                  <div style={infoLabelStyle}>Phone</div>
                  <div style={infoValueStyle}>{userData?.phone || 'Not set'}</div>
                </div>
               
                <button 
                  style={editBtnStyle}
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Order History Section */}
            <div style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Order History</h2>
              {orderHistory.length === 0 ? (
                <div style={emptyStateStyle}>
                  You haven't placed any orders yet.
                </div>
              ) : (
                orderHistory.map(order => (
                  <div key={order.id} style={orderCardStyle}>
                    <div style={orderHeaderStyle}>
                      <div>
                        <span style={orderIdStyle}>{order.id.substring(0, 8)}</span>
                        <span style={orderDateStyle}>
                          Ordered on {new Date(order.orderDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{
                        ...orderStatusStyle,
                        color: order.status === 'completed' ? '#4caf50' : '#ff9800'
                      }}>
                        {order.status}
                      </div>
                    </div>
                    {order.items && order.items.length > 0 ? (
                      <div style={orderItemsContainerStyle}>
                        {order.items.map((item, index) => (
                          <div key={index} style={orderItemStyle}>
                            <div style={itemNameStyle}>{item.name || 'Unknown Product'} × {item.quantity || 1}</div>
                            <div style={itemPriceStyle}>${parseFloat(item.price || 0).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#aaa', padding: '16px 0' }}>
                        No items found in this order.
                      </div>
                    )}
                    {order.totalAmount !== undefined && (
                      <div style={orderTotalStyle}>
                        <span>Total</span>
                        <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
                      </div>
                    )}
                    <button 
                      style={orderDetailBtnStyle}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles for the authenticated user view
const containerStyle = {
  padding: '48px 24px',
  maxWidth: 1000,
  margin: '0 auto',
};

const profileContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 40,
};

const sectionStyle = {
  marginBottom: 32,
};

const sectionTitleStyle = {
  color: '#ff9800',
  fontSize: 24,
  marginBottom: 16,
};

const cardStyle = {
  background: '#232526',
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.4)',
};

const infoRowStyle = {
  display: 'flex',
  borderBottom: '1px solid #333',
  padding: '16px 0',
};

const infoLabelStyle = {
  width: 150,
  color: '#ccc',
  fontSize: 16,
  fontWeight: 600,
};

const infoValueStyle = {
  flex: 1,
  color: '#fff',
  fontSize: 16,
  wordBreak: 'break-word',
};

const editBtnStyle = {
  background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
  color: '#222',
  fontWeight: 700,
  border: 'none',
  borderRadius: 8,
  padding: '10px 24px',
  fontSize: 16,
  cursor: 'pointer',
  marginTop: 24,
  alignSelf: 'flex-start',
};

const orderCardStyle = {
  background: '#232526',
  borderRadius: 16,
  padding: 24,
  marginBottom: 24,
  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.4)',
};

const orderHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 16,
  paddingBottom: 16,
  borderBottom: '1px solid #333',
};

const orderIdStyle = {
  color: '#fff',
  fontWeight: 600,
  fontSize: 18,
  marginRight: 12,
};

const orderDateStyle = {
  color: '#aaa',
  fontSize: 16,
};

const orderStatusStyle = {
  fontWeight: 600,
  fontSize: 16,
};

const orderItemsContainerStyle = {
  margin: '16px 0',
};

const orderItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
};

const itemNameStyle = {
  color: '#fff',
  fontSize: 16,
};

const itemPriceStyle = {
  color: '#ff9800',
  fontSize: 16,
  fontWeight: 600,
};

const orderTotalStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px 0',
  borderTop: '1px solid #333',
  color: '#fff',
  fontWeight: 700,
  fontSize: 18,
};

const orderDetailBtnStyle = {
  background: 'transparent',
  color: '#ff9800',
  border: '2px solid #ff9800',
  borderRadius: 8,
  padding: '8px 16px',
  fontSize: 14,
  cursor: 'pointer',
  marginTop: 8,
  fontWeight: 600,
};

const emptyStateStyle = {
  color: '#aaa',
  textAlign: 'center',
  padding: '32px',
  background: '#232526',
  borderRadius: 16,
  fontSize: 18,
};

// Styles for the unauthenticated user view
const unauthContainerStyle = {
  padding: '64px 24px',
  maxWidth: 600,
  margin: '0 auto',
  textAlign: 'center',
};

const unauthMessageStyle = {
  background: '#232526',
  borderRadius: 16,
  padding: 32,
  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.4)',
};

const unauthButtonsStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: 16,
};

const loginBtnStyle = {
  background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
  color: '#222',
  fontWeight: 700,
  border: 'none',
  borderRadius: 8,
  padding: '12px 32px',
  fontSize: 16,
  cursor: 'pointer',
};

const registerBtnStyle = {
  background: 'transparent',
  color: '#ff9800',
  fontWeight: 700,
  border: '2px solid #ff9800',
  borderRadius: 8,
  padding: '12px 32px',
  fontSize: 16,
  cursor: 'pointer',
};

export default Profile;