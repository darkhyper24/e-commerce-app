import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../api/profileApi';
import axios from 'axios';

const Profile = () => {
  const { isAuthenticated, user, setUser } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phone: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        const profileResponse = await axios.get('/api/auth/profile', {
          withCredentials: true
        });
        
        if (profileResponse.data && profileResponse.data.user) {
          setUserData(profileResponse.data.user);
          setUser(profileResponse.data.user);
          // Initialize edit form with current data
          setEditForm({
            username: profileResponse.data.user.username || '',
            email: profileResponse.data.user.email || '',
            phone: profileResponse.data.user.phone || ''
          });
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

  const handleEditClick = () => {
    setIsEditing(true);
    setUpdateError('');
    setUpdateSuccess('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdateError('');
    setUpdateSuccess('');
    // Reset form to original data
    setEditForm({
      username: userData?.username || '',
      email: userData?.email || '',
      phone: userData?.phone || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    setUpdateError('');
    setUpdateSuccess('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError('');
    setUpdateSuccess('');

    try {
      const response = await updateUserProfile(editForm);
      
      if (response.user) {
        setUserData(response.user);
        setUser(response.user);
        setUpdateSuccess('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div style={{ background: '#181A1B', minHeight: '100vh' }}>
        <Navbar onSearch={() => {}} />
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
      <Navbar onSearch={() => {}} />
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
                {!isEditing ? (
                  // Display Mode
                  <>
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
                      onClick={handleEditClick}
                    >
                      Edit Profile
                    </button>
                  </>
                ) : (
                  // Edit Mode
                  <form onSubmit={handleSaveProfile}>
                    <div style={editRowStyle}>
                      <label style={editLabelStyle}>Username</label>
                      <input
                        type="text"
                        name="username"
                        value={editForm.username}
                        onChange={handleInputChange}
                        style={editInputStyle}
                        required
                      />
                    </div>
                    <div style={editRowStyle}>
                      <label style={editLabelStyle}>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleInputChange}
                        style={editInputStyle}
                        required
                      />
                    </div>
                    <div style={editRowStyle}>
                      <label style={editLabelStyle}>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleInputChange}
                        style={editInputStyle}
                      />
                    </div>

                    {updateError && (
                      <div style={{ color: '#ff5252', marginTop: 16, fontSize: 14 }}>
                        {updateError}
                      </div>
                    )}

                    {updateSuccess && (
                      <div style={{ color: '#4caf50', marginTop: 16, fontSize: 14 }}>
                        {updateSuccess}
                      </div>
                    )}

                    <div style={editButtonsStyle}>
                      <button
                        type="submit"
                        disabled={updateLoading}
                        style={saveBtnStyle}
                      >
                        {updateLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={cancelBtnStyle}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
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
const editRowStyle = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 20,
};

const editLabelStyle = {
  color: '#ccc',
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 8,
};

const editInputStyle = {
  background: '#181A1B',
  border: '2px solid #333',
  borderRadius: 8,
  padding: '12px 16px',
  color: '#fff',
  fontSize: 16,
  outline: 'none',
  transition: 'border-color 0.2s',
};

const editButtonsStyle = {
  display: 'flex',
  gap: 12,
  marginTop: 24,
};

const saveBtnStyle = {
  background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
  color: '#fff',
  fontWeight: 700,
  border: 'none',
  borderRadius: 8,
  padding: '10px 24px',
  fontSize: 16,
  cursor: 'pointer',
  transition: 'filter 0.2s',
};

const cancelBtnStyle = {
  background: 'transparent',
  color: '#ff5252',
  fontWeight: 700,
  border: '2px solid #ff5252',
  borderRadius: 8,
  padding: '10px 24px',
  fontSize: 16,
  cursor: 'pointer',
  transition: 'all 0.2s',
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