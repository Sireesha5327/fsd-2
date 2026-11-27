import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "booksDB";

app.use(express.json());

let db;

const isValidId = (id) => ObjectId.isValid(id) && String(new ObjectId(id)) === id;

app.get("/", (req, res) => {
  res.status(200).json({ message: "Books API is running" });
});

// Create a book
app.post("/api/v1/books", async (req, res) => {
  try {
    const { title, author, category, price } = req.body;
    if (!title || !author || !category || price === undefined) {
      return res.status(400).json({ message: "title, author, category and price are required" });
    }
    const result = await db.collection("books").insertOne({ title, author, category, price });
    return res.status(201).json({
      message: "Book created successfully",
      data: { _id: result.insertedId }
    });
  } catch (error) {
    return res.status(500).json({ message: "Error creating book", error: error.message });
  }
});

// Read all books, optionally filtered by category
app.get("/api/v1/books", async (req, res) => {
  try {
    const query = req.query.category ? { category: req.query.category } : {};
    const books = await db.collection("books").find(query).toArray();
    return res.status(200).json({ message: "Books fetched successfully", data: books });
  } catch (error) {
    return res.status(500).json({ message: "Problem fetching books", error: error.message });
  }
});

// Read one book
app.get("/api/v1/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid book id" });
    const book = await db.collection("books").findOne({ _id: new ObjectId(id) });
    if (!book) return res.status(404).json({ message: "Book not found" });
    return res.status(200).json({ message: "Book fetched successfully", data: book });
  } catch (error) {
    return res.status(500).json({ message: "Problem fetching book details", error: error.message });
  }
});

// Update a book
app.put("/api/v1/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid book id" });
    const { _id, ...updates } = req.body;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Provide at least one field to update" });
    }
    const result = await db.collection("books").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: "Book not found" });
    return res.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Problem updating book", error: error.message });
  }
});

// Delete a book
app.delete("/api/v1/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid book id" });
    const result = await db.collection("books").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Book not found" });
    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Problem deleting book", error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

const startServer = async () => {
  if (!MONGO_URL) {
    console.error("MONGO_URI is missing. Add it to the environment variables.");
    process.exit(1);
  }

  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`Connected to database: ${DB_NAME}`);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    await client.close().catch(() => {});
    process.exit(1);
  }
};

startServer();
