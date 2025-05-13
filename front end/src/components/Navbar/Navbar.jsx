import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWatchlist } from '../../context/WatchlistContext';
import './Navbar.css';

const Navbar = () => {
  const { watchlistCount } = useWatchlist();
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="prime-navbar">
      <div className="nav-container">
        <Link to="/home" className="nav-logo">MovieHub</Link>
        
        {isAuthenticated && (
          <div className="nav-center-links">
            <Link to="/home" className="nav-link">Home</Link>
            <Link to="/search" className="nav-link">Search</Link>
            <Link to="/watchlist" className="nav-link">
              Watchlist
              {/* {watchlistCount > 0 && (
                <span className="watchlist-counter">{watchlistCount}</span>
              )} */}
            </Link>
            <Link to="/favorites" className="nav-link">Favorites</Link>
          </div>
        )}

        <div className="nav-auth-buttons">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="nav-auth-link">Logout</button>
          ) : (
            <>
              <Link to="/login" className="nav-auth-link">Login</Link>
              <Link to="/signup" className="nav-auth-button">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;