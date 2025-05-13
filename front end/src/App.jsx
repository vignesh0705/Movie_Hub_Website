import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MovieProvider } from './context/MovieContext';
import { WatchlistProvider } from './context/WatchlistContext';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Search from './components/Search/Search';
import Watchlist from './components/Watchlist/Watchlist';
import Favorites from './components/Favorites/Favorites';
import MovieDetail from './components/MovieDetail/MovieDetail';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <MovieProvider>
      <WatchlistProvider>
        <Router>
          <div className="app">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/home" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/movie/:id" element={
                <ProtectedRoute>
                  <MovieDetail />
                </ProtectedRoute>
              } />
              <Route path="/search" element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              } />
              <Route path="/watchlist" element={
                <ProtectedRoute>
                  <Watchlist />
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />
              
              {/* Default Route */}
              <Route path="/" element={<Navigate to="/home" />} />
            </Routes>
          </div>
        </Router>
      </WatchlistProvider>
    </MovieProvider>
  );
}

export default App;