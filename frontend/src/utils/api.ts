// API utility functions for debugging and making requests

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'Present' : 'Missing');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const getFormDataAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage (form):', token ? 'Present' : 'Missing');
  
  return {
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const baseURL = 'http://localhost:8000'; // Adjust this to your backend URL
  const fullURL = `${baseURL}${url}`;
  
  console.log('Making API request to:', fullURL);
  console.log('Options:', options);
  
  try {
    const response = await fetch(fullURL, options);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const debugAuthToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // Decode JWT payload (basic decode, not verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        console.warn('Token appears to be expired');
      } else {
        console.log('Token appears to be valid');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  } else {
    console.warn('No token found in localStorage');
  }
};
