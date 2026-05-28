-- 1. Veritabanını oluştur ve kullanmaya başla
CREATE DATABASE IF NOT EXISTS LibraryDB;
USE LibraryDB;

-- 2. Yazar (Author) Tablosu
-- Her varlığın benzersiz bir tanımlayıcısı olmalıdır kuralına göre AuthorID Primary Key yapıldı.
CREATE TABLE Author (
    AuthorID INT AUTO_INCREMENT PRIMARY KEY,
    FName VARCHAR(50) NOT NULL,
    LName VARCHAR(50) NOT NULL
);

-- 3. Kitap (Book) Tablosu
-- ISBN Primary Key yapıldı.
CREATE TABLE Book (
    ISBN VARCHAR(20) PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Category VARCHAR(100),
    Stock INT DEFAULT 0,
    OnLoan INT DEFAULT 0
);

-- 4. Kitap ve Yazar Çoğa-Çok (Many-to-Many) İlişki Tablosu
-- Bir yazarın birden fazla kitabı ve bir kitabın birden fazla yazarı olabilir kuralını sağlar.
CREATE TABLE Book_Author (
    ISBN VARCHAR(20),
    AuthorID INT,
    PRIMARY KEY (ISBN, AuthorID),
    FOREIGN KEY (ISBN) REFERENCES Book(ISBN) ON DELETE CASCADE,
    FOREIGN KEY (AuthorID) REFERENCES Author(AuthorID) ON DELETE CASCADE
);

-- 5. Kopya (Copy) Tablosu ve Bire-Çok (One-to-Many) İlişki
-- Bir kitabın birden fazla kopyası olabilir kuralını sağlar. ISBN burada Foreign Key (Yabancı Anahtar) olarak kullanılır.
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