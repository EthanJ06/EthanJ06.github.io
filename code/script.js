let books = [];

function loadBooks() {
  let stored = localStorage.getItem("books");
  if (stored) {
    books = JSON.parse(stored);
  }
}

// Save books to localStorage
function saveBooks() {
  localStorage.setItem("books", JSON.stringify(books));
}

function addBook(title, author, genre, publishYear, status, rating, notes) {
  let book = {
    id: Date.now(),
    title: title,
    author: author,
    genre: genre,
    publishYear: publishYear,
    status: status,
    rating: rating, 
    notes: notes,
    addedYear: new Date().getFullYear()
  };

  books.push(book);
}

addBook("The Hobbit", "J.R.R. Tolkien", "Fantasy", 1937, "Unread", 4.3, "Good Read");

// Display all books on the page
function renderBooks() {
  let container = document.getElementById("bookList");
  container.innerHTML = "";

  books.forEach(function(book) {
    let card = document.createElement("div");
    card.innerHTML = `
      <h3>${book.title}</h3>
      <p>Author: ${book.author}</p>
      <p>Genre: ${book.genre}</p>
      <p>Published: ${book.publishYear}</p>
      <p>Status: ${book.status}</p>
      <p>Rating: ${book.rating}</p>
      <p>Notes: ${book.notes}</p>
      <p>Added: ${book.addedYear}</p>
    `;
    container.appendChild(card);
  });
}

// Listen for form submission
document.getElementById("bookForm").addEventListener("submit", function(e) {
  e.preventDefault();

  let title = document.getElementById("title").value;
  let author = document.getElementById("author").value;
  let genre = document.getElementById("genre").value;
  let publishYear = document.getElementById("publishYear").value;
  let status = document.getElementById("status").value;
  let rating = document.getElementById("rating").value;
  let notes = document.getElementById("notes").value;

  addBook(title, author, genre, publishYear, status, rating, notes);
  saveBooks();
  renderBooks();

  e.target.reset(); // clears the form
});

// Run these when the page first loads
loadBooks();
renderBooks();