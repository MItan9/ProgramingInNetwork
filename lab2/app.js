const express = require('express');
const db = require('./loadAndInsertProducts');  
const fs = require('fs');
const app = express();

app.use(express.json()); 

// Load and insert data from a JSON file
fs.readFile('products.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    const products = JSON.parse(data);

    // Insert each product into the database
    products.forEach(product => {
        const { ProductName, MDLPrice, EURPrice } = product;
        const query = 'INSERT INTO products (ProductName, MDLPrice, EURPrice) VALUES (?, ?, ?)';
        db.query(query, [ProductName, MDLPrice, EURPrice], (err, result) => {
            if (err) {
                console.error('Error inserting product:', err);
            } else {
                console.log(`Product ${ProductName} added successfully`);
            }
        });
    });
});

// CRUD operations
// Create a new product
app.post('/products', (req, res) => {
    const { ProductName, MDLPrice, EURPrice } = req.body;
    const query = 'INSERT INTO products (ProductName, MDLPrice, EURPrice) VALUES (?, ?, ?)';
    db.query(query, [ProductName, MDLPrice, EURPrice], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Product added', productId: result.insertId });
    });
});

// Read a product
app.get('/products', (req, res) => {
    const { id, name, offset = 0, limit = 10 } = req.query;
    let query = 'SELECT * FROM products';
    let queryParams = [];

    if (id) {
        query += ' WHERE id = ?';
        queryParams.push(id);
    } else if (name) {
        query += ' WHERE ProductName = ?';
        queryParams.push(name);
    }

    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    db.query(query, queryParams, (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

// Update a product
app.put('/products', (req, res) => {
    const { id, ProductName, MDLPrice, EURPrice } = req.body;
    const query = 'UPDATE products SET ProductName = ?, MDLPrice = ?, EURPrice = ? WHERE id = ?';
    db.query(query, [ProductName, MDLPrice, EURPrice, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Product updated' });
    });
});

// Delete a product
app.delete('/products', (req, res) => {
    const { id } = req.query;
    const query = 'DELETE FROM products WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: `Product with id ${id} deleted` });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
