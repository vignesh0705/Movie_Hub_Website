# Movie Website

A full-stack movie website for browsing Tamil movies, with features like watchlist and favorites.

## Live Demo

Frontend: [https://movie-website-theta-swart.vercel.app](https://movie-website-theta-swart.vercel.app)

## Features

- Browse Tamil movies by category (latest, popular, top-rated, etc.)
- View movie details including cast, budget, and revenue
- Add movies to watchlist and favorites
- User authentication (signup/login)
- Responsive design for all devices

## Tech Stack

### Frontend
- React with Vite
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling

### Backend
- Node.js with Express
- MongoDB with Mongoose
- bcryptjs for password hashing

### APIs
- TMDB (The Movie Database) API for movie data

## Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set the following environment variables in Vercel:
   - `VITE_API_BASE_URL`: Your backend API URL
   - `VITE_TMDB_API_KEY`: Your TMDB API key
4. Deploy the project

### Backend Deployment (Vercel)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set the following environment variables in Vercel:
   - `MONGODB_URI`: Your MongoDB connection string
   - `PORT`: 5000 (or any port you prefer)
4. Deploy the project

## Local Development

### Frontend

```bash
cd "front end"
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm start
```

## Environment Variables

### Frontend (.env)

```
VITE_API_BASE_URL=https://movie-website-theta-swart.vercel.app
VITE_TMDB_API_KEY=your_tmdb_api_key
```

### Backend (.env)

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

## License

MIT
