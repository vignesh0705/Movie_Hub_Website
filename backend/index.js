const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/user');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://vicky:vicky072005@cluster0.fzruktz.mongodb.net/';

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('MovieHub backend is running');
});

app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'Email is already registered.' });
        }

        const user = new User({ name, email, password });
        await user.save();

        res.status(201).json({
            message: 'User created successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                watchlist: user.watchlist,
                favorites: user.favorites,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        res.json({
            message: 'Login successful.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                watchlist: user.watchlist,
                favorites: user.favorites,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

app.get('/checkUser', async (req, res) => {
    try {
        const email = req.query.email?.toLowerCase();
        if (!email) {
            return res.status(400).json({ message: 'Email query parameter is required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            watchlist: user.watchlist,
            favorites: user.favorites,
        });
    } catch (error) {
        console.error('Check user error:', error);
        res.status(500).json({ message: 'Server error during user lookup.' });
    }
});

app.post('/addToWatchlist', async (req, res) => {
    try {
        const { email, movie } = req.body;
        if (!email || !movie) {
            return res.status(400).json({ message: 'Email and movie payload are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const alreadyExists = user.watchlist.some((item) => item.id === movie.id);
        if (!alreadyExists) {
            user.watchlist.push(movie);
            await user.save();
        }

        res.json({ message: 'Movie added to watchlist.', watchlist: user.watchlist });
    } catch (error) {
        console.error('Add to watchlist error:', error);
        res.status(500).json({ message: 'Server error adding movie to watchlist.' });
    }
});

app.post('/removeFromWatchlist', async (req, res) => {
    try {
        const { email, movieId } = req.body;
        if (!email || movieId === undefined) {
            return res.status(400).json({ message: 'Email and movieId are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.watchlist = user.watchlist.filter((item) => item.id !== movieId);
        await user.save();

        res.json({ message: 'Movie removed from watchlist.', watchlist: user.watchlist });
    } catch (error) {
        console.error('Remove from watchlist error:', error);
        res.status(500).json({ message: 'Server error removing movie from watchlist.' });
    }
});

app.get('/getUserWatchlist', async (req, res) => {
    try {
        const email = req.query.email?.toLowerCase();
        if (!email) {
            return res.status(400).json({ message: 'Email query parameter is required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ watchlist: user.watchlist });
    } catch (error) {
        console.error('Get watchlist error:', error);
        res.status(500).json({ message: 'Server error fetching watchlist.' });
    }
});

app.post('/addToFavorites', async (req, res) => {
    try {
        const { email, movie } = req.body;
        if (!email || !movie) {
            return res.status(400).json({ message: 'Email and movie payload are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const alreadyExists = user.favorites.some((item) => item.id === movie.id);
        if (!alreadyExists) {
            user.favorites.push(movie);
            await user.save();
        }

        res.json({ message: 'Movie added to favorites.', favorites: user.favorites });
    } catch (error) {
        console.error('Add to favorites error:', error);
        res.status(500).json({ message: 'Server error adding movie to favorites.' });
    }
});

app.post('/removeFromFavorites', async (req, res) => {
    try {
        const { email, movieId } = req.body;
        if (!email || movieId === undefined) {
            return res.status(400).json({ message: 'Email and movieId are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.favorites = user.favorites.filter((item) => item.id !== movieId);
        await user.save();

        res.json({ message: 'Movie removed from favorites.', favorites: user.favorites });
    } catch (error) {
        console.error('Remove from favorites error:', error);
        res.status(500).json({ message: 'Server error removing movie from favorites.' });
    }
});

app.get('/getUserFavorites', async (req, res) => {
    try {
        const email = req.query.email?.toLowerCase();
        if (!email) {
            return res.status(400).json({ message: 'Email query parameter is required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ favorites: user.favorites });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ message: 'Server error fetching favorites.' });
    }
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});