import express from 'express';

const app = express();

// Parse incoming JSON request bodies
app.use(express.json());

// Render provides PORT automatically; use 5000 locally
const PORT = process.env.PORT || 5000;

// Temporary in-memory product storage (data resets when server restarts)
const products = [];

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

// POST - Create a product
app.post('/products', (req, res) => {
    const newProduct = req.body;

    if (!newProduct || typeof newProduct !== 'object' || Array.isArray(newProduct)) {
        return res.status(400).json({
            message: 'Please provide a valid product object'
        });
    }

    if (newProduct.id === undefined || newProduct.id === null) {
        return res.status(400).json({
            message: 'Product id is required'
        });
    }

    const productId = Number(newProduct.id);

    if (!Number.isInteger(productId)) {
        return res.status(400).json({
            message: 'Product id must be an integer'
        });
    }

    const alreadyExists = products.some((product) => Number(product.id) === productId);

    if (alreadyExists) {
        return res.status(409).json({
            message: 'A product with this id already exists'
        });
    }

    const productToSave = { ...newProduct, id: productId };
    products.push(productToSave);

    return res.status(201).json({
        message: 'Product created successfully',
        data: productToSave
    });
});

// GET - Read all products
app.get('/products', (req, res) => {
    res.status(200).json({
        message: 'Products fetched successfully',
        data: products
    });
});

// GET - Read a product by ID
app.get('/products/:id', (req, res) => {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
        return res.status(400).json({
            message: 'Product id must be an integer'
        });
    }

    const product = products.find((item) => Number(item.id) === productId);

    if (!product) {
        return res.status(404).json({
            message: 'Product not found'
        });
    }

    return res.status(200).json({
        message: 'Product details fetched successfully',
        data: product
    });
});

// PUT - Update a product by ID
app.put('/products/:id', (req, res) => {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
        return res.status(400).json({
            message: 'Product id must be an integer'
        });
    }

    const productIndex = products.findIndex(
        (item) => Number(item.id) === productId
    );

    if (productIndex === -1) {
        return res.status(404).json({
            message: 'Product not found'
        });
    }

    const updates = req.body;

    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        return res.status(400).json({
            message: 'Please provide a valid product object'
        });
    }

    if (updates.id !== undefined && Number(updates.id) !== productId) {
        return res.status(400).json({
            message: 'Product id cannot be changed'
        });
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

// DELETE - Delete a product by ID
app.delete('/products/:id', (req, res) => {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
        return res.status(400).json({
            message: 'Product id must be an integer'
        });
    }

    const productIndex = products.findIndex(
        (item) => Number(item.id) === productId
    );

    if (productIndex === -1) {
        return res.status(404).json({
            message: 'Product not found'
        });
    }

    const deletedProduct = products.splice(productIndex, 1)[0];

    return res.status(200).json({
        message: 'Product deleted successfully',
        data: deletedProduct
    });
});

// Handle invalid JSON bodies
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            message: 'Invalid JSON in request body'
        });
    }

    return next(err);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
