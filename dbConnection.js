const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host:'localhost',
    user:'root',
    password:DB_PASSWORD,
    database:'LibraryDB'
});

module.export=pool;