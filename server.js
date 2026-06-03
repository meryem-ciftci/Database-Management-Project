require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');

//KATALOGU SUNUCUYA BAĞLIYORUZ
const katalogManager = require('./src/katalogManager');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Klasör yolu path.join olarak düzeltildi
app.use(express.static(path.join(__dirname, 'src'))); 

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


app.get('/api/members', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Members');
    res.json(rows); 
  } catch (err) {
    res.status(500).send("Veritabanı hatası: " + err.message);
  }
});

app.post('/api/members', async (req, res) => {
  const {id, fname, lname, email, phone, region, postalCode} = req.body;
  try {
    const query = 'INSERT INTO Members (MemberID,FName,LName,PhoneNumber,MailAddress,Region,PostalCode) VALUES (?,?,?,?,?,?,?)';
    await pool.query(query, [id,fname,lname,phone,email,region,postalCode]);
    res.json({success: true, message: "Üye başarıyla eklendi."}); 
  } catch (err) {
    console.log("hata:",err);
    res.status(500).send("Ekleme hatası: " + err.message);
  }
});

app.put('/api/members/:id', async (req, res) => {
  const {id} = req.params;
  const { fname, lname, email, phone, region, postalCode} = req.body;
  try {
    const query = 'UPDATE Members SET FName = ?, LName = ?, PhoneNumber = ?, MailAddress = ?, Region = ?, PostalCode = ? WHERE MemberID = ?';
    await pool.query(query, [fname,lname,phone,email,region,postalCode, id]);
    res.json({success: true, message: "Üye başarıyla güncellendi."}); 
  } catch (err) {
    console.log("güncelleme hatası:",err);
    res.status(500).send("Güncelleme hatası: " + err.message);
  }
});

app.delete('/api/members/:id',async (req, res) => {
  const {id} = req.params;
  try{
    const query = 'DELETE FROM Members WHERE MemberID = ?';
    const [result] = await pool.query(query,[id]);
    
    if (result.affectedRows === 0){
      return res.status(404).json({success: false, message: "Üye bulunamadı"});
    }
    res.json({success: true, message: "Üye başarıyla silindi."});
  }catch (err){
    console.log("silme hatası...",err);
    res.status(500).send("Silme hatası:"+err.message)
  }
});

//KİTAPLAR
app.get('/api/books', async (req, res) => {
  try {
    const books = await katalogManager.getAllBooks();
    res.json(books);
  } catch (err) {
    res.status(500).send("Kitaplar getirilirken hata: " + err.message);
  }
});

app.post('/api/books', async (req, res) => {
  const { isbn, title, category } = req.body;
  try {
    await katalogManager.addNewBook(isbn, title, category);
    res.status(201).json({ success: true, message: "Kitap başarıyla eklendi!" });
  } catch (err) {
    res.status(500).send("Kitap eklenirken hata: " + err.message);
  }
});

app.delete('/api/books/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    await katalogManager.deleteBook(isbn);
    res.json({ success: true, message: "Kitap başarıyla silindi!" });
  } catch (err) {
    res.status(500).send("Kitap silinirken hata: " + err.message);
  }
});

app.put('/api/books/:isbn', async (req, res) => {
  const oldIsbn = req.params.isbn;
  const { newTitle, newCategory } = req.body;
  try {
    await katalogManager.updateBook(oldIsbn, newTitle, newCategory);
    res.json({ success: true, message: "Kitap güncellendi!" });
  } catch (err) {
    res.status(500).send("Kitap güncellenirken hata: " + err.message);
  }
});

//YAZARLAR
app.get('/api/authors', async (req, res) => {
  try {
    const authors = await katalogManager.getAllAuthors();
    res.json(authors);
  } catch (err) {
    res.status(500).send("Yazarlar getirilirken hata: " + err.message);
  }
});

app.post('/api/authors', async (req, res) => {
  const { fName, lName } = req.body;
  try {
    const authorId = await katalogManager.addNewAuthor(fName, lName);
    res.status(201).json({ success: true, message: "Yazar eklendi!", authorId: authorId });
  } catch (err) {
    res.status(500).send("Yazar eklenirken hata: " + err.message);
  }
});

app.delete('/api/authors/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await katalogManager.deleteAuthor(id);
    res.json({ success: true, message: "Yazar başarıyla silindi!" });
  } catch (err) {
    console.log("Silme hatası:", err);
    res.status(500).send("Yazar silinirken hata: " + err.message);
  }
});

app.post('/api/books/:isbn/authors', async (req, res) => {
  const isbn = req.params.isbn;
  const { authorId } = req.body;
  try {
    await katalogManager.assignAuthorToBook(isbn, authorId);
    res.status(201).json({ success: true, message: "Yazar kitaba atandı!" });
  } catch (err) {
    res.status(500).send("Atama hatası: " + err.message);
  }
});

//KOPYALAR
app.get('/api/copies', async (req, res) => {
  try {
    const copies = await katalogManager.getAllCopies();
    res.json(copies);
  } catch (err) {
    res.status(500).send("Kopyalar getirilirken hata: " + err.message);
  }
});

app.post('/api/copies', async (req, res) => {
  const { accessionNumber, isbn, year, publisher, pages } = req.body;
  try {
    await katalogManager.addNewCopy(accessionNumber, isbn, year, publisher, pages);
    res.status(201).json({ success: true, message: "Kopya başarıyla eklendi!" });
  } catch (err) {
    res.status(500).send("Kopya eklenirken hata: " + err.message);
  }
});


app.get('/api/loans', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Loan');
    res.json(rows); 
  } catch (err) {
    res.status(500).send("Veritabanı hatası: " + err.message);
  }
});

app.post('/api/loans', async (req, res) => {
  const {loanId, memberId, accessionNumber} = req.body;
  try {
    const query = 'INSERT INTO Loan (LoanID, AccessionNumber, MemberID) VALUES (?,?,?)';
    await pool.query(query, [loanId, accessionNumber, memberId]);
    res.json({success: true, message: "Emanet kaydı oluşturuldu."}); 
  } catch (err) {
    res.status(500).send("Ekleme hatası: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Gizli API sunucumuz şu an http://localhost:${PORT} adresinde çalışıyor!`);
});