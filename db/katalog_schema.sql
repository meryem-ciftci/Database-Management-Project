-- Veritabanını oluştur ve kullanmaya başla
CREATE DATABASE IF NOT EXISTS LibraryDB;
USE LibraryDB;

-- GÜVENLİ SİLME HİYERARŞİSİ
-- Önce bağımlı (child) tablolar silinir
DROP TABLE IF EXISTS Loan;
DROP TABLE IF EXISTS Copy;
DROP TABLE IF EXISTS Book_Author;
-- Sonra ana (parent) tablolar silinir
DROP TABLE IF EXISTS Members;
DROP TABLE IF EXISTS Book;
DROP TABLE IF EXISTS Author;

-- Yazar (Author) Tablosu
-- Her varlığın benzersiz bir tanımlayıcısı olmalıdır kuralına göre AuthorID Primary Key yapıldı.
CREATE TABLE Author (
    AuthorID INT AUTO_INCREMENT PRIMARY KEY,
    FName VARCHAR(50) NOT NULL,
    LName VARCHAR(50) NOT NULL
);

-- Kitap (Book) Tablosu
-- ISBN Primary Key yapıldı.
CREATE TABLE Book (
    ISBN VARCHAR(20) PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Category VARCHAR(100),
    Stock INT DEFAULT 0,
    OnLoan INT DEFAULT 0
    genre VARCHAR(50),
    author VARCHAR(50)
);

-- Kitap ve Yazar Çoğa-Çok (Many-to-Many) İlişki Tablosu
-- Bir yazarın birden fazla kitabı ve bir kitabın birden fazla yazarı olabilir kuralını sağlar.
CREATE TABLE Book_Author (
    ISBN VARCHAR(20),
    AuthorID INT,
    PRIMARY KEY (ISBN, AuthorID),
    FOREIGN KEY (ISBN) REFERENCES Book(ISBN) ON DELETE CASCADE,
    FOREIGN KEY (AuthorID) REFERENCES Author(AuthorID) ON DELETE CASCADE
);

-- Copy Tablosu ve One-to-Many İlişkisi
-- Bir kitabın birden fazla kopyası olabilir kuralını sağlar. ISBN burada Foreign Key olarak kullanıldı
CREATE TABLE Copy (
    AccessionNumber VARCHAR(50) PRIMARY KEY,
    ISBN VARCHAR(20),
    YearOfPublication INT,
    Publisher VARCHAR(100),
    NumberOfPages INT,
    Stock INT DEFAULT 1,
    OnLoan INT DEFAULT 0,
    Total INT DEFAULT 1,
    FOREIGN KEY (ISBN) REFERENCES Book(ISBN) ON DELETE CASCADE
);

CREATE TABLE Members(
        MemberID VARCHAR(50) PRIMARY KEY,
        FName VARCHAR(50) NOT NULL,
        LName VARCHAR(50) NOT NULL,
        PhoneNumber VARCHAR(50) NOT NULL,
        MailAddress VARCHAR(50) NOT NULL,
        Region VARCHAR(50),
        PostalCode VARCHAR(50),
        ReadBooks INT DEFAULT 0 NOT NULL,
        BorrowedBooks INT DEFAULT 0 NOT NULL
);

CREATE TABLE Loan (
    LoanID VARCHAR(20) PRIMARY KEY,
    AccessionNumber VARCHAR(50),
    BorrowDate DATE,
	ReturnDate DATE,
    YearOfPublication INT,
    Publisher VARCHAR(100),
    NumberOfPages INT,
    Stock INT DEFAULT 1,
    OnLoan INT DEFAULT 0,
    Total INT DEFAULT 1,
    FOREIGN KEY (AccessionNumber) REFERENCES Copy(AccessionNumber) ON DELETE CASCADE
    );

DELIMITER ++

CREATE TRIGGER constraints_for_stockandtotal
BEFORE UPDATE ON Loan
FOR EACH ROW
BEGIN
    IF NEW.Total <> OLD.Total OR NEW.Total <> 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This value is final and cannot be modified. It needs to remain as one';
    END IF;

    IF NEW.Stock NOT IN (0,1) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This value can only be zero or one.';
    END IF;
END ++

DELIMITER ;

-- KATALOG MODÜLÜ SQL FONKSİYONLARI (STORED PROCEDURES)

DELIMITER //

-- KİTAP İŞLEMLERİ

-- Kitap Ekleme
DROP PROCEDURE IF EXISTS AddBook //
CREATE PROCEDURE AddBook(IN p_ISBN VARCHAR(20), IN p_Title VARCHAR(255), IN p_Category VARCHAR(100))
BEGIN
    INSERT INTO Book (ISBN, Title, Category, Stock, OnLoan) 
    VALUES (p_ISBN, p_Title, p_Category, 0, 0);
END //

-- Kitap Silme
DROP PROCEDURE IF EXISTS DeleteBook //
CREATE PROCEDURE DeleteBook(IN p_ISBN VARCHAR(20))
BEGIN
    DELETE FROM Book WHERE ISBN = p_ISBN;
END //

-- Kitap Güncelleme
DROP PROCEDURE IF EXISTS UpdateBook //
CREATE PROCEDURE UpdateBook(IN p_ISBN VARCHAR(20), IN p_Title VARCHAR(255), IN p_Category VARCHAR(100))
BEGIN
    UPDATE Book SET Title = p_Title, Category = p_Category WHERE ISBN = p_ISBN;
END //

-- YAZAR İŞLEMLERİ

-- Yazar Ekleme
DROP PROCEDURE IF EXISTS AddAuthor //
CREATE PROCEDURE AddAuthor(IN p_FName VARCHAR(50), IN p_LName VARCHAR(50))
BEGIN
    INSERT INTO Author (FName, LName) VALUES (p_FName, p_LName);
END //

-- Yazar Silme
DROP PROCEDURE IF EXISTS DeleteAuthor //
CREATE PROCEDURE DeleteAuthor(IN p_AuthorID INT)
BEGIN
    DELETE FROM Author WHERE AuthorID = p_AuthorID;
END //

-- Yazar Güncelleme
DROP PROCEDURE IF EXISTS UpdateAuthor //
CREATE PROCEDURE UpdateAuthor(IN p_AuthorID INT, IN p_FName VARCHAR(50), IN p_LName VARCHAR(50))
BEGIN
    UPDATE Author SET FName = p_FName, LName = p_LName WHERE AuthorID = p_AuthorID;
END //

-- Kitaba Yazar Atama (İş Mantığı)
DROP PROCEDURE IF EXISTS AssignAuthorToBook //
CREATE PROCEDURE AssignAuthorToBook(IN p_ISBN VARCHAR(20), IN p_AuthorID INT)
BEGIN
    INSERT IGNORE INTO Book_Author (ISBN, AuthorID) VALUES (p_ISBN, p_AuthorID);
END //


-- COPY İŞLEMLERİ

-- Kopya Ekleme
DROP PROCEDURE IF EXISTS AddCopy //
CREATE PROCEDURE AddCopy(IN p_AccessionNumber VARCHAR(50), IN p_ISBN VARCHAR(20), IN p_Year INT, IN p_Publisher VARCHAR(100), IN p_Pages INT)
BEGIN
    INSERT INTO Copy (AccessionNumber, ISBN, YearOfPublication, Publisher, NumberOfPages, Stock, OnLoan, Total)
    VALUES (p_AccessionNumber, p_ISBN, p_Year, p_Publisher, p_Pages, 1, 0, 1);
END //

-- Kopya Silme
DROP PROCEDURE IF EXISTS DeleteCopy //
CREATE PROCEDURE DeleteCopy(IN p_AccessionNumber VARCHAR(50))
BEGIN
    DELETE FROM Copy WHERE AccessionNumber = p_AccessionNumber;
END //

DELIMITER ;

-- A virtual table that combines Books and Authors
DROP VIEW IF EXISTS BookDetailsView;

CREATE VIEW BookDetailsView AS
SELECT 
    b.ISBN, 
    b.Title AS Book_Title, 
    b.Category AS Category, 
    CONCAT(a.FName, ' ', a.LName) AS Author_Name,
    b.Stock AS Stock_Status
FROM Book b
JOIN Book_Author ba ON b.ISBN = ba.ISBN
JOIN Author a ON ba.AuthorID = a.AuthorID;

DELIMITER //
-- Trigger to increase Book stock when a new Copy is added
DROP TRIGGER IF EXISTS After_Copy_Insert //
CREATE TRIGGER After_Copy_Insert
AFTER INSERT ON Copy
FOR EACH ROW
BEGIN
    UPDATE Book 
    SET Stock = Stock + 1 
    WHERE ISBN = NEW.ISBN;
END //

-- Trigger to decrease Book stock when a Copy is deleted
DROP TRIGGER IF EXISTS After_Copy_Delete //
CREATE TRIGGER After_Copy_Delete
AFTER DELETE ON Copy
FOR EACH ROW
BEGIN
    -- GREATEST function prevents the stock from falling below 0
    UPDATE Book 
    SET Stock = GREATEST(Stock - 1, 0) 
    WHERE ISBN = OLD.ISBN;
END //

DELIMITER ;