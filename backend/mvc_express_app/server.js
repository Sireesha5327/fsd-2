
import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("FSD-2 Express backend is running!");
});

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
