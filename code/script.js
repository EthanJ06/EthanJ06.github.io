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

// Display all books on the page
function renderBooks(list) {
  let container = document.getElementById("bookList");
  container.innerHTML = "";

  if (!list) {
    list = books;
  }

  let filtered = list.filter(function(book) {
    return book.status === activeTab;
  });

  if (filtered.length === 0) {
    container.innerHTML = "<p>No books here yet.</p>";
    return;
  }

  filtered.forEach(function(book) {  // changed from books.forEach to filtered.forEach
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

  e.target.reset(); // reset here after submission
  document.getElementById("popup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
});

let activeTab = "Unread"; // default tab on page load

// Add event listeners to each tab button
document.querySelectorAll(".tab").forEach(function(tab) {
  tab.addEventListener("click", function() {
    activeTab = this.dataset.status;
    updateActivetab();
    renderBooks();
  });
});

// Highlights the active tab
function updateActivetab() {
  document.querySelectorAll(".tab").forEach(function(tab) {
    tab.classList.remove("active");
    if (tab.dataset.status === activeTab) {
      tab.classList.add("active");
    }
  });
}

// Run these when the page first loads
loadBooks();
updateActivetab();
renderBooks();

// Open the popup
document.getElementById("openForm").addEventListener("click", function() {
  document.getElementById("popup").style.display = "block";
  document.getElementById("overlay").style.display = "block";
});

document.getElementById("notes").addEventListener("input", function() {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

// Close the popup via the X button
document.getElementById("closeForm").addEventListener("click", function() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  document.getElementById("bookForm").reset();
  document.getElementById("notes").style.height = "auto";
});

// Close the popup by clicking the overlay
document.getElementById("overlay").addEventListener("click", function() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  document.getElementById("bookForm").reset();
  document.getElementById("notes").style.height = "auto";
});

// Open and close the filter dropdown
document.getElementById("openFilter").addEventListener("click", function(e) {
  e.stopPropagation();
  let dropdown = document.getElementById("filterDropdown");
  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
  } else {
    dropdown.style.display = "block";
  }
});

// Close when clicking anywhere else on the page
document.addEventListener("click", function() {
  document.getElementById("filterDropdown").style.display = "none";
});

// Stop clicks inside the dropdown from closing it
document.getElementById("filterDropdown").addEventListener("click", function(e) {
  e.stopPropagation();
});

// Apply button
document.getElementById("applyFilter").addEventListener("click", function() {
  filterAndSort();
  document.getElementById("filterDropdown").style.display = "none";
});