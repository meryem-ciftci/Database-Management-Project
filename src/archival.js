const express = require('express');
const router = express.Router();

// Tarayıcıdan gelen GET isteğini (Kitap listesini) karşılayan API kapısı
router.get('/books', async (req, res) => {
    try {
        const pool = req.app.get('db'); 
        const [rows] = await pool.query('SELECT * FROM book'); 
        res.json(rows); 
    } catch (error) {
        console.error("Veritabanı hatası:", error);
        res.status(500).json({ error: "Veritabanından kitaplar çekilemedi." });
    }
});

// Tarayıcıdan gelen POST isteğini (Yeni kitap eklemeyi) karşılayan API kapısı
router.post('/books', async (req, res) => {
    try {
        const { isbn, title, category } = req.body;
        const pool = req.app.get('db');
        
        await pool.query(
            'INSERT INTO book (isbn, title, category) VALUES (?, ?, ?)', 
            [isbn, title, category]
        );
        
        res.status(201).json({ message: "Kitap başarıyla veritabanına eklendi." });
    } catch (error) {
        console.error("Veritabanına ekleme hatası:", error);
        res.status(500).json({ error: "Kitap veritabanına kaydedilemedi." });
    }
});

module.exports = router;