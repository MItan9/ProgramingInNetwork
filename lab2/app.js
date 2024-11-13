const express = require('express');
const retry = require('retry');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const mysql = require('mysql2');

// Настройка базы данных
// const dbConfig = {
//     host: '127.0.0.1',
//     user: 'root',
//     password: 'root',
//     database: 'lab'
// };

const dbConfig = {
    host: process.env.DB_HOST || 'db', // Используем 'db' для подключения к контейнеру базы данных
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'lab',
    port: 3306
};

// db.connect((err) => {
//     if (err) {
//         console.error('Error connecting to the database:', err);  
//         return;
//     }
//     console.log('Database connection established');
// });

// const app = express();
// app.use(express.json());

// // Загрузка данных из JSON файла в базу данных
// fs.readFile('products.json', 'utf8', (err, data) => {
//     if (err) {
//         console.error('Error reading file:', err);
//         return;
//     }

//     const products = JSON.parse(data);
//     products.forEach(product => {
//         const { ProductName, MDLPrice, EURPrice } = product;
//         const query = 'INSERT INTO products (ProductName, MDLPrice, EURPrice) VALUES (?, ?, ?)';
//         db.query(query, [ProductName, MDLPrice, EURPrice], (err, result) => {
//             if (err) {
//                 console.error('Error inserting product:', err);
//             } else {
//                 console.log(`Product ${ProductName} added successfully`);
//             }
//         });
//     });
// });

const connectToDatabase = () => {
    const operation = retry.operation({ retries: 5, factor: 2, minTimeout: 1000 });

    operation.attempt((currentAttempt) => {
        const db = mysql.createConnection(dbConfig);

        db.connect((err) => {
            if (err) {
                console.error(`Attempt ${currentAttempt} - Error connecting to the database:`, err);
                if (operation.retry(err)) return;
                console.error('Could not establish a connection to the database after several attempts.');
            } else {
                console.log('Database connection established');
                setupApp(db);
            }
        });
    });
};

const setupApp = (db) => {
    const app = express();
    app.use(express.json());

    // Создаем таблицу, если она не существует
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
            return;
        }
        console.log('Table "products" ensured to exist');


    // Загружаем данные из JSON файла и вставляем в базу данных только если соединение установлено
    fs.readFile('products.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        const products = JSON.parse(data);
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

});

// CRUD операции для продуктов
app.post('/products', (req, res) => {
    const { ProductName, MDLPrice, EURPrice } = req.body;
    const query = 'INSERT INTO products (ProductName, MDLPrice, EURPrice) VALUES (?, ?, ?)';
    db.query(query, [ProductName, MDLPrice, EURPrice], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Product added', productId: result.insertId });
    });
});

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

app.put('/products', (req, res) => {
    const { id, ProductName, MDLPrice, EURPrice } = req.body;
    const query = 'UPDATE products SET ProductName = ?, MDLPrice = ?, EURPrice = ? WHERE id = ?';
    db.query(query, [ProductName, MDLPrice, EURPrice, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Product updated' });
    });
});

app.delete('/products', (req, res) => {
    const { id } = req.query;
    const query = 'DELETE FROM products WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: `Product with id ${id} deleted` });
    });
});

// Запуск HTTP сервера на порту 3000
const HTTP_PORT = 3000;
const httpServer = http.createServer(app);
httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP server running at http://localhost:${HTTP_PORT}`);
});

// WebSocket сервер для чата на порту 3001
const WEBSOCKET_PORT = 3001;
const wss = new WebSocket.Server({ port: WEBSOCKET_PORT });
const chatRoomUsers = new Set();

wss.on('connection', (ws) => {
    let username;

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('DATA', data);

        switch (data.command) {
            case 'join_room':
                username = data.username;
                chatRoomUsers.add(ws);
                broadcast({
                    command: 'user_joined',
                    username,
                    message: `${username} joined the room`
                });
                break;

            case 'send_msg':
                if (chatRoomUsers.has(ws)) {
                    const chatMessage = {
                        command: 'new_message',
                        username,
                        message: data.message
                    };
                    broadcast(chatMessage);
                }
                break;

            case 'leave_room':
                chatRoomUsers.delete(ws);
                broadcast({
                    command: 'user_left',
                    username,
                    message: `${username} left the room`
                });
                ws.close();
                break;
        }
    });

    ws.on('close', () => {
        chatRoomUsers.delete(ws);
        broadcast({
            command: 'user_left',
            username,
            message: `${username} disconnected`
        });
    });
});

function broadcast(data) {
    const message = JSON.stringify(data);
    chatRoomUsers.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

console.log(`WebSocket server running at ws://localhost:${WEBSOCKET_PORT}`);


};

connectToDatabase();