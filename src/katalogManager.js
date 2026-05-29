require('dotenv').config(); // Load environment variables
const xlsx = require('xlsx');
const mysql = require('mysql2/promise');

async function importData() {
    try {
        // 1. Establish Database Connection
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD, // Everyone's local password
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
} // <--- NOTE: importData function closes exactly here!


// --- FUNCTIONS TO BE CALLED FOR THE WEB INTERFACE (UI) ---

// 1. Function to List All Books
async function getAllBooks() {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD,
            database: 'LibraryDB'
        });

        const [books] = await db.execute('SELECT * FROM Book');
        await db.end();
        return books; // Send books to the UI

    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
}

// 2. Function to Add a New Book
async function addNewBook(isbn, title, category) {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD,
            database: 'LibraryDB'
        });

        // Adds the new book to the Book table (default stock 1, OnLoan 0)
        await db.execute(
            `INSERT INTO Book (ISBN, Title, Category, Stock, OnLoan) VALUES (?, ?, ?, ?, ?)`,
            [isbn, title, category, 1, 0]
        );
        
        await db.end();
        console.log(`Book titled '${title}' added successfully!`);

    } catch (error) {
        console.error('Error adding book:', error);
        throw error;
    }
}

// 3. Function to Delete a Book (DELETE)
async function deleteBook(isbn) {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD,
            database: 'LibraryDB'
        });

        // Deletes the book with the given ISBN
        const [result] = await db.execute(`DELETE FROM Book WHERE ISBN = ?`, [isbn]);
        await db.end();
        
        if (result.affectedRows > 0) {
            console.log(`Book with ISBN ${isbn} deleted successfully.`);
        } else {
            console.log(`Warning: Book with ISBN ${isbn} not found.`);
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        throw error;
    }
}

// 4. Function to Update a Book (UPDATE)
async function updateBook(oldIsbn, newTitle, newCategory) {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD,
            database: 'LibraryDB'
        });

        // Updates the title and category of the book
        await db.execute(
            `UPDATE Book SET Title = ?, Category = ? WHERE ISBN = ?`,
            [newTitle, newCategory, oldIsbn]
        );
        
        await db.end();
        console.log(`Information for book with ISBN ${oldIsbn} updated.`);
    } catch (error) {
        console.error('Error updating book:', error);
        throw error;
    }
}

//YAZAR İŞLEMLERİ

//Tüm Yazarları Listeleme
async function getAllAuthors() {
    try {
        const db = await mysql.createConnection({
            host: 'localhost', user: 'root', password: process.env.DB_PASSWORD, database: 'LibraryDB'
        });
        const [authors] = await db.execute('SELECT * FROM Author');
        await db.end();
        return authors;
    } catch (error) {
        console.error('Error fetching authors:', error);
        throw error;
    }
}

//Yeni Yazar Ekleme
async function addNewAuthor(fName, lName) {
    try {
        const db = await mysql.createConnection({
            host: 'localhost', user: 'root', password: process.env.DB_PASSWORD, database: 'LibraryDB'
        });
        const [result] = await db.execute(
            `INSERT INTO Author (FName, LName) VALUES (?, ?)`, 
            [fName, lName]
        );
        await db.end();
        console.log(`Author '${fName} ${lName}' added successfully! ID: ${result.insertId}`);
        return result.insertId; // Eklenen yazarın otomatik oluşan ID'sini döndürür
    } catch (error) {
        console.error('Error adding author:', error);
        throw error;
    }
}

//Yazar Silme
async function deleteAuthor(authorId) {
    try {
        const db = await mysql.createConnection({
            host: 'localhost', user: 'root', password: process.env.DB_PASSWORD, database: 'LibraryDB'
        });
        const [result] = await db.execute(`DELETE FROM Author WHERE AuthorID = ?`, [authorId]);
        await db.end();
        if (result.affectedRows > 0) {
            console.log(`Author with ID ${authorId} deleted successfully.`);
        } else {
            console.log(`Warning: Author with ID ${authorId} not found.`);
        }
    } catch (error) {
        console.error('Error deleting author:', error);
        throw error;
    }
}

//Yazar Güncelleme
async function updateAuthor(authorId, newFName, newLName) {
    try {
        const db = await mysql.createConnection({
            host: 'localhost', user: 'root', password: process.env.DB_PASSWORD, database: 'LibraryDB'
        });
        await db.execute(
            `UPDATE Author SET FName = ?, LName = ? WHERE AuthorID = ?`, 
            [newFName, newLName, authorId]
        );
        await db.end();
        console.log(`Information for author with ID ${authorId} updated.`);
    } catch (error) {
        console.error('Error updating author:', error);
        throw error;
    }
}

//Kitaba Yazar Atama (Many-to-Many İlişki)
async function assignAuthorToBook(isbn, authorId) {
    try {
        const db = await mysql.createConnection({
            host: 'localhost', user: 'root', password: process.env.DB_PASSWORD, database: 'LibraryDB'
        });
        // Aynı yazar aynı kitaba iki kere eklenmesin diye INSERT IGNORE kullanıyoruz
        await db.execute(
            `INSERT IGNORE INTO Book_Author (ISBN, AuthorID) VALUES (?, ?)`, 
            [isbn, authorId]
        );
        await db.end();
        console.log(`Author ID ${authorId} successfully assigned to Book ISBN ${isbn}.`);
    } catch (error) {
        console.error('Error assigning author to book:', error);
        throw error;
    }
}

//COPY İŞLEMLERİ

//Tüm Kopyaları Listeleme
async function getAllCopies() {
    try {
        const db = await mysql.createConnection({
            host: 'localhost', user: 'root', password: process.env.DB_PASSWORD, database: 'LibraryDB'
        });
        const [copies] = await db.execute('SELECT * FROM Copy');
        await db.end();
        return copies;
    } catch (error) {
        console.error('Error fetching copies:', error);
        throw error;
    }
}

//Yeni Fiziksel Kopya Ekleme (Accession Numberla)
async function addNewCopy(accessionNumber, isbn, year, publisher, pages) {
    try {
        const db = await mysql.createConnection({
            host: 'localhost', user: 'root', password: process.env.DB_PASSWORD, database: 'LibraryDB'
        });
        // Yeni kopya eklendiğinde varsayılan olarak Stock: 1, OnLoan: 0, Total: 1 olur
        await db.execute(
            `INSERT INTO Copy (AccessionNumber, ISBN, YearOfPublication, Publisher, NumberOfPages, Stock, OnLoan, Total) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [accessionNumber, isbn, year, publisher, pages, 1, 0, 1]
        );
        await db.end();
        console.log(`Copy with Accession Number '${accessionNumber}' added successfully!`);
    } catch (error) {
        console.error('Error adding copy:', error);
        throw error;
    }
}

//Kopya Silme
async function deleteCopy(accessionNumber) {
    try {
        const db = await mysql.createConnection({
            host: 'localhost', user: 'root', password: process.env.DB_PASSWORD, database: 'LibraryDB'
        });
        const [result] = await db.execute(`DELETE FROM Copy WHERE AccessionNumber = ?`, [accessionNumber]);
        await db.end();
        if (result.affectedRows > 0) {
            console.log(`Copy with Accession Number ${accessionNumber} deleted successfully.`);
        } else {
            console.log(`Warning: Copy with Accession Number ${accessionNumber} not found.`);
        }
    } catch (error) {
        console.error('Error deleting copy:', error);
        throw error;
    }
}

//To test the file only from the terminal
//importData(); 

// Exporting functions for server.js
module.exports = {
    importData,          // Function that fetches data from Excel
    getAllBooks,         // Listing function
    addNewBook,          // Adding function
    deleteBook,          // Deletion function
    updateBook,           // Updating function
    getAllAuthors,       
    addNewAuthor,        
    deleteAuthor,        
    updateAuthor,        
    assignAuthorToBook,
    getAllCopies,        
    addNewCopy,          
    deleteCopy   
};