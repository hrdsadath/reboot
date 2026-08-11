const API_BASE = 'http://localhost:5000/api';

// Helper to get auth token from localStorage
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('iedc_token');
  }
  return null;
};

// Helper for HTTP requests with backend error handling
export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Server error (${res.status})`
      };
    }
    return data;
  } catch (err) {
    console.warn('Backend API connection error:', err);
    return {
      success: false,
      message: 'Server error: Unable to communicate with backend on port 5000. Please check MongoDB Atlas IP Whitelist.'
    };
  }
}
