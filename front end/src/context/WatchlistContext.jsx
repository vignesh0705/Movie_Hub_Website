import React, { createContext, useState, useContext, useEffect } from 'react';
import { watchlistService } from '../services/api';

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Fetch user's watchlist from backend when component mounts
  useEffect(() => {
    const fetchUserWatchlist = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        console.log('Checking if user is logged in:', isLoggedIn);
        console.log('User data in localStorage:', user);

        if (isLoggedIn && user && user.email) {
          setIsLoading(true);
          console.log('Fetching watchlist for user:', user.email);

          const response = await watchlistService.getUserWatchlist(user.email);
          console.log('Fetched watchlist response:', response);

          if (response && response.watchlist) {
            console.log('Setting watchlist from server:', response.watchlist);
            setWatchlist(response.watchlist);

            // Also update localStorage
            localStorage.setItem('watchlist', JSON.stringify(response.watchlist));
            console.log('Updated watchlist in localStorage');
          } else {
            console.log('No watchlist found in response');
          }
        } else {
          console.log('User not logged in or missing email, not fetching watchlist');
        }
      } catch (err) {
        console.error('Error fetching watchlist:', err);
        setError('Failed to load watchlist');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserWatchlist();
  }, []);

  const addToWatchlist = async (movie) => {
    console.log('WATCHLIST CONTEXT - Adding to watchlist:', movie);
    const isInWatchlist = watchlist.some(item => item.id === movie.id);
    console.log('WATCHLIST CONTEXT - Is already in watchlist:', isInWatchlist);
    console.log('WATCHLIST CONTEXT - Current watchlist:', watchlist);

    if (!isInWatchlist) {
      setIsLoading(true);
      setError(null);

      try {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('WATCHLIST CONTEXT - User from localStorage:', user);

        if (user && user.email) {
          console.log('WATCHLIST CONTEXT - Calling API with email:', user.email);

          // Ensure movie has all required properties and convert id to number
          const movieToAdd = {
            id: parseInt(movie.id),
            title: movie.title,
            poster_path: movie.poster_path,
            overview: movie.overview || '',
            release_date: movie.release_date || '',
            vote_average: movie.vote_average || 0
          };

          console.log('WATCHLIST CONTEXT - Movie data to send:', movieToAdd);

          // Call backend API
          const response = await watchlistService.addToWatchlist(user.email, movieToAdd);
          console.log('WATCHLIST CONTEXT - API response:', response);

          if (response) {
            console.log('=== WATCHLIST UPDATED SUCCESSFULLY ===');
            console.log('MOVIE ADDED TO WATCHLIST IN DATABASE');
            console.log('Movie:', movieToAdd.title);
            console.log('Movie ID:', movieToAdd.id);
            console.log('User:', user.email);

            // Update local state with the response from the server
            if (response.watchlist) {
              console.log('Watchlist from database:', response.watchlist);
              console.log('Watchlist length in database:', response.watchlist.length);
              setWatchlist(response.watchlist);

              // Also update localStorage
              localStorage.setItem('watchlist', JSON.stringify(response.watchlist));
              console.log('Watchlist synchronized with database and saved to localStorage');
            } else {
              // Fallback to local update if server doesn't return the watchlist
              console.log('WARNING: No watchlist in response, updating locally only');
              const updatedWatchlist = [...watchlist, movieToAdd];
              setWatchlist(updatedWatchlist);

              // Also update localStorage
              localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
              console.log('Watchlist updated locally only (not confirmed in database)');
            }
            console.log('=== WATCHLIST UPDATE COMPLETE ===');

            // Verify the watchlist was updated in localStorage
            setTimeout(() => {
              const savedWatchlist = localStorage.getItem('watchlist');
              console.log('WATCHLIST CONTEXT - Watchlist in localStorage after update:',
                savedWatchlist ? JSON.parse(savedWatchlist) : 'Not found');
            }, 100);

            return true;
          } else {
            throw new Error('No response from server');
          }
        } else {
          console.error('WATCHLIST CONTEXT - No user found in localStorage or missing email');
          throw new Error('User not authenticated');
        }
      } catch (err) {
        console.error('WATCHLIST CONTEXT - Error adding to watchlist:', err);
        setError(err.message || 'Failed to add to watchlist');
        return false;
      } finally {
        setIsLoading(false);
      }
    }
    return false;
  };

  const removeFromWatchlist = async (movieId) => {
    console.log('Removing from watchlist, movieId:', movieId);
    setIsLoading(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('User from localStorage:', user);

      if (user && user.email) {
        console.log('Calling API to remove movie with email:', user.email);

        // Call backend API
        const response = await watchlistService.removeFromWatchlist(user.email, movieId);
        console.log('API response for remove:', response);

        if (response) {
          // Update local state with the response from the server
          if (response.watchlist) {
            setWatchlist(response.watchlist);
            console.log('Updated watchlist from server after removal:', response.watchlist);
          } else {
            // Fallback to local update if server doesn't return the watchlist
            setWatchlist(prevWatchlist => prevWatchlist.filter(item => item.id !== movieId));
            console.log('Updated watchlist locally after removal');
          }

          // Verify the watchlist was updated in localStorage
          setTimeout(() => {
            const savedWatchlist = localStorage.getItem('watchlist');
            console.log('Watchlist in localStorage after removal:', savedWatchlist ? JSON.parse(savedWatchlist) : 'Not found');
          }, 100);
        } else {
          throw new Error('No response from server');
        }
      } else {
        console.error('No user found in localStorage or missing email');
        throw new Error('User not authenticated');
      }
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      setError(err.message || 'Failed to remove from watchlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      watchlistCount: watchlist.length,
      isLoading,
      error
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

// Fix the circular reference
export const useWatchlistContext = () => useContext(WatchlistContext);