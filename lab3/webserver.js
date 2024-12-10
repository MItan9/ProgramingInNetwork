import express from 'express';
import mysql from 'mysql2';

const app = express();
app.use(express.json());

const dbConfig = {
  host: '127.0.0.1', 
  user: 'admin', 
  password: 'adminpassword', 
  database: 'lab', 
  port: 3306, 
};

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to the database');
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(255) NOT NULL,
    MDLPrice DECIMAL(10, 2) NOT NULL,
    EURPrice DECIMAL(10, 2) NOT NULL
  );
`;

db.query(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Table "products" ensured to exist');
  }
});

app.post('/products', (req, res) => {
  const { ProductName, MDLPrice, EURPrice } = req.body;
  const query = 'INSERT INTO products (ProductName, MDLPrice, EURPrice) VALUES (?, ?, ?)';
  db.query(query, [ProductName, MDLPrice, EURPrice], (err, result) => {
    if (err) {
      console.error('Error inserting product:', err);
      return res.status(500).send({ error: 'Database error' });
    }
    res.send({ message: 'Product added successfully', productId: result.insertId });
  });
});

const PORT = 3001; // Изменен порт
app.listen(PORT, () => {
  console.log(`Web server running on http://localhost:${PORT}`);
});
