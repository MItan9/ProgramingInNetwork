const express = require('express');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const mysql = require('mysql2');

// Настройка базы данных
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'lab'
});

db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        return;
    }
    console.log('Подключение к базе данных установлено');
});

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

app.use(express.json());

// Загрузка и вставка данных из JSON файла
fs.readFile('products.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Ошибка при чтении файла:', err);
        return;
    }

    const products = JSON.parse(data);

    // Вставка каждого продукта в базу данных
    products.forEach(product => {
        const { ProductName, MDLPrice, EURPrice } = product;
        const query = 'INSERT INTO products (ProductName, MDLPrice, EURPrice) VALUES (?, ?, ?)';
        db.query(query, [ProductName, MDLPrice, EURPrice], (err, result) => {
            if (err) {
                console.error('Ошибка при вставке продукта:', err);
            } else {
                console.log(`Продукт ${ProductName} успешно добавлен`);
            }
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

// WebSocket логика для чата
const chatRoomUsers = new Set();

wss.on('connection', (ws) => {
    let username;

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.command) {
            case 'join_room':
                username = data.username;
                chatRoomUsers.add(ws);
                broadcast({
                    command: 'user_joined',
                    username,
                    message: `${username} присоединился к комнате`
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
                    message: `${username} покинул комнату`
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
            message: `${username} отключился`
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

// Запуск сервера
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
