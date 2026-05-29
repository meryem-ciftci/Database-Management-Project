const searchForm = document.querySelector('.left.container');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');

const express = require('express');
const mysql = require('mysql2/promise');
const archive = express();
const PORT = 3000;

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'DamlaRoot123.',
  database: 'library'
});


archive.get('/api/users', async (asked, answered) => {
  try {
    const [books] = await pool.query('SELECT * FROM Book');  
  }
  catch (err){
    answered.status(500).send("An error occured: " + err.message);
  }
});

archive.listen(PORT, () => {
  console.log('AOI works in the adress: http://localhost:${PORT}');
});


searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const searchedTitle = titleInput.value.trim().toLowerCase();
    const searchedAuthor = authorInput.value.trim().toLowerCase();

    const results = archive.filter(item => {
        const matchTitle = item.title.toLowerCase().includes(searchedTitle);
        const matchAuthor = item.author.toLowerCase().includes(searchedAuthor);
        return matchTitle && matchAuthor;
    });



    // 4. Sonuçları ekrana bas
    if (results.length === 0) {
        rightContainer.innerHTML = "<p>Aranan eser bulunamadı.</p>";
    } else {
        results.forEach(item => {
            // Sağ taraftaki div'in içine şık birer HTML kartı ekliyoruz
            rightContainer.innerHTML += `
                    <button><h4>${item.publisher}</h4><button>
            `;
        });
    }
});