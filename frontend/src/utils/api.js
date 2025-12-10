// API Configuration and utility functions

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://bitebuddyy-project.onrender.com/api";

// Generic fetch wrapper with error handling
export const apiCall = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    includeAuth = true,
    ...otherOptions
  } = options;

  try {
    const headers = {
      'Content-Type': 'application/json',
      ...otherOptions.headers,
    };

    // Add authorization token if authenticated
    if (includeAuth) {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      ...otherOptions,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || `API Error: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// Food Data API calls
export const foodApi = {
  getAll: () => apiCall('/foodData', { method: 'POST' }),
  getByCategory: (category) => apiCall(`/foodData?category=${category}`),
};

// Auth API calls
export const authApi = {
  signup: (userData) => apiCall('/createuser', {
    method: 'POST',
    body: userData,
    includeAuth: false,
  }),
  login: (credentials) => apiCall('/loginuser', {
    method: 'POST',
    body: credentials,
    includeAuth: false,
  }),
};

// Orders API calls
export const ordersApi = {
  create: (orderData) => apiCall('/orderData', {
    method: 'POST',
    body: orderData,
  }),
  getMyOrders: (email) => apiCall('/myOrderData', {
    method: 'POST',
    body: { email },
  }),
};
