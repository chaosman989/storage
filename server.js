const multer = require('multer');
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const { error } = require('console');
const app = express();

// 1. Ensure the uploads directory exists
if (!fs.existsSync('uploads')) { fs.mkdirSync('uploads'); }

// 2. Serve static files from the project root and the uploads folder
app.use(express.static(__dirname)); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination:  (req, file, cb) =>{
        cb(null, 'X:/');
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
        const [rows] = await db.execute("SELECT filename, custom_name, path FROM files");
        res.json(rows);
    } catch (err) {
        res.status(500).send('Database error');
    }
});

app.post('/truncate-db', async (req, res) =>{
    const sql = "TRUNCATE TABLE files;";
    try{
        // 1. Delete all physical files from the disk
        const uploadDir = ('X:/uploads');
        
        if (fs.existsSync(uploadDir)) {
            const filesInFolder = fs.readdirSync(uploadDir);
            
            for (const file of filesInFolder) {
                fs.unlinkSync(path.join(uploadDir, file));
            }
            console.log("All physical files deleted.");
        }
        await db.execute(sql);
        res.sendStatus(200);
    }
     catch(error){
        console.error(error);
        res.sendStatus(500);
    
} 

});





// 4. Serving the index page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 5. Upload handler
app.post('/uploads', upload.single('Myfile'), async (req, res) => {
    if (!req.file){
        return res.status(400).send('<h1> please add a file<h1> <a href="/storage.html"</a>')
    }
    try {

        const customname = req.body.customName || req.file.originalname
        
       
        const { filename, originalname, path: filePath } = req.file;
        const sql = 'INSERT INTO files (filename, custom_name, path) VALUES (?, ?, ?)';
        await db.execute(sql, [filename, customname, filePath]);
        res.send('<h1>Success</h1> <a href="/storage.html">back</a>');
    } catch (error) {
        console.error(error);
        res.status(500).send('DB error');
    }
});


app.listen(3000, () => console.log('storagetest:3000'));