import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './Auth.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting to sign up with Render backend:', {
        username: formData.username,
        email: formData.email,
        password: '********' // Don't log actual password
      });

      // Call the signup API
      const response = await authService.signup({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      console.log('Signup successful:', response);

      // Redirect to login page after successful signup
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err);

      // Provide more specific error messages based on the error
      if (err.message && err.message.includes('Network')) {
        setError('Network error: Unable to reach the server. Please check your internet connection or try again later.');
        console.error('Network error details:', err);
      } else if (err.message && err.message.includes('already exists')) {
        setError('This email is already registered. Please use a different email or try logging in.');
      } else if (err.message && err.message.includes('status code 405')) {
        setError('The signup service is currently unavailable. Please try again later.');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-container">
      <section className="auth-copy">
        <p>Start your watch party</p>
        <h1>Create a MovieHub profile for favorites, watchlists, and trailers.</h1>
      </section>

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="signup-username">Username</label>
          <input
            id="signup-username"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="signup-confirm-password">Confirm Password</label>
          <input
            id="signup-confirm-password"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
};

export default SignUp;
