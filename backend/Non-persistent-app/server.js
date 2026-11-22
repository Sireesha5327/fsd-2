
import express from 'express';

const app = express();

app.use(express.json());

// Render automatically provides PORT
const PORT = process.env.PORT || 5000;

// Home route
app.get('/', (req, res) => {
    res.status(200).send(
        'FSD-2 Non-Persistent App is Running Successfully!'
    );
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});





/*
curl -X POST http://localhost:5000/products -H "Content-Type: application/json" -d "{\"id\":1,\"name\":\"Laptop\",\"price\":55000}"
curl -X POST http://localhost:5000/products -H "Content-Type: application/json" -d "{\"id\":2,\"name\":\"Mobile\",\"price\":25000}"
curl -X POST http://localhost:5000/products -H "Content-Type: application/json" -d "{\"id\":3,\"name\":\"Headphones\",\"price\":2000}"
curl http://localhost:5000/products
curl http://localhost:5000/products/1
curl http://localhost:5000/products/2
curl -X PUT http://localhost:5000/products/1 -H "Content-Type: application/json" -d "{\"name\":\"Gaming Laptop\",\"price\":65000}"
curl -X PUT http://localhost:5000/products/2 -H "Content-Type: application/json" -d "{\"price\":22000}"
curl http://localhost:5000/products/1
curl -X DELETE http://localhost:5000/products/3
curl -X DELETE http://localhost:5000/products/2
curl http://localhost:5000/products
*/
