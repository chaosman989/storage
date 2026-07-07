const multer = require('multer');
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const app = express();

// 1. Ensure the uploads directory exists
if (!fs.existsSync('uploads')) { fs.mkdirSync('uploads'); }

// 2. Serve static files from the project root and the uploads folder
app.use(express.static(__dirname)); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb){
        // Keeps the unique timestamp + original name for readability
        const dater = Date.now() + '-' + file.originalname;
        cb(null, dater);
    }
});

const upload = multer({ storage: storage});

const db = mysql.createPool ({
    host: 'localhost',
    user: 'root',
    password: '1111',
    database: 'storage'
});

// 3. API route to get file list
app.get('/api/files', async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT filename, path FROM files");
        res.json(rows);
    } catch (err) {
        res.status(500).send('Database error');
    }
});

// 4. Serving the index page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 5. Upload handler
app.post('/uploads', upload.single('Myfile'), async (req, res) => {
    try {
       
        const { filename, originalname, path: filePath } = req.file;
        const sql = 'INSERT INTO files (filename, original_name, path) VALUES (?, ?, ?)';
        await db.execute(sql, [filename, originalname, filePath]);
        res.send('<h1>Success</h1> <a href="/storage.html">back</a>');
    } catch (error) {
        console.error(error);
        res.status(500).send('DB error');
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));