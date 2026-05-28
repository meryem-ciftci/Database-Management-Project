USE LibraryDB;

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
    