const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

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
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_BASE}${formattedEndpoint}`;

  try {
    const res = await fetch(fullUrl, {
      cache: 'no-store',
      ...options,
      headers
    });

    const contentType = res.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { message: text || `Server error (${res.status})` };
    }

    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Server error (${res.status})`
      };
    }
    return data;
  } catch (err) {
    console.warn(`Backend API connection error on ${fullUrl}:`, err);
    return {
      success: false,
      message: `Server connection error calling ${fullUrl}. Please ensure backend server is running.`
    };
  }
}
