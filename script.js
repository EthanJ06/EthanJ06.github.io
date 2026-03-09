let books = [];

function loadBooks() {
  let stored = localStorage.getItem("books");
  if (stored) {
    books = JSON.parse(stored);
  }
  populateAuthorFilter();
  populateGenreFilter();
  populateDatalist();
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

document.getElementById("bookList").addEventListener("click", function(e) {

  // Options button - toggle dropdown
  if (e.target.classList.contains("optionsBtn")) {
    e.stopPropagation();
    let id = e.target.dataset.id;
    let dropdown = document.getElementById(`options-${id}`);
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  }

  // Delete button
  if (e.target.classList.contains("deleteBtn")) {
    e.stopPropagation();
    let id = Number(e.target.dataset.id);
    let confirm = window.confirm("Are you sure you want to delete this book?");
    if (confirm) {
      books = books.filter(function(book) {
        return book.id !== id;
      });
      saveBooks();
      renderBooks();
    }
  }

  // Edit button - open popup with existing values
  if (e.target.classList.contains("editBtn")) {
    e.stopPropagation();
    let id = Number(e.target.dataset.id);
    openEditPopup(id);
  }

});

function openEditPopup(id) {
  let book = books.find(function(b) {
    return b.id === id;
  });

  // Pre fill the form with existing book data
  document.getElementById("title").value = book.title;
  document.getElementById("author").value = book.author;
  document.getElementById("genre").value = book.genre;
  document.getElementById("publishYear").value = book.publishYear;
  document.getElementById("status").value = book.status;
  document.getElementById("rating").value = book.rating;
  document.getElementById("notes").value = book.notes;

  // Store the id being edited
  document.getElementById("bookForm").dataset.editId = id;

  // Change the popup title and button text
  document.getElementById("popup").querySelector("h2").textContent = "Edit Book";
  document.getElementById("bookForm").querySelector("button[type='submit']").textContent = "Save Changes";

  // Open the popup
  document.getElementById("popup").style.display = "block";
  document.getElementById("overlay").style.display = "block";

  let ratingInput = document.getElementById("rating");
  ratingInput.disabled = book.status !== "Read";
}

// Display all books on the page
function renderBooks(list) {
  populateAuthorFilter();
  populateGenreFilter();
  populateDatalist();
  let container = document.getElementById("bookList");
  container.innerHTML = "";

  if (!list) {
    list = books;
  }

  let filtered = activeTab === "All" ? list : list.filter(function(book) {
  return book.status === activeTab;
  });
  if (filtered.length === 0) {
    container.innerHTML = "<p>No books here yet.</p>";
    return;
  }

  filtered.forEach(function(book) {
  let card = document.createElement("div");
  card.className = "bookCard";
  card.innerHTML = `
    <h3>${book.title}</h3>
    <button class="optionsBtn" data-id="${book.id}">⋮</button>
    <div class="optionsMenu" id="options-${book.id}">
      <button class="editBtn" data-id="${book.id}">✏ Edit</button>
      <button class="deleteBtn" data-id="${book.id}">🗑 Delete</button>
    </div>
      <p>Author: ${book.author}</p>
      <p>Genre: ${book.genre}</p>
      <p>Published: ${book.publishYear}</p>
      <p>Status: ${book.status}</p>
      <p>Rating: <span style="color: gold; font-size: 16px;">${renderStars(book.rating)}</span></p>
      <p>Notes: ${book.notes}</p>
      <p>Added: ${book.addedYear}</p>
    `;
    container.appendChild(card);
  });
}

function deleteBook(id) {
  books = books.filter(function(book) {
    return book.id !== id;
  });
  saveBooks();
  renderBooks();
}

function toggleOptions(id) {
  // Close all other open menus first
  document.querySelectorAll(".optionsMenu").forEach(function(menu) {
    menu.style.display = "none";
  });

  let menu = document.getElementById("options-" + id);
  if (menu.style.display === "block") {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }
}

// Close options menu when clicking anywhere else
document.addEventListener("click", function() {
  document.querySelectorAll(".optionsMenu").forEach(function(menu) {
    menu.style.display = "none";
  });
}); 

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
let editId = this.dataset.editId;

  if (editId) {
    // Edit existing book
    let book = books.find(function(b) {
      return b.id === Number(editId);
    });

    let previousStatus = book.status;

    book.title = title;
    book.author = author;
    book.genre = genre;
    book.publishYear = publishYear;
    book.status = status;
    book.rating = rating;
    book.notes = notes;

    if (status === "Read" && previousStatus !== "Read") {
      showCelebration(title);
    }

    activeTab = status; // Switch to the tab of the updated book

    // Clear the edit id and reset popup title
    delete this.dataset.editId;
    document.getElementById("popup").querySelector("h2").textContent = "Add a Book";
    this.querySelector("button[type='submit']").textContent = "Add Book";

    updateActivetab();

  } else {
    // Add new book
    addBook(title, author, genre, publishYear, status, rating, notes);
  }

  saveBooks();
  renderBooks();
  e.target.reset();
  document.getElementById("popup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
});

let activeTab = "All"; // default tab on page load

// Add event listeners to each tab button
document.querySelectorAll(".tab").forEach(function(tab) {
  tab.addEventListener("click", function() {
    activeTab = this.dataset.status;
    document.getElementById("searchInput").value = "";
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

function filterAndSort() {
  let genreFilter = document.getElementById("filterGenre").value;
  let authorFilter = document.getElementById("filterAuthor").value;
  let sortValue = document.getElementById("sortBy").value;

  // Start with only books matching the active tab
  let filtered = activeTab === "All" ? [...books] : books.filter(function(book) {
  return book.status === activeTab;
  });

  if (genreFilter !== "All") {
    filtered = filtered.filter(function(book) {
      return book.genre === genreFilter;
    });
  }

  if (authorFilter !== "All") {
    filtered = filtered.filter(function(book) {
      return book.author === authorFilter;
    });
  }

  filtered.sort(function(a, b) {
    if (sortValue === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortValue === "rating") {
      return b.rating - a.rating;
    } else {
      return b.addedYear - a.addedYear;
    }
  });

  renderBooks(filtered);
}

// Apply button
document.getElementById("applyFilter").addEventListener("click", function() {
  filterAndSort();
  document.getElementById("filterDropdown").style.display = "none";
});

//Populate the filter for authors entered in the book list
function populateAuthorFilter() {
  let authorSelect = document.getElementById("filterAuthor");
  
  // Clear existing options except "All Authors"
  authorSelect.innerHTML = '<option value="All">All Authors</option>';
  
  // Get unique authors from books array
  let uniqueAuthors = [...new Set(books.map(function(book) {
    return book.author;
  }))];

  uniqueAuthors.forEach(function(author) {
    let option = document.createElement("option");
    option.value = author;
    option.textContent = author;
    authorSelect.appendChild(option);
  });
}

function populateGenreFilter() {
  let genreSelect = document.getElementById("filterGenre");

  genreSelect.innerHTML = '<option value="All">All Genres</option>';

  let uniqueGenres = [...new Set(books.map(function(book) {
    return book.genre;
  }))];

  uniqueGenres.forEach(function(genre) {
    let option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreSelect.appendChild(option);
  });
}

function renderStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += "★";
    } else {
      stars += "☆";
    }
  }
  return stars;
}

document.getElementById("status").addEventListener("change", function() {
  let ratingInput = document.getElementById("rating");
  if (this.value === "Read") {
    ratingInput.disabled = false;
  } else {
    ratingInput.disabled = true;
    ratingInput.value = "";
  }
});

function playCheer() {
  let ctx = new AudioContext();

  function playNote(freq, start, duration) {
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration);
  }

  // A little ascending celebratory jingle
  playNote(400, 0, 0.15);
  playNote(500, 0.15, 0.15);
  playNote(600, 0.3, 0.15);
  playNote(800, 0.45, 0.4);
}

function showCelebration(title) {
  document.getElementById("celebrationTitle").textContent = `"${title}"`;
  document.getElementById("celebrationOverlay").classList.add("active");
  playCheer();
}

document.getElementById("celebrationClose").addEventListener("click", function() {
  document.getElementById("celebrationOverlay").classList.remove("active");
});

function populateDatalist() {
  let authorList = document.getElementById("authorSuggestions");
  let genreList = document.getElementById("genreSuggestions");

  let uniqueAuthors = [...new Set(books.map(b => b.author))];
  let uniqueGenres = [...new Set(books.map(b => b.genre))];

  authorList.innerHTML = uniqueAuthors.map(a => `<option value="${a}">`).join("");
  genreList.innerHTML = uniqueGenres.map(g => `<option value="${g}">`).join("");
}

document.getElementById("searchInput").addEventListener("input", function() {
  let query = this.value.toLowerCase().trim();

  let filtered = books.filter(function(book) {
  return (activeTab === "All" || book.status === activeTab) &&
    (book.title.toLowerCase().includes(query) ||
     book.author.toLowerCase().includes(query));
});

  renderBooks(filtered);
});

