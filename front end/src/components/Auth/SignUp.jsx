import React, { useState } from 'react';
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

      // Show success message
      alert('Signup successful! Please log in with your new account.');

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
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />
        </div>
        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;