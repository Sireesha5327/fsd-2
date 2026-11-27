import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

// Parse JSON request bodies. Malformed JSON is handled by the error middleware below.
app.use(express.json({ limit: '1mb' }));

// In-memory storage: products are cleared whenever the server restarts.
const products = [];

const parseProductId = (value) => {
    if (value === undefined || value === null || String(value).trim() === '') {
        return null;
    }

    const id = Number(value);
    return Number.isSafeInteger(id) ? id : null;
};

// Home route
app.get('/', (req, res) => {
    res.status(200).send('FSD-2 Non-Persistent App is Running Successfully!');
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy'
    });
});

// Create a product
app.post('/products', (req, res) => {
    const newProduct = req.body;

    if (!newProduct || typeof newProduct !== 'object' || Array.isArray(newProduct)) {
        return res.status(400).json({ message: 'Please provide a valid product object' });
    }

    const productId = parseProductId(newProduct.id);
    if (productId === null) {
        return res.status(400).json({ message: 'A valid integer product id is required' });
    }

    if (products.some((product) => product.id === productId)) {
        return res.status(409).json({ message: 'A product with this id already exists' });
    }

    const productToSave = { ...newProduct, id: productId };
    products.push(productToSave);

    return res.status(201).json({
        message: 'Product created successfully',
        data: productToSave
    });
});

// Read all products
app.get('/products', (req, res) => {
    res.status(200).json({
        message: 'Products fetched successfully',
        data: products
    });
});

// Read one product
app.get('/products/:id', (req, res) => {
    const productId = parseProductId(req.params.id);
    if (productId === null) {
        return res.status(400).json({ message: 'Product id must be an integer' });
    }

    const product = products.find((item) => item.id === productId);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({
        message: 'Product details fetched successfully',
        data: product
    });
});

// Update a product
app.put('/products/:id', (req, res) => {
    const productId = parseProductId(req.params.id);
    if (productId === null) {
        return res.status(400).json({ message: 'Product id must be an integer' });
    }

    const updates = req.body;
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        return res.status(400).json({ message: 'Please provide a valid product object' });
    }

    if (updates.id !== undefined && parseProductId(updates.id) !== productId) {
        return res.status(400).json({ message: 'Product id cannot be changed' });
    }

    const productIndex = products.findIndex((item) => item.id === productId);
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }

    products[productIndex] = {
        ...products[productIndex],
        ...updates,
        id: productId
    };

    return res.status(200).json({
        message: 'Product updated successfully',
        data: products[productIndex]
    });
});

// Delete a product
app.delete('/products/:id', (req, res) => {
    const productId = parseProductId(req.params.id);
    if (productId === null) {
        return res.status(400).json({ message: 'Product id must be an integer' });
    }

    const productIndex = products.findIndex((item) => item.id === productId);
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }

    const [deletedProduct] = products.splice(productIndex, 1);
    return res.status(200).json({
        message: 'Product deleted successfully',
        data: deletedProduct
    });
});

// Unknown routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Central error handler (including malformed JSON)
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof SyntaxError && err.status === 400 && Object.prototype.hasOwnProperty.call(err, 'body')) {
        return res.status(400).json({ message: 'Invalid JSON in request body' });
    }

    console.error('Server error:', err);
    return res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
