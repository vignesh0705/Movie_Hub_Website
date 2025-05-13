import React, { createContext, useContext, useState, useEffect } from 'react';
import { favoritesService } from '../services/api';

const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch user's favorites from backend when component mounts
  useEffect(() => {
    const fetchUserFavorites = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (isLoggedIn && user && user.email) {
          setIsLoading(true);
          console.log('Fetching favorites for user:', user.email);

          const response = await favoritesService.getUserFavorites(user.email);
          console.log('Fetched favorites:', response);

          if (response && response.favorites) {
            setFavorites(response.favorites);
          }
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserFavorites();
  }, []);

  // Watchlist functions are now handled by WatchlistContext
  const addToWatchlist = (movie) => {
    setWatchlist(prev => {
      if (!prev.some(m => m.id === movie.id)) {
        return [...prev, movie];
      }
      return prev;
    });
  };

  const removeFromWatchlist = (movieId) => {
    setWatchlist(prev => prev.filter(movie => movie.id !== movieId));
  };

  const addToFavorites = async (movie) => {
    const isInFavorites = favorites.some(m => m.id === movie.id);

    if (!isInFavorites) {
      setIsLoading(true);
      setError(null);

      try {
        const user = JSON.parse(localStorage.getItem('user'));

        if (user && user.email) {
          // Call backend API
          await favoritesService.addToFavorites(user.email, movie);

          // Update local state
          setFavorites(prev => [...prev, movie]);
        } else {
          throw new Error('User not authenticated');
        }
      } catch (err) {
        console.error('Error adding to favorites:', err);
        setError(err.message || 'Failed to add to favorites');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const removeFromFavorites = async (movieId) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem('user'));

      if (user && user.email) {
        // Call backend API
        await favoritesService.removeFromFavorites(user.email, movieId);

        // Update local state
        setFavorites(prev => prev.filter(movie => movie.id !== movieId));
      } else {
        throw new Error('User not authenticated');
      }
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError(err.message || 'Failed to remove from favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const isInWatchlist = (movieId) => {
    return watchlist.some(movie => movie.id === movieId);
  };

  const isInFavorites = (movieId) => {
    return favorites.some(movie => movie.id === movieId);
  };

  return (
    <MovieContext.Provider value={{
      watchlist,
      favorites,
      addToWatchlist,
      removeFromWatchlist,
      addToFavorites,
      removeFromFavorites,
      isInWatchlist,
      isInFavorites,
      isLoading,
      error
    }}>
      {children}
    </MovieContext.Provider>
  );
};

export const useMovieContext = () => useContext(MovieContext);