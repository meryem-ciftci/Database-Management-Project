
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

const pool = mysql.createPool({
  host: 'localhost',       
  user: 'root',            
  password: DB_PASSWORD,    
  database: 'LibraryDB' 
});


app.get('/api/users', async (req, res) => {
  try {

    const [rows] = await pool.query('SELECT * FROM users');
    
    
    res.json(rows); 
    
  } catch (err) {
    
    res.status(500).send("Veritabanı hatası: " + err.message);
  }
});


app.listen(PORT, () => {
  console.log(`Gizli API sunucumuz şu an http://localhost:${PORT} adresinde çalışıyor!`);
});