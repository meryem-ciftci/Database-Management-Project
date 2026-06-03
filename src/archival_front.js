const BASE_URL = 'http://localhost:3000/api';

const titleInput = document.getElementById('title');
const categoryInput = document.getElementById('category');
const searchForm = document.getElementById('searchForm');

let bookList = [];
let matchedResults = [];


document.addEventListener('DOMContentLoaded', async () => {
    try {
        bookList = await getAllBooks();
    } catch (error) {
        console.error("Kitaplar yüklenirken hata oluştu:", error);
    }
});

async function getAllBooks() {
    const response = await fetch(`${BASE_URL}/books`);
    return await response.json();
}

async function addNewBook(isbn, title, category) {
    const response = await fetch(`${BASE_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isbn, title, category })
    });
    return response;
}

searchForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const searchedTitle = titleInput.value.trim().toLowerCase();
    const searchedCategory = categoryInput.value.trim().toLowerCase();

    matchedResults = bookList.filter(item => {
        const matchTitle = item.title ? item.title.toLowerCase().includes(searchedTitle) : false;
        const matchCategory = item.category ? item.category.toLowerCase().includes(searchedCategory) : false;
        return matchTitle && matchCategory;
    });

    if (matchedResults.length != 0){
        const ISBN = matchedResults[0].isbn;
        await addNewBook(ISBN, titleInput.value, categoryInput.value);  
    }
    else {
        const lastBook = bookList[bookList.length - 1];
        const lastIsbn = lastBook ? lastBook.isbn : "ISBN_000000000000000";
        
        const number = Number.parseInt(String(lastIsbn).slice(5, 21)) + 1 ;
        const ISBN = "ISBN_" + String(number).padStart(15, '0');
        await addNewBook(ISBN, titleInput.value, categoryInput.value);  
    }
    bookList = await getAllBooks();
    
    let inner = document.getElementById("right").innerHTML || "";
    let add = (titleInput.value.trim().padEnd(30, " ")) + (categoryInput.value.trim().padEnd(50, " "));
    inner = inner + "<h4>" + add + "</h4>";
    document.getElementById("right").innerHTML = inner;

    titleInput.value = "";
    categoryInput.value = "";
});