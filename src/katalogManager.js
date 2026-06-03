const mysql = require('mysql2/promise');
require('dotenv').config();

// Veritabanı bağlantı havuzu oluşturuluyor
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false } // Ekranında "SSL mode: REQUIRED" yazdığı için bu satır kritik!
});

// YAZAR İŞLEMLERİ

async function getAllAuthors() {
    const [rows] = await pool.query('SELECT * FROM Author');
    return rows;
}

async function addNewAuthor(fName, lName) {
    const [result] = await pool.query(
        'INSERT INTO Author (FName, LName) VALUES (?, ?)',
        [fName, lName]
    );
    return result.insertId;
}
async function deleteAuthor(authorId) {
    const [result] = await pool.query('DELETE FROM Author WHERE AuthorID = ?', [authorId]);
    return result;
}

// KİTAP İŞLEMLERİ

async function getAllBooks() {
    const [rows] = await pool.query('SELECT * FROM Book');
    return rows;
}

async function addNewBook(isbn, title, category) {
    const [result] = await pool.query(
        'INSERT INTO Book (ISBN, Title, Category, Stock, OnLoan) VALUES (?, ?, ?, 0, 0)',
        [isbn, title, category]
    );
    return result;
}

async function deleteBook(isbn) {
    const [result] = await pool.query('DELETE FROM Book WHERE ISBN = ?', [isbn]);
    return result;
}

async function updateBook(oldIsbn, newTitle, newCategory) {
    const [result] = await pool.query(
        'UPDATE Book SET Title = ?, Category = ? WHERE ISBN = ?',
        [newTitle, newCategory, oldIsbn]
    );
    return result;
}

async function assignAuthorToBook(isbn, authorId) {
    const [result] = await pool.query(
        'INSERT INTO Book_Author (ISBN, AuthorID) VALUES (?, ?)',
        [isbn, authorId]
    );
    return result;
}

// KOPYA (COPY) İŞLEMLERİ

async function getAllCopies() {
    const [rows] = await pool.query('SELECT * FROM Copy');
    return rows;
}

async function addNewCopy(accessionNumber, isbn, year, publisher, pages) {
    const [result] = await pool.query(
        'INSERT INTO Copy (AccessionNumber, ISBN, YearOfPublication, Publisher, NumberOfPages, Stock, OnLoan, Total) VALUES (?, ?, ?, ?, ?, 1, 0, 1)',
        [accessionNumber, isbn, year, publisher, pages]
    );
    return result;
}

// Dışa aktarma (Export) bloğu. Server.js ancak bu sayede fonksiyonları görebilir.
module.exports = {
    getAllAuthors,
    addNewAuthor,
    deleteAuthor,
    getAllBooks,
    addNewBook,
    deleteBook,
    updateBook,
    assignAuthorToBook,
    getAllCopies,
    addNewCopy
};