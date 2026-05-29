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
let inner = "";

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
        const ISBN = ((bookList[bookList.length-1].ISBN).slice(0,5) + (Number.parseInt((bookList[bookList.length-1].ISBN.slice(5,21)))+1));
        await serverFonksiyonlari.addNewBook(ISBN, titleInput.value, categoryInput.value);  
    }
    // Listeyi güncelle (Senin kısmın)
    bookList = await serverFonksiyonlari.getAllBooks();
    
    // Ekrana yazdır (Damla'nın kısmının hatasız hali)
    let inner = document.getElementById("right").innerHTML || "";
    let add = (titleInput.value.trim().padEnd(30, " ")) + (categoryInput.value.trim().padEnd(50, " "));
    inner = inner + "<h4>" + add + "</h4>";
    document.getElementById("right").innerHTML = inner;
});


