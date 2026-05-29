const URL = "http://localhost:3000/api/books";

const searchForm = document.getElementById('searchForm');

async function getAllBooks(){
    const response = await fetch(URL);
    return await response.json();
}

async function addNewBook(isbn,title,category){
    await fetch(URL,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
            isbn: isbn,
            title: title,
            category: category
        })
    })
}

let bookList = [];
document.addEventListener('DOMContentLoaded', async ()=>{
    bookList = await getAllBooks();
});

const titleInput = document.getElementById('title');
const categoryInput = document.getElementById('category');

let matchedResults = [];


searchForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const searchedTitle = titleInput.value.trim().toLowerCase();
    const searchedCategory = categoryInput.value.trim().toLowerCase();

    matchedResults = bookList.filter(item => {
        const matchTitle = item.Title ? item.Title.toLowerCase().includes(searchedTitle) : false;
        const matchCategory = item.Category ? item.Category.toLowerCase().includes(searchedCategory) : false;
        return matchTitle && matchCategory;
    });

    if (matchedResults.length != 0){
        const ISBN = matchedResults[0].ISBN;
        await addNewBook(ISBN, titleInput.value, categoryInput.value);  
    }

    else{
        if (bookList.length===0){
            await addNewBook("ISBN_100001",titleInput.value,categoryInput.value);
        } else{
            const lastISBN = bookList[bookList.lenght-1].ISBN;
            const currentNumber = Number.parseInt(lastISBN.slice(5));
            const ISBN = "ISBN_" + (currentNumber+1);
            await addNewBook(ISBN, titleInput.value, categoryInput.value);  
        }
    }

    booklist = await getAllBooks();
});


