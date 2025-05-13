import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication services
export const authService = {
  // Register a new user
  signup: async (userData) => {
    try {
      const response = await api.post('/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
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
