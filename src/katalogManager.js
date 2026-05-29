const xlsx = require('xlsx');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function importData() {
    try {
        // 1. Establish Database Connection
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD, //Herkesin kendi şifresi
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
            // We assume Excel has 'AuthorFName' and 'AuthorLName' columns
            const [authorResult] = await db.execute(
                `INSERT INTO Author (FName, LName) VALUES (?, ?)`,
                [row.AuthorFName, row.AuthorLName]
            );
            const authorId = authorResult.insertId;

            // B. INSERT BOOK
            // We assume Excel has 'ISBN', 'BookTitle', 'Category' columns
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
            // We assume Excel has 'AccessionNumber', 'Year', 'Publisher', 'Pages' columns
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
}