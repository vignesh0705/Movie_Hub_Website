import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const hideNavbar = ['/login', '/signup'].includes(location.pathname);

  if (hideNavbar) {
    return null;
  }

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
            <NavLink to="/home" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
            <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Search</NavLink>
            <NavLink to="/watchlist" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Watchlist
            </NavLink>
            <NavLink to="/favorites" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Favorites</NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Profile</NavLink>
          </div>
        )}

        <div className="nav-auth-buttons">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="nav-profile-link">
                <span className="nav-avatar">{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                <span className="nav-profile-name">{user.name || 'Profile'}</span>
              </Link>
              <button onClick={handleLogout} className="nav-auth-link">Logout</button>
            </>
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
