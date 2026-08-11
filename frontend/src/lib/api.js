const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get auth token from localStorage
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('iedc_token');
  }
  return null;
};

// Helper for HTTP requests with environment API base handling
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
      message: 'Server connection error. Please ensure backend service is running and MongoDB Atlas IP is whitelisted.'
    };
  }
}
