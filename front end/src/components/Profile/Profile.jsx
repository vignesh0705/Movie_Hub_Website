import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/api';
import { useMovieContext } from '../../context/MovieContext';
import { useWatchlist } from '../../context/WatchlistContext';
import './Profile.css';

const Profile = () => {
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  }, []);

  const { favorites } = useMovieContext();
  const { watchlist } = useWatchlist();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(storedUser.email));

  useEffect(() => {
    const loadProfile = async () => {
      if (!storedUser.email) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await userService.getProfile(storedUser.email);
        setProfileData(response);
      } catch (error) {
        console.error('Profile load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [storedUser.email]);

  const user = profileData?.user || storedUser;
  const serverWatchlist = profileData?.watchlist || watchlist || [];
  const serverFavorites = profileData?.favorites || favorites || [];
  const displayName = user?.name || user?.email?.split('@')[0] || 'MovieHub User';
  const initials = displayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="profile-avatar" aria-hidden="true">{initials}</div>
        <div>
          <p className="profile-kicker">Profile</p>
          <h1>{displayName}</h1>
          <p className="profile-email">{user?.email || 'No email available'}</p>
        </div>
      </section>

      <section className="profile-stats" aria-label="Account stats">
        <div className="profile-stat">
          <span>{serverWatchlist.length}</span>
          <p>Watchlist Movies</p>
        </div>
        <div className="profile-stat">
          <span>{serverFavorites.length}</span>
          <p>Favorites</p>
        </div>
        <div className="profile-stat">
          <span>{isLoading ? '...' : 'Active'}</span>
          <p>Membership</p>
        </div>
      </section>

      <section className="profile-details">
        <div className="profile-panel">
          <h2>Account Details</h2>
          <dl>
            <div>
              <dt>User ID</dt>
              <dd>{user?.id || 'Local session'}</dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{displayName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user?.email || 'Not available'}</dd>
            </div>
          </dl>
        </div>

        <div className="profile-panel">
          <h2>Your Library</h2>
          <div className="profile-actions">
            <Link to="/watchlist">Open Watchlist</Link>
            <Link to="/favorites">Open Favorites</Link>
            <Link to="/search">Find Movies</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Profile;
