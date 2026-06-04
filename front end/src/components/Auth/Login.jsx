import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (formData.email && formData.password) {
        console.log('Attempting to log in with Render backend:', {
          email: formData.email,
          password: '********' // Don't log actual password
        });

        const response = await authService.login(formData);

        // Store user data in localStorage
        localStorage.setItem('isLoggedIn', 'true');

        // Log the response to see what we're getting
        console.log('Login response from Render backend:', response);

        // Store complete user data
        localStorage.setItem('user', JSON.stringify({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name
        }));

        // Log what we stored
        console.log('Stored user data:', JSON.parse(localStorage.getItem('user')));

        // Show success message
        console.log('Login successful! Redirecting to home page...');

        // Navigate to home and refresh to ensure contexts are reinitialized
        navigate('/home');
        // Add a small delay before refreshing to ensure navigation completes
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        setError('Please fill in all fields');
      }
    } catch (err) {
      console.error('Login error:', err);

      // Provide more specific error messages based on the error
      if (err.message && err.message.includes('Network')) {
        setError('Network error: Unable to reach the server. Please check your internet connection or try again later.');
        console.error('Network error details:', err);
      } else if (err.message && err.message.includes('Invalid credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message && err.message.includes('status code 405')) {
        setError('The login service is currently unavailable. Please try again later.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-container">
      <section className="auth-copy">
        <p>Unlimited movie nights</p>
        <h1>Stream Tamil cinema and build your personal library.</h1>
      </section>

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign in</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <p className="auth-switch">
          New to MovieHub? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </main>
  );
};

export default Login;
