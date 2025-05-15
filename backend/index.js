const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const User = require("./models/user");
const dotenv = require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb+srv://vicky:vicky072005@cluster0.fzruktz.mongodb.net/';
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1);
    }
};

connectDB();

app.use(express.json());
app.use(cors());

// Routes
app.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({
            name: username,
            email,
            password
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Error creating user" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Error during login" });
    }
});

app.get("/getUserWatchlist", async (req, res) => {
    try {
        const { email } = req.query;
        console.log("Getting watchlist for user:", email);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ watchlist: user.watchlist });
    } catch (err) {
        console.error("Get watchlist error:", err);
        res.status(500).json({ message: "Error getting watchlist" });
    }
});

app.post("/addToWatchlist", async (req, res) => {
    try {
        const { email, movie } = req.body;
        console.log("Adding to watchlist:", { email, movie });

        const user = await User.findOne({ email });
        console.log("User found:", user ? user.email : "No user");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const movieToAdd = {
            id: parseInt(movie.id),
            title: movie.title,
            poster_path: movie.poster_path,
            overview: movie.overview || '',
            release_date: movie.release_date || '',
            vote_average: movie.vote_average || 0
        };

        console.log("Movie to add:", movieToAdd);
        console.log("User before update:", {
            id: user._id,
            email: user.email,
            watchlistLength: user.watchlist ? user.watchlist.length : 0
        });

        const result = await User.findByIdAndUpdate(
            user._id,
            { $addToSet: { watchlist: movieToAdd } },
            { new: true }
        );
        console.log("Movie details:", movieToAdd);
        console.log("User email:", user.email);
        console.log("Updated watchlist length in database:", result.watchlist.length);
        console.log("Watchlist in database:", result.watchlist);
        console.log("=== DATABASE UPDATE COMPLETE ===");

        res.status(200).json({
            message: "Added to watchlist",
            watchlist: result.watchlist
        });
    } catch (err) {
        console.error("Add to watchlist error:", err);
        res.status(500).json({ message: "Error adding to watchlist", error: err.message });
    }
});

app.post("/removeFromWatchlist", async (req, res) => {
    try {
        const { email, movieId } = req.body;
        console.log("Removing from watchlist:", { email, movieId });

        const user = await User.findOne({ email });
        console.log("User found:", user ? user.email : "No user");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.watchlist) {
            user.watchlist = [];
            return res.status(200).json({ message: "Watchlist is empty" });
        }

        console.log("Current watchlist length:", user.watchlist.length);
        console.log("Movie ID to remove:", movieId);
        const movieIdNum = parseInt(movieId);
        const result = await User.findByIdAndUpdate(
            user._id,
            { $pull: { watchlist: { id: movieIdNum } } },
            { new: true }
        );

        console.log("Updated user:", result);
        console.log("Movie removed from watchlist successfully");
        console.log("Updated watchlist length:", result.watchlist.length);

        res.status(200).json({
            message: "Removed from watchlist",
            watchlist: result.watchlist
        });
    } catch (err) {
        console.error("Remove from watchlist error:", err);
        res.status(500).json({ message: "Error removing from watchlist", error: err.message });
    }
});

app.get("/getUserFavorites", async (req, res) => {
    try {
        const { email } = req.query;
        console.log("Getting favorites for user:", email);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ favorites: user.favorites });
    } catch (err) {
        console.error("Get favorites error:", err);
        res.status(500).json({ message: "Error getting favorites" });
    }
});

app.post("/addToFavorites", async (req, res) => {
    try {
        const { email, movie } = req.body;
        console.log("Adding to favorites:", { email, movie });
        const user = await User.findOne({ email });
        console.log("User found:", user ? user.email : "No user");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const movieToAdd = {
            id: parseInt(movie.id),
            title: movie.title,
            poster_path: movie.poster_path,
            overview: movie.overview || '',
            release_date: movie.release_date || '',
            vote_average: movie.vote_average || 0
        };

        console.log("Movie to add to favorites:", movieToAdd);
        console.log("User before update:", {
            id: user._id,
            email: user.email,
            favoritesLength: user.favorites ? user.favorites.length : 0
        });

        const result = await User.findByIdAndUpdate(
            user._id,
            { $addToSet: { favorites: movieToAdd } },
            { new: true }
        );

        console.log("Updated user:", result);
        console.log("Movie added to favorites successfully");
        console.log("Updated favorites length:", result.favorites.length);

        res.status(200).json({
            message: "Added to favorites",
            favorites: result.favorites
        });
    } catch (err) {
        console.error("Add to favorites error:", err);
        res.status(500).json({ message: "Error adding to favorites", error: err.message });
    }
});

app.post("/removeFromFavorites", async (req, res) => {
    try {
        const { email, movieId } = req.body;
        console.log("Removing from favorites:", { email, movieId });

        const user = await User.findOne({ email });
        console.log("User found:", user ? user.email : "No user");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.favorites) {
            user.favorites = [];
            return res.status(200).json({ message: "Favorites is empty" });
        }

        console.log("Current favorites length:", user.favorites.length);
        console.log("Movie ID to remove:", movieId);
        const movieIdNum = parseInt(movieId);
        const result = await User.findByIdAndUpdate(
            user._id,
            { $pull: { favorites: { id: movieIdNum } } },
            { new: true }
        );

        console.log("Updated user:", result);
        console.log("Movie removed from favorites successfully");
        console.log("Updated favorites length:", result.favorites.length);

        res.status(200).json({
            message: "Removed from favorites",
            favorites: result.favorites
        });
    } catch (err) {
        console.error("Remove from favorites error:", err);
        res.status(500).json({ message: "Error removing from favorites", error: err.message });
    }
});

app.get("/addTestMovie", async (req, res) => {
    try {
        const { email } = req.query;
        console.log("Adding test movie for user:", email);
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const testMovie = {
            id: 12345,
            title: "Test Movie",
            poster_path: "/test.jpg",
            overview: "This is a test movie added directly from the backend",
            release_date: "2023-01-01",
            vote_average: 8.5
        };
        await User.updateOne(
            { _id: user._id },
            { $addToSet: { watchlist: testMovie } }
        );

        const updatedUser = await User.findOne({ email });
        console.log("User after update:", updatedUser);
        console.log("Test movie added to watchlist");

        res.status(200).json({
            message: "Test movie added to watchlist",
            watchlist: updatedUser.watchlist
        });
    } catch (err) {
        console.error("Add test movie error:", err);
        res.status(500).json({ message: "Error adding test movie", error: err.message });
    }
});

app.get("/checkUser", async (req, res) => {
    try {
        const { email } = req.query;
        console.log("Checking user data for:", email);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("User found:", {
            id: user._id,
            email: user.email,
            name: user.name,
            watchlistLength: user.watchlist ? user.watchlist.length : 0,
            favoritesLength: user.favorites ? user.favorites.length : 0
        });

        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            },
            watchlist: user.watchlist || [],
            favorites: user.favorites || []
        });
    } catch (err) {
        console.error("Check user error:", err);
        res.status(500).json({ message: "Error checking user data" });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
