import axios from 'axios';

const API_BASE_URL = 'https://movie-hub-website.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  timeout: 15000, 
  withCredentials: false, 
});

console.log('API Service - Using Render backend URL:', API_BASE_URL);

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

api.interceptors.response.use(
  (response) => {
    console.log(`API Service - Received ${response.status} response from: ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`API Service - Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('API Service - No response received:', error.request);
    } else {
      console.error('API Service - Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  signup: async (userData) => {
    try {
      console.log('API SERVICE - Signup - Attempting to register user with Render backend:', {
        ...userData,
        password: '********' 
      });

      const response = await api.post('/signup', userData);
      console.log('API SERVICE - Signup - Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('API SERVICE - Signup - Error:', error);

      if (error.response) {

        console.error('API SERVICE - Signup - Server error:', error.response.status, error.response.data);
        throw error.response.data;
      } else if (error.request) {
        console.error('API SERVICE - Signup - Network error: No response received');
        throw new Error('Network error: Unable to reach the server. Please check your internet connection and try again.');
      } else {
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
        password: '********' 
      });

      const response = await api.post('/login', credentials);
      console.log('API SERVICE - Login - Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('API SERVICE - Login - Error:', error);

      if (error.response) {
        console.error('API SERVICE - Login - Server error:', error.response.status, error.response.data);
        throw error.response.data;
      } else if (error.request) {
        console.error('API SERVICE - Login - Network error: No response received');
        throw new Error('Network error: Unable to reach the server. Please check your internet connection and try again.');
      } else {
        console.error('API SERVICE - Login - Request setup error:', error.message);
        throw new Error(`Error: ${error.message}`);
      }
    }
  },
};

// Watchlist services
export const watchlistService = {
  addToWatchlist: async (email, movie) => {
    try {
      console.log('API SERVICE - Adding to watchlist - Email:', email);
      console.log('API SERVICE - Adding to watchlist - Movie:', movie);
      const email ={
        ...email,
        id: parseInt(email)
      };
      const movieToAdd = {
        ...movie,
        id: parseInt(movie.id)
      };

      console.log('API SERVICE - Sending request to:', '/addToWatchlist');
      console.log('API SERVICE - Request payload:', { email, movie: movieToAdd });

      const response = await api.post('/addToWatchlist', { email:email, movie: movieToAdd });

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
