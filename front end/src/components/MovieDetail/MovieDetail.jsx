import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovieContext } from '../../context/MovieContext';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [videoQuality, setVideoQuality] = useState('hd2160');
  
  const API_URL = 'https://api.themoviedb.org/3';
  const API_KEY = '1f54bd990f1cdfb230adb312546d765d';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

  const { 
    addToWatchlist, 
    removeFromWatchlist, 
    addToFavorites, 
    removeFromFavorites,
    isInWatchlist,
    isInFavorites 
  } = useMovieContext();

  const isMatureContent = (movieData) => {
    if (movieData.adult) return true;
    if (movieData.vote_average > 10) return true;
    
    const matureGenres = [27, 53]; 
    if (movieData.genres.some(genre => matureGenres.includes(genre.id))) return true;
    
    return false;
  };

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        const response = await fetch(
          `${API_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos`
        );
        const data = await response.json();

        if (isMatureContent(data)) {
          navigate('/');
          return;
        }
        
        setMovie(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setLoading(false);
      }
    };

    fetchMovieDetail();
  }, [id, navigate]);

  const getTrailerKey = () => {
    if (!movie?.videos?.results) return null;

    const trailer = movie.videos.results.find(
      video => 
        video.type === "Trailer" && 
        video.site === "YouTube" &&
        video.size >= 2160 && 
        video.official
    ) || 

    movie.videos.results.find(
      video => 
        video.type === "Trailer" && 
        video.site === "YouTube" &&
        video.size >= 1080 &&
        video.official
    ) ||
  
    movie.videos.results.find(
      video => video.type === "Trailer" && video.site === "YouTube"
    );
    
    return trailer ? trailer.key : null;
  };


  const videoQualities = [
    { label: '4K', value: 'hd2160' },
    { label: '1080p', value: 'hd1080' },
    { label: '720p', value: 'hd720' },
    { label: '480p', value: 'large' }
  ];

  const handleTrailerClick = () => {
    setShowTrailer(true);
  };

  const handleCloseTrailer = () => {
    setShowTrailer(false);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!movie) return <div className="error">Movie not found</div>;

  const trailerKey = getTrailerKey();
  const backdropPath = movie.backdrop_path 
    ? `${IMAGE_BASE_URL}/original${movie.backdrop_path}`
    : 'https://via.placeholder.com/1920x1080/141414/141414';

  const posterPath = movie.poster_path
    ? `${IMAGE_BASE_URL}/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750/141414/ffffff?text=No+Poster';

  return (
    <div className="movie-detail">
      <div 
        className="backdrop" 
        style={{
          backgroundImage: `url(${backdropPath})`
        }}
      >
        <div className="backdrop-overlay">
          <div className="detail-content">
            <div className="poster">
              <img 
                src={posterPath}
                alt={movie.title}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x750/141414/ffffff?text=No+Poster';
                }}
              />
              {trailerKey && (
                <button className="play-trailer" onClick={handleTrailerClick}>
                  ▶ Play Trailer
                </button>
              )}
            </div>
            <div className="info">
              <h1>{movie.title}</h1>
              <div className="meta">
                <span className="rating">⭐ {movie.vote_average.toFixed(1)}</span>
                <span className="year">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </span>
                <span className="runtime">{movie.runtime ? `${movie.runtime} min` : 'N/A'}</span>
              </div>
              <div className="genres">
                {movie.genres && movie.genres.map(genre => (
                  <span key={genre.id} className="genre">
                    {genre.name}
                  </span>
                ))}
              </div>
              <div className="action-buttons">
                <button 
                  className={`action-button ${isInWatchlist(movie.id) ? 'active' : ''}`}
                  onClick={() => {
                    isInWatchlist(movie.id) 
                      ? removeFromWatchlist(movie.id)
                      : addToWatchlist(movie);
                  }}
                >
                  {isInWatchlist(movie.id) ? '✓ In Watchlist' : '+ Add to Watchlist'}
                </button>
                <button 
                  className={`action-button ${isInFavorites(movie.id) ? 'active' : ''}`}
                  onClick={() => {
                    isInFavorites(movie.id)
                      ? removeFromFavorites(movie.id)
                      : addToFavorites(movie);
                  }}
                >
                  {isInFavorites(movie.id) ? '❤️ Favorited' : '🤍 Add to Favorites'}
                </button>
              </div>
              <div className="overview">
                <h3>Overview</h3>
                <p>{movie.overview || 'No overview available.'}</p>
              </div>
              <div className="cast">
                <h3>Cast</h3>
                <div className="cast-list">
                  {movie.credits?.cast?.slice(0, 5).map(actor => (
                    <div key={actor.id} className="cast-item">
                      <img 
                        src={actor.profile_path 
                          ? `${IMAGE_BASE_URL}/w185${actor.profile_path}`
                          : 'https://via.placeholder.com/185x278/141414/ffffff?text=No+Image'
                        }
                        alt={actor.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/185x278/141414/ffffff?text=No+Image';
                        }}
                      />
                      <p>{actor.name}</p>
                      <span>{actor.character}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="budget-revenue">
                <h3>Budget & Revenue</h3>
                <p><strong>Budget:</strong> {movie.budget ? `₹${(movie.budget * 82).toLocaleString()}` : 'N/A'}</p>
                <p><strong>Revenue:</strong> {movie.revenue ? `₹${(movie.revenue * 82).toLocaleString()}` : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTrailer && trailerKey && (
        <div className="trailer-modal" onClick={handleCloseTrailer}>
          <div className="trailer-content">
            <div className="trailer-header">
              <select 
                className="quality-selector"
                value={videoQuality}
                onChange={(e) => setVideoQuality(e.target.value)}
                onClick={(e) => e.stopPropagation()} 
              >
                {videoQualities.map(quality => (
                  <option key={quality.value} value={quality.value}>
                    {quality.label}
                  </option>
                ))}
              </select>
              <button className="close-trailer" onClick={handleCloseTrailer}>×</button>
            </div>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&vq=${videoQuality}&modestbranding=1&rel=0`}
              title="Movie Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;