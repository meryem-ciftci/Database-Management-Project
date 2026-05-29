
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(pathjoin(__dirname,'src')));//????look again for the path

const pool = mysql.createPool({
  host: 'localhost',       
  user: 'root',            
  password: DB_PASSWORD,    
  database: 'LibraryDB', 
  waitForConnections:true,
  connectionLimit:15,
  queueLimit:0
});

//members

app.get('/api/members', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM members');
    res.json(rows); 
  } catch (err) {
    res.status(500).send("Veritabanı hatası: " + err.message);
  }
});

app.post('/api/members', async (req, res) => {
  const {id, fname, lname, email, phone, region, postalCode} = req.body;
  try {
    const query = 'INSERT INTO members (MemberID,FName,LName,PhoneNumber,MailAddress,Region,PostalCode,ReadBooks,BorrowedBooks) VALUES (?,?,?,?,?,?,?,?)';
    await pool.query(query, [id,fname,lname,phone,email,region,postalCode]);
    res.json({success:true,message:"We did it"}); 
  } catch (err) {
    res.status(500).send("Ekleme hatası: " + err.message);
  }
});

//book

app.get('/api/books', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books');
    res.json(rows); 
  } catch (err) {
    res.status(500).send("Veritabanı hatası: " + err.message);
  }
});

app.post('/api/books', async (req, res) => {
  const {accessionNumber, title, author} = req.body;
  try {
    const query = 'INSERT INTO books (ISBN,Title,Category,Stock,OnLoan) VALUES (?,?,?)';
    await pool.query(query, [accessionNumber, title, author]);
    res.json({success:true,message:"We did it"}); 
  } catch (err) {
    res.status(500).send("Ekleme hatası: " + err.message);
  }
});

//loan

app.get('/api/loans', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM loans');
    res.json(rows); 
  } catch (err) {
    res.status(500).send("Veritabanı hatası: " + err.message);
  }
});

app.post('/api/loans', async (req, res) => {
  const {loanId, memberId, accessionNumber} = req.body;
  try {
    const query = 'INSERT INTO loans (LoanID, AccessionNumber, BorrowDate, ReturnDate, YearOfPublication, Publisher, NumberOfPages,Stock,OnLoan,Total) VALUES (?,?,?,?,?,?,?,?,?,?)';
    await pool.query(query, [loanId, memberId, accessionNumber]);
    res.json({success:true,message:"We did it"}); 
  } catch (err) {
    res.status(500).send("Ekleme hatası: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Gizli API sunucumuz şu an http://localhost:${PORT} adresinde çalışıyor!`);
});