require('dotenv').config(); // En üste aldık
const xlsx = require('xlsx');
const mysql = require('mysql2/promise');

async function importData() {
    try {
        // 1. Establish Database Connection
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD, // Herkesin kendi şifresi
            database: 'LibraryDB'
        });
        console.log('Successfully connected to the database!');

        // 2. Read Excel File
        console.log('Reading Excel data...');
        const workbook = xlsx.readFile('library_data.xlsx'); 
        const sheetName = workbook.SheetNames[0];
        const excelData = xlsx.utils.sheet_to_json(workbook[sheetName]);

        // 3. Loop Through Data and Insert into Database
        for (const row of excelData) {
            
            // A. INSERT AUTHOR
            const [authorResult] = await db.execute(
                `INSERT INTO Author (FName, LName) VALUES (?, ?)`,
                [row.AuthorFName, row.AuthorLName]
            );
            const authorId = authorResult.insertId;

            // B. INSERT BOOK
            await db.execute(
                `INSERT IGNORE INTO Book (ISBN, Title, Category, Stock, OnLoan) VALUES (?, ?, ?, ?, ?)`,
                [row.ISBN, row.BookTitle, row.Category, 1, 0]
            );

            // C. INSERT BOOK-AUTHOR RELATION (Many-to-Many)
            await db.execute(
                `INSERT IGNORE INTO Book_Author (ISBN, AuthorID) VALUES (?, ?)`,
                [row.ISBN, authorId]
            );

            // D. INSERT COPY
            await db.execute(
                `INSERT INTO Copy (AccessionNumber, ISBN, YearOfPublication, Publisher, NumberOfPages, Stock, OnLoan, Total) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [row.AccessionNumber, row.ISBN, row.Year, row.Publisher, row.Pages, 1, 0, 1]
            );

            console.log(`Book and copy for '${row.BookTitle}' added successfully.`);
        }

        console.log('All Excel data has been imported into the database!');
        await db.end(); // Close the connection when done

    } catch (error) {
        console.error('An error occurred:', error);
    }
} // <--- DİKKAT: importData fonksiyonu tam olarak burada kapanıyor!


// --- WEB ARAYÜZÜ (UI) İÇİN ÇAĞRILACAK FONKSİYONLAR ---

// 1. Tüm Kitapları Listeleme Fonksiyonu
async function tumKitaplariGetir() {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD,
            database: 'LibraryDB'
        });

        const [kitaplar] = await db.execute('SELECT * FROM Book');
        await db.end();
        return kitaplar; // Arayüze kitapları gönder

    } catch (hata) {
        console.error('Kitaplar getirilirken hata:', hata);
        throw hata;
    }
}

// 2. Yeni Kitap Ekleme Fonksiyonu
async function yeniKitapEkle(isbn, title, category) {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD,
            database: 'LibraryDB'
        });

        // Yeni kitabı Book tablosuna ekler (stok varsayılan 1, OnLoan 0)
        await db.execute(
            `INSERT INTO Book (ISBN, Title, Category, Stock, OnLoan) VALUES (?, ?, ?, ?, ?)`,
            [isbn, title, category, 1, 0]
        );
        
        await db.end();
        console.log(`${title} isimli kitap başarıyla eklendi!`);

    } catch (hata) {
        console.error('Kitap eklenirken hata:', hata);
        throw hata;
    }
}

// (İsteğe bağlı) Eğer terminalden sadece dosyayı test etmek istersen yorum satırını kaldırabilirsin
// importData(); 

// 3. Yazdığımız fonksiyonları Meryem'in server.js'i için dışa aktarıyoruz (En altta ve bağımsız)
module.exports = {
    importData,          // Excel'den veri çeken fonksiyonumuz
    tumKitaplariGetir,   // Listeleme fonksiyonumuz
    yeniKitapEkle        // Ekleme fonksiyonumuz
};