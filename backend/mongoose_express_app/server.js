import express from "express";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  director: { type: String, trim: true },
  category: { type: String, required: true, trim: true },
  year: { type: Number, required: true }
});
const Movie = mongoose.model("Movie", movieSchema, "movie");

app.get("/", (req, res) => {
  res.status(200).json({ message: "Movie API server is running" });
});

app.post("/api/v1/movie", async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    return res.status(201).json({ message: "Movie created successfully", data: movie });
  } catch (error) {
    return res.status(400).json({ message: "Failed to create movie", error: error.message });
  }
});

app.get("/api/v1/movie", async (req, res) => {
  try {
    const query = req.query.category ? { category: req.query.category } : {};
    const movies = await Movie.find(query);
    return res.status(200).json({ message: "Movies fetched successfully", data: movies });
  } catch (error) {
    return res.status(500).json({ message: "Problem fetching movies", error: error.message });
  }
});

app.get("/api/v1/movie/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid movie id" });
    }
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    return res.status(200).json({ message: "Movie details fetched successfully", data: movie });
  } catch (error) {
    return res.status(500).json({ message: "Problem fetching movie details", error: error.message });
  }
});

app.put("/api/v1/movie/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid movie id" });
    }
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    return res.status(200).json({ message: "Movie updated successfully", data: movie });
  } catch (error) {
    return res.status(400).json({ message: "Problem updating movie", error: error.message });
  }
});

app.delete("/api/v1/movie/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid movie id" });
    }
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    return res.status(200).json({ message: "Movie deleted successfully", data: movie });
  } catch (error) {
    return res.status(500).json({ message: "Problem deleting movie", error: error.message });
  }
});

const startServer = async () => {
  if (!process.env.MONGO_URL) {
    console.error("MONGO_URL is missing. Add it to the environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME
    });
    console.log("Connected to MongoDB");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
