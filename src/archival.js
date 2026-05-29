const searchForm = document.getElementById('searchForm');
const serverFonksiyonlari = require('./katalogManager.js');

let bookList = serverFonksiyonlari.getAllBooks();
const titleInput = document.getElementById('title');
const categoryInput = document.getElementById('category');

let matchedResults = [];
let inner = "";

searchForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const searchedTitle = titleInput.value.trim().toLowerCase();
    const searchedCategory = categoryInput.value.trim().toLowerCase();

    matchedResults = bookList.filter(item => {
        const matchTitle = item.title.toLowerCase().includes(searchedTitle);
        const matchCategory = item.category.toLowerCase().includes(searchedCategory);
        return matchTitle && matchCategory;
    });

    if (matchedResults.length != 0){
        const ISBN = matchedResults[0].ISBN;
        await serverFonksiyonlari.addNewBook(ISBN, titleInput.value, categoryInput.value);  
    }

    else{
        const ISBN = ((bookList[bookList.length-1].ISBN).slice(0,5) + (Number.parseInt((bookList[bookList.length-1].ISBN.slice(5,21)))+1));
        await serverFonksiyonlari.addNewBook(ISBN, titleInput.value, categoryInput.value);  
    }
    let add = (titleInput.valuetrim().padEnd(30, " ")) + (categoryInput.value.trim().padEnd(50, " "));
    inner = inner + "<h4>" + add + "</h4>";
    document.getElementById("id").innerHTML = inner;

});


