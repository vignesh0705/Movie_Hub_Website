import React from 'react';
import { Link } from 'react-router-dom';
import { useMovieContext } from '../../context/MovieContext';
import './Favorites.css';

const Favorites = () => {
  const { favorites, removeFromFavorites } = useMovieContext();
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  if (favorites.length === 0) {
    return (
      <div className="empty-list">
        <h2>Your favorites list is empty</h2>
        <p>Add some movies you love!</p>
        <Link to="/" className="browse-link">Browse Movies</Link>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <h2>My Favorites</h2>
      <div className="movie-grid">
        {favorites.map(movie => (
          <div key={movie.id} className="movie-card">
            <Link to={`/movie/${movie.id}`}>
              <img 
                src={movie.poster_path 
                  ? `${IMAGE_BASE_URL}${movie.poster_path}`
                  : 'https://via.placeholder.com/500x750/141414/ffffff?text=No+Poster'
                }
                alt={movie.title}
              />
            </Link>
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <div className="movie-rating">
                <span>⭐ {movie.vote_average.toFixed(1)}</span>
              </div>
              <button 
                onClick={() => removeFromFavorites(movie.id)}
                className="remove-button"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites; 