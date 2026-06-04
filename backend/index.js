const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const User = require("./models/user");

const app = express();

const PORT = process.env.PORT || 5000;

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://vicky:vicky072005@cluster0.fzruktz.mongodb.net/"
        );

        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1);
    }
};

app.use(express.json());
app.use(cors());

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});