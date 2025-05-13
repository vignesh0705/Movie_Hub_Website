import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(searchParams.get('language') || 'all');
  
  const API_URL = 'https://api.themoviedb.org/3';
  const API_KEY = '1f54bd990f1cdfb230adb312546d765d';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

  // Language codes mapping
  const languageCodes = {
    'all': { code: '', name: 'All Languages' },
    'ta': { code: 'ta', name: 'Tamil' },
    'en': { code: 'en', name: 'English' },
    'hi': { code: 'hi', name: 'Hindi' },
    'te': { code: 'te', name: 'Telugu' },
    'bn': { code: 'bn', name: 'Bengali' },
    'kn': { code: 'kn', name: 'Kannada' },
    'ml': { code: 'ml', name: 'Malayalam' },
    'mr': { code: 'mr', name: 'Marathi' }
  };

  const filterAdultContent = (movies) => {
    return movies.filter(movie => {
      if (movie.adult) return false;
      if (movie.filterAdultContent) return false;
      if (movie.vote_average > 10) return false;
      
      const matureGenres = [27, 53]; 
      if (movie.genre_ids && movie.genre_ids.some(id => matureGenres.includes(id))) return false;
      
      return true;
    });
  };

  useEffect(() => {
    const searchMovies = async () => {
      if (searchQuery.trim() === '' && language === 'all') {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let url = `${API_URL}/`;
        
        if (searchQuery.trim() === '') {
          // Discover popular movies for the selected language
          url += `discover/movie?api_key=${API_KEY}&sort_by=popularity.desc`;
          if (language !== 'all') {
            url += `&with_original_language=${languageCodes[language].code}&region=IN`;
          }
        } else {
          // Search movies with query
          url += `search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`;
          if (language !== 'all') {
            url += `&with_original_language=${languageCodes[language].code}&region=IN`;
          }
        }

        url += '&include_adult=false';
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch movies');
        }

        const data = await response.json();
        const filteredResults = filterAdultContent(data.results || []);
        setSearchResults(filteredResults);
      } catch (err) {
        setError('Error searching for movies. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchMovies, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, language]);

  return (
    <div className="search-container">
      <div className="search-header">
        <h2>Search Movies</h2>
        <div className="search-controls">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="language-select"
          >
            {Object.entries(languageCodes).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Search for movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>

      {loading && (
        <div className="search-status">
          <div className="loading-spinner"></div>
          <p>Searching...</p>
        </div>
      )}

      {error && (
        <div className="search-status error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && searchResults.length === 0 && searchQuery && (
        <div className="search-status">
          <p>No {language !== 'all' ? languageCodes[language].name : ''} movies found matching "{searchQuery}"</p>
        </div>
      )}

      {!loading && !error && searchQuery === '' && language !== 'all' && searchResults.length === 0 && (
        <div className="search-status">
          <p>No popular {languageCodes[language].name} movies found</p>
        </div>
      )}

      <div className="search-results">
        {searchResults.map(movie => (
          <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card">
            <div className="movie-poster">
              <img 
                src={movie.poster_path 
                  ? `${IMAGE_BASE_URL}/w500${movie.poster_path}`
                  : 'https://via.placeholder.com/500x750/141414/ffffff?text=No+Poster'
                }
                alt={movie.title}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x750/141414/ffffff?text=No+Poster';
                }}
              />
              <div className="movie-overlay">
                <div className="movie-rating">⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</div>
              </div>
            </div>
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <div className="movie-meta">
                <span className="rating">⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</span>
                <span className="year">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </span>
              </div>
              <p className="overview">{movie.overview || 'No overview available.'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Search;