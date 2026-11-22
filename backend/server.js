import express from "express";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("FSD-2 Express backend is running");
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
