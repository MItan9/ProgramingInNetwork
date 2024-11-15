CREATE DATABASE IF NOT EXISTS lab;

USE lab;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(255) NOT NULL,
    MDLPrice DECIMAL(10, 2) NOT NULL,
    EURPrice DECIMAL(10, 2) NOT NULL
);