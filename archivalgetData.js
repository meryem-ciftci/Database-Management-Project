require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');

const archival = require('./src/archival');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'src'))); 

const pool = mysql.createPool({
  host: 'localhost',       
  user: 'root',            
  password: process.env.DB_PASSWORD,    
  database: 'LibraryDB', 
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0
});

// Veritabanı bağlantısını rotalarda (archival.js içinde) kullanabilmek için uygulamaya ekliyoruz
app.set('db', pool);

app.use('/api', archival); 

// Sunucuyu ayağa kaldırıyoruz
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});