const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'LibraryDB',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0
});

class LoanRepository{
    async  getLoanHistory() {
        const [rows] = await pool.query('SELECT * FROM Loan');
        return rows;
}

    async  createLoan(loanID, accessionNumber, borrowDate, returnDate) {
        const today = new Date().toLocaleDateString();
        const [result] = await pool.query(
            'INSERT INTO Loan (loanID, accessionnumber, borrowDate, returnDate)',
            [loanID, memberID, borrowDate, returnDate]
        );
    return result;
    }
}

module.exports = LoanRepository;