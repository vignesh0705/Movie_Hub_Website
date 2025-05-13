import axios from 'axios';

// Use the deployed backend URL
// This is the URL of your backend deployed on Render
const API_BASE_URL = 'https://movie-hub-website.onrender.com';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  timeout: 15000, // 15 second timeout for slower deployed servers
  withCredentials: false, // Important for CORS requests
});

// Log the API base URL being used
console.log('API Service - Using Render backend URL:', API_BASE_URL);

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Service - Sending ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Service - Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`API Service - Received ${response.status} response from: ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`API Service - Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Service - No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Service - Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  // Register a new user
  signup: async (userData) => {
    try {
      console.log('API SERVICE - Signup - Attempting to register user with Render backend:', {
        ...userData,
        password: '********' // Don't log actual password
      });

      const response = await api.post('/signup', userData);
      console.log('API SERVICE - Signup - Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('API SERVICE - Signup - Error:', error);

      // Provide more detailed error information
      if (error.response) {
        // Server responded with an error status code
        console.error('API SERVICE - Signup - Server error:', error.response.status, error.response.data);
        throw error.response.data;
      } else if (error.request) {
        // Request was made but no response received (network error)
        console.error('API SERVICE - Signup - Network error: No response received');
        throw new Error('Network error: Unable to reach the server. Please check your internet connection and try again.');
      } else {
        // Error in setting up the request
        console.error('API SERVICE - Signup - Request setup error:', error.message);
        throw new Error(`Error: ${error.message}`);
      }
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('API SERVICE - Login - Attempting to log in user with Render backend:', {
        ...credentials,
        password: '********' // Don't log actual password
      });

      const response = await api.post('/login', credentials);
      console.log('API SERVICE - Login - Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('API SERVICE - Login - Error:', error);

      // Provide more detailed error information
      if (error.response) {
        // Server responded with an error status code
        console.error('API SERVICE - Login - Server error:', error.response.status, error.response.data);
        throw error.response.data;
      } else if (error.request) {
        // Request was made but no response received (network error)
        console.error('API SERVICE - Login - Network error: No response received');
        throw new Error('Network error: Unable to reach the server. Please check your internet connection and try again.');
      } else {
        // Error in setting up the request
        console.error('API SERVICE - Login - Request setup error:', error.message);
        throw new Error(`Error: ${error.message}`);
      }
    }
  },
};

// Watchlist services
export const watchlistService = {
  // Add movie to watchlist
  addToWatchlist: async (email, movie) => {
    try {
      console.log('API SERVICE - Adding to watchlist - Email:', email);
      console.log('API SERVICE - Adding to watchlist - Movie:', movie);

      // Ensure movie ID is a number
      const movieToAdd = {
        ...movie,
        id: parseInt(movie.id)
      };

      console.log('API SERVICE - Sending request to:', '/addToWatchlist');
      console.log('API SERVICE - Request payload:', { email, movie: movieToAdd });

      const response = await api.post('/addToWatchlist', { email, movie: movieToAdd });

      console.log('=== API CALL SUCCESSFUL ===');
      console.log('API ENDPOINT: /addToWatchlist');
      console.log('RESPONSE STATUS:', response.status);
      console.log('RESPONSE DATA:', response.data);

      if (response.data && response.data.watchlist) {
        console.log('WATCHLIST RECEIVED FROM DATABASE:');
        console.log('- Watchlist length:', response.data.watchlist.length);
        console.log('- Movie added:', movieToAdd.title);
        console.log('- Movie ID:', movieToAdd.id);
      }
      console.log('=== API CALL COMPLETE ===');

      return response.data;
    } catch (error) {
      console.error('API SERVICE - Error adding to watchlist:', error);
      console.error('API SERVICE - Error details:', error.response ? error.response.data : 'Network error');
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Remove movie from watchlist
  removeFromWatchlist: async (email, movieId) => {
    try {
      const response = await api.post('/removeFromWatchlist', { email, movieId });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Get user's watchlist
  getUserWatchlist: async (email) => {
    try {
      console.log('API Service - Getting watchlist for email:', email);
      const response = await api.get(`/getUserWatchlist?email=${email}`);
      console.log('API Service - Watchlist response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Service - Error getting watchlist:', error);
      throw error.response ? error.response.data : new Error('Network error');
    }
  },
};

// Favorites services
export const favoritesService = {
  // Add movie to favorites
  addToFavorites: async (email, movie) => {
    try {
      console.log('API Service - Adding to favorites:', { email, movie });
      const response = await api.post('/addToFavorites', { email, movie });
      console.log('API Service - Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Service - Error adding to favorites:', error);
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Remove movie from favorites
  removeFromFavorites: async (email, movieId) => {
    try {
      const response = await api.post('/removeFromFavorites', { email, movieId });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Get user's favorites
  getUserFavorites: async (email) => {
    try {
      const response = await api.get(`/getUserFavorites?email=${email}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },
};

export default api;
