import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '../../context/WatchlistContext';
import './Home.css';

const API_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || '1f54bd990f1cdfb230adb312546d765d';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const filterAdultContent = (movies) => {
  return movies.filter(movie => {
    if (movie.adult) return false;
    if (movie.vote_average > 8.5) return false;

    const matureGenres = [
      27,
      53,
      80,
      9648,
      37,
    ];

    if (movie.genre_ids?.some(id => matureGenres.includes(id))) return false;

    const matureKeywords = [
      'adult', 'nude', 'erotic', 'intimate',
      'kill', 'death', 'blood', 'violence', 'murder',
      'horror', 'thriller', 'crime', 'scandal'
    ];

    const titleLower = movie.title?.toLowerCase() || '';
    if (matureKeywords.some(keyword => titleLower.includes(keyword))) return false;

    const overviewLower = movie.overview?.toLowerCase() || '';
    if (matureKeywords.some(keyword => overviewLower.includes(keyword))) return false;

    if (movie.vote_count > 100 && movie.vote_average > 7.5) {
      return false;
    }

    return true;
  });
};

const MovieSection = ({ title, movies, seeAllLink }) => {
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const handleWatchlist = async (movie, event) => {
    event.preventDefault();
    event.stopPropagation(); // Stop event propagation to prevent link navigation

    console.log('WATCHLIST BUTTON CLICKED');
    console.log('Movie to add/remove:', movie);

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user'));

    console.log('User logged in:', isLoggedIn);
    console.log('User data:', user);

    if (!isLoggedIn || !user || !user.email) {
      alert('Please log in to add movies to your watchlist');
      return;
    }

    const isInWatchlist = watchlist.some(item => item.id === movie.id);
    console.log('Is in watchlist:', isInWatchlist);
    console.log('Current watchlist:', watchlist);

    try {
      if (!isInWatchlist) {
        console.log('Attempting to add to watchlist');

        // Prepare movie data with all required fields
        const movieData = {
          id: parseInt(movie.id),
          title: movie.title,
          poster_path: movie.poster_path,
          overview: movie.overview || '',
          release_date: movie.release_date || '',
          vote_average: movie.vote_average || 0
        };

        console.log('Prepared movie data:', movieData);

        console.log('=== ADDING MOVIE TO WATCHLIST ===');
        console.log('Movie:', movieData.title);
        console.log('Movie ID:', movieData.id);

        // Add to watchlist
        const result = await addToWatchlist(movieData);
        console.log('Add to watchlist result:', result);

        if (result) {
          console.log('=== MOVIE SUCCESSFULLY ADDED TO WATCHLIST IN DATABASE ===');
          console.log('Movie:', movieData.title, 'is now in your watchlist in the database');
        }

        // Show success message
        alert(`${movie.title} added to watchlist!`);

        // Refresh the page to update the UI
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.log('Attempting to remove from watchlist');
        await removeFromWatchlist(movie.id);
        console.log('Removed from watchlist');
        alert(`${movie.title} removed from watchlist!`);

        // Refresh the page to update the UI
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error handling watchlist:', error);
      alert('Error updating watchlist. Please try again.');
    }
  };

  return (
    <div className="movie-section">
      <div className="container">
        <div className="section-header">
          <h2>{title}</h2>
          {movies?.length > 0 && (
            <Link to={seeAllLink} className="see-all">
              View All <span className="arrow">→</span>
            </Link>
          )}
        </div>

        {movies?.length > 0 ? (
          <div className="movie-row">
            {movies.slice(0, 12).map((movie) => (
              <div
                className="movie-card-wrapper"
                key={movie.id}
                onMouseEnter={() => setHoveredMovie(movie.id)}
                onMouseLeave={() => setHoveredMovie(null)}
              >
                <Link to={`/movie/${movie.id}`} className={`movie-card ${hoveredMovie === movie.id ? 'hovered' : ''}`}>
                  <div className="movie-poster">
                    <img
                      src={movie.poster_path
                        ? `${IMAGE_BASE_URL}/w500${movie.poster_path}`
                        : 'https://via.placeholder.com/500x750/141414/ffffff?text=No+Poster'
                      }
                      alt={movie.title}
                      loading="lazy"
                    />
                    <div className="movie-overlay">
                      <div className="movie-actions">
                        <button className="action-btn play">
                          <span>▶</span>
                        </button>
                        <button
                          className={`action-btn ${watchlist.some(item => item.id === movie.id) ? 'active' : ''}`}
                          onClick={(e) => handleWatchlist(movie, e)}
                          style={{
                            backgroundColor: watchlist.some(item => item.id === movie.id) ? '#4CAF50' : '#e50914',
                            color: 'white',
                            fontWeight: 'bold',
                            padding: '8px',
                            borderRadius: '50%',
                            cursor: 'pointer'
                          }}
                        >
                          <span>{watchlist.some(item => item.id === movie.id) ? '✓' : '+'}</span>
                        </button>
                        <button className="action-btn">
                          <span>♥</span>
                        </button>
                      </div>
                      <div className="movie-info">
                        <div className="movie-meta">
                          <span className="movie-rating">{movie.vote_average ? `${Math.round(movie.vote_average * 10)}% Match` : 'NA'}</span>
                          <span className="movie-quality">HD</span>
                        </div>
                        <div className="movie-genres">
                          <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                          {movie.runtime && <span>{movie.runtime} min</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="movie-title">
                  <h3>{movie.title}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-movies">
            <p>No movies available in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Home = () => {
  const [tamilMovies, setTamilMovies] = useState([]);
  const [tamilDubbedMovies, setTamilDubbedMovies] = useState([]);
  const [latestTamilMovies, setLatestTamilMovies] = useState([]);
  const [topRatedTamilMovies, setTopRatedTamilMovies] = useState([]);
  const [upcomingTamilMovies, setUpcomingTamilMovies] = useState([]);
  const [tamilActionMovies, setTamilActionMovies] = useState([]);
  const [tamilComedyMovies, setTamilComedyMovies] = useState([]);
  const [tamilRomanceMovies, setTamilRomanceMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllMovies = async () => {
      try {
        setIsLoading(true);

        const tamilResponse = await fetch(
          `${API_URL}/discover/movie?api_key=${API_KEY}&with_original_language=ta&region=IN&sort_by=popularity.desc&include_adult=false&vote_average.lte=8.5`
        );
        const tamilData = await tamilResponse.json();
        setTamilMovies(filterAdultContent(tamilData.results));

        const dubbedResponse = await fetch(
          `${API_URL}/discover/movie?api_key=${API_KEY}&with_languages=ta&without_original_language=ta&region=IN&sort_by=popularity.desc&include_adult=false&vote_average.lte=8.5`
        );
        const dubbedData = await dubbedResponse.json();
        setTamilDubbedMovies(filterAdultContent(dubbedData.results));

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const latestResponse = await fetch(
          `${API_URL}/discover/movie?api_key=${API_KEY}&with_original_language=ta&region=IN&sort_by=release_date.desc&include_adult=false&vote_average.lte=8.5&primary_release_date.gte=${threeMonthsAgo.toISOString().split('T')[0]}`
        );
        const latestData = await latestResponse.json();
        setLatestTamilMovies(filterAdultContent(latestData.results));

        const topRatedResponse = await fetch(
          `${API_URL}/discover/movie?api_key=${API_KEY}&with_original_language=ta&region=IN&sort_by=vote_average.desc&vote_count.gte=100&include_adult=false&vote_average.lte=8.5`
        );
        const topRatedData = await topRatedResponse.json();
        setTopRatedTamilMovies(filterAdultContent(topRatedData.results));

        const upcomingResponse = await fetch(
          `${API_URL}/discover/movie?api_key=${API_KEY}&with_original_language=ta&region=IN&release_date.gte=${new Date().toISOString().split('T')[0]}&sort_by=release_date.asc&include_adult=false&vote_average.lte=8.5`
        );
        const upcomingData = await upcomingResponse.json();
        setUpcomingTamilMovies(filterAdultContent(upcomingData.results));

        const actionResponse = await fetch(
          `${API_URL}/discover/movie?api_key=${API_KEY}&with_original_language=ta&with_genres=28&region=IN&sort_by=popularity.desc&include_adult=false&vote_average.lte=8.5`
        );
        const actionData = await actionResponse.json();
        setTamilActionMovies(filterAdultContent(actionData.results));

        const comedyResponse = await fetch(
          `${API_URL}/discover/movie?api_key=${API_KEY}&with_original_language=ta&with_genres=35&region=IN&sort_by=popularity.desc&include_adult=false&vote_average.lte=8.5`
        );
        const comedyData = await comedyResponse.json();
        setTamilComedyMovies(filterAdultContent(comedyData.results));

        const romanceResponse = await fetch(
          `${API_URL}/discover/movie?api_key=${API_KEY}&with_original_language=ta&with_genres=10749&region=IN&sort_by=popularity.desc&include_adult=false&vote_average.lte=8.5`
        );
        const romanceData = await romanceResponse.json();
        setTamilRomanceMovies(filterAdultContent(romanceData.results));

      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllMovies();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading movies...</p>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to MovieHub</h1>
          <p>Discover the Best of Tamil Cinema</p>
          <Link to="/search?language=ta" className="browse-button">
            Browse Tamil Movies
          </Link>
        </div>
      </div>

      <MovieSection
        title="Latest Tamil Releases"
        movies={latestTamilMovies}
        seeAllLink="/search?language=ta&sort=latest"
      />

      <MovieSection
        title="Popular Tamil Movies"
        movies={tamilMovies}
        seeAllLink="/search?language=ta&sort=popular"
      />

      <MovieSection
        title="Tamil Dubbed Movies"
        movies={tamilDubbedMovies}
        seeAllLink="/search?language=ta&dubbed=true"
      />

      <MovieSection
        title="Top Rated Tamil Movies"
        movies={topRatedTamilMovies}
        seeAllLink="/search?language=ta&sort=top_rated"
      />

      <MovieSection
        title="Upcoming Tamil Movies"
        movies={upcomingTamilMovies}
        seeAllLink="/search?language=ta&sort=upcoming"
      />

      <MovieSection
        title="Tamil Action Movies"
        movies={tamilActionMovies}
        seeAllLink="/search?language=ta&genre=action"
      />

      <MovieSection
        title="Tamil Comedy Movies"
        movies={tamilComedyMovies}
        seeAllLink="/search?language=ta&genre=comedy"
      />

      <MovieSection
        title="Tamil Romance Movies"
        movies={tamilRomanceMovies}
        seeAllLink="/search?language=ta&genre=romance"
      />
    </div>
  );
};

export default Home;