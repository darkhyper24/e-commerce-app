import axios from 'axios';

export const updateUserProfile = async (profileData) => {
  try {
    const response = await axios.put('/api/auth/profile', profileData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to update profile';
    throw new Error(message);
  }
};