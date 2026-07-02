const multer = require('multer');
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const app = express();
const db = mysql.createPool ({
    host: 'localhost',
    user: 'root',
    password: '1111',
    database: 'storage'
});

app.get('/', (req, res) =>
{
res.sendFile(path.join(__dirname, 'index.html'))
});


app.post('/uploads')