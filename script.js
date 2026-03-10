let books = [];

// ─── DATA FUNCTIONS ───────────────────────────────────────────────────────────

function loadBooks() {
  let stored = localStorage.getItem("books");
  if (stored) {
    books = JSON.parse(stored);
  }
  loadDefaultBooks();
  populateAuthorFilter();
  populateGenreFilter();
  populateDatalist();
}

function saveBooks() {
  localStorage.setItem("books", JSON.stringify(books));
}

function loadDefaultBooks() {
  if (localStorage.getItem("defaultsLoaded")) return;

  let defaults = [
    { title: "The Hobbit",                          author: "J.R.R. Tolkien",       genre: "Fantasy",   publishYear: 1937, status: "Read",    rating: 5,    notes: "A timeless classic.",          coverUrl: "https://covers.openlibrary.org/b/id/8406786-M.jpg" },
    { title: "1984",                                author: "George Orwell",         genre: "Dystopian", publishYear: 1949, status: "Read",    rating: 5,    notes: "Chilling and thought provoking." },
    { title: "Dune",                                author: "Frank Herbert",         genre: "Sci-Fi",    publishYear: 1965, status: "Reading", rating: 4,    notes: "Dense but rewarding." },
    { title: "The Great Gatsby",                    author: "F. Scott Fitzgerald",   genre: "Classic",   publishYear: 1925, status: "Read",    rating: 4,    notes: "Beautiful writing style.",     coverUrl: "https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg" },
    { title: "Brave New World",                     author: "Aldous Huxley",         genre: "Dystopian", publishYear: 1932, status: "Unread",  rating: null, notes: "",                             coverUrl: "https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg" },
    { title: "The Name of the Wind",                author: "Patrick Rothfuss",      genre: "Fantasy",   publishYear: 2007, status: "Reading", rating: null, notes: "Incredible storytelling." },
    { title: "Project Hail Mary",                   author: "Andy Weir",             genre: "Sci-Fi",    publishYear: 2021, status: "Read",    rating: 5,    notes: "Best sci-fi in years." },
    { title: "To Kill a Mockingbird",               author: "Harper Lee",            genre: "Classic",   publishYear: 1960, status: "Read",    rating: 5,    notes: "Essential reading." },
    { title: "The Hitchhiker's Guide to the Galaxy",author: "Douglas Adams",         genre: "Sci-Fi",    publishYear: 1979, status: "Unread",  rating: null, notes: "" },
    { title: "Circe",                               author: "Madeline Miller",       genre: "Fantasy",   publishYear: 2018, status: "Unread",  rating: null, notes: "Heard great things." },
    { title: "The Alchemist",                       author: "Paulo Coelho",          genre: "Fiction",   publishYear: 1988, status: "Read",    rating: 4,    notes: "A moving journey." },
    { title: "Educated",                            author: "Tara Westover",         genre: "Memoir",    publishYear: 2018, status: "Reading", rating: null, notes: "Absolutely gripping." }
  ];

  defaults.forEach(function(b) {
    books.push({
      id: Date.now() + Math.random(),
      title: b.title,
      author: b.author,
      genre: b.genre,
      publishYear: b.publishYear,
      status: b.status,
      rating: b.rating,
      notes: b.notes,
      addedYear: new Date().getFullYear(),
      coverUrl: b.coverUrl || null,
    });
  });

  localStorage.setItem("defaultsLoaded", "true");
  saveBooks();
}

function addBook(title, author, genre, publishYear, status, rating, notes) {
  let book = {
    id: Date.now(),
    title,
    author,
    genre,
    publishYear,
    status,
    rating,
    notes,
    addedYear: new Date().getFullYear(),
    coverUrl: null,
  };
  books.push(book);
}

function deleteBook(id) {
  books = books.filter(function(book) {
    return book.id !== id;
  });
  saveBooks();
  renderBooks();
}

// ─── COVER FUNCTIONS ──────────────────────────────────────────────────────────

async function fetchBookCover(title, author) {
  try {
    let query = encodeURIComponent(`${title} ${author}`);
    let response = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=1`);
    let data = await response.json();
    if (data.docs.length > 0 && data.docs[0].cover_i) {
      return `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-M.jpg`;
    }
    return null;
  } catch {
    return null;
  }
}

async function loadCoversForBooks() {
  for (let book of books) {
    if (!book.coverUrl) {
      book.coverUrl = await fetchBookCover(book.title, book.author);
      if (book.coverUrl) {
        let optionsMenu = document.getElementById("options-" + book.id);
        if (optionsMenu) {
          let bookCard = optionsMenu.parentElement;
          if (bookCard) {
            let coverDiv = bookCard.querySelector(".cardCover");
            if (coverDiv) {
              coverDiv.innerHTML = `<img src="${book.coverUrl}" alt="${book.title} cover">`;
            }
          }
        }
        saveBooks();
      }
    }
  }
}

// ─── RENDER FUNCTIONS ─────────────────────────────────────────────────────────

function renderStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += i <= rating ? "★" : "☆";
  }
  return stars;
}

function renderBooks(list) {
  populateAuthorFilter();
  populateGenreFilter();
  populateDatalist();

  let container = document.getElementById("bookList");
  container.innerHTML = "";

  if (!list) {
    list = books;
  }

  let filtered = activeTab === "All"
    ? list
    : list.filter(function(book) {
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
      <div class="cardInner">
        <div class="cardCover">
          ${book.coverUrl
            ? `<img src="${book.coverUrl}" alt="${book.title} cover">`
            : `<div class="noCover">No Cover</div>`}
        </div>
        <div class="cardInfo">
          <h3>${book.title}</h3>
          <p class="cardAuthor">${book.author}</p>
          <p>Genre: ${book.genre}</p>
          <p>Published: ${book.publishYear}</p>
          <p>Status: ${book.status}</p>
          <p>Rating: <span style="color: gold; font-size: 16px;">${renderStars(book.rating)}</span></p>
          <p>Notes: <span class="notesText" id="notes-${book.id}">${book.notes}</span>
            ${book.notes && book.notes.length > 60
              ? `<button class="readMoreBtn" data-id="${book.id}">Read more</button>`
              : ""}
          </p>
        </div>
      </div>
      <button class="optionsBtn" data-id="${book.id}">⋮</button>
      <div class="optionsMenu" id="options-${book.id}">
        <button class="editBtn" data-id="${book.id}">✏ Edit</button>
        <button class="deleteBtn" data-id="${book.id}">🗑 Delete</button>
      </div>
    `;
    container.appendChild(card);
  });

  loadCoversForBooks();
}

// ─── FILTER FUNCTIONS ─────────────────────────────────────────────────────────

function populateAuthorFilter() {
  let authorSelect = document.getElementById("filterAuthor");
  authorSelect.innerHTML = '<option value="All">All Authors</option>';
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

function populateDatalist() {
  let authorList = document.getElementById("authorSuggestions");
  let genreList = document.getElementById("genreSuggestions");
  let uniqueAuthors = [...new Set(books.map(b => b.author))];
  let uniqueGenres = [...new Set(books.map(b => b.genre))];
  authorList.innerHTML = uniqueAuthors.map(a => `<option value="${a}">`).join("");
  genreList.innerHTML = uniqueGenres.map(g => `<option value="${g}">`).join("");
}

function filterAndSort() {
  let genreFilter = document.getElementById("filterGenre").value;
  let authorFilter = document.getElementById("filterAuthor").value;
  let sortValue = document.getElementById("sortBy").value;

  let filtered = activeTab === "All"
    ? [...books]
    : books.filter(function(book) {
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

// ─── POPUP FUNCTIONS ──────────────────────────────────────────────────────────

function openEditPopup(id) {
  let book = books.find(function(b) {
    return b.id === id;
  });

  document.getElementById("title").value = book.title;
  document.getElementById("author").value = book.author;
  document.getElementById("genre").value = book.genre;
  document.getElementById("publishYear").value = book.publishYear;
  document.getElementById("status").value = book.status;
  document.getElementById("rating").value = book.rating;
  document.getElementById("notes").value = book.notes;

  document.getElementById("bookForm").dataset.editId = id;
  document.getElementById("popup").querySelector("h2").textContent = "Edit Book";
  document.getElementById("bookForm").querySelector("button[type='submit']").textContent = "Save Changes";
  document.getElementById("popup").style.display = "block";
  document.getElementById("overlay").style.display = "block";

  let ratingInput = document.getElementById("rating");
  ratingInput.disabled = book.status !== "Read";
}

// ─── CELEBRATION FUNCTIONS ────────────────────────────────────────────────────

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

  playNote(400, 0,    0.15);
  playNote(500, 0.15, 0.15);
  playNote(600, 0.3,  0.15);
  playNote(800, 0.45, 0.4);
}

function showCelebration(title) {
  document.getElementById("celebrationTitle").textContent = `"${title}"`;
  document.getElementById("celebrationOverlay").classList.add("active");
  playCheer();
}

// ─── TAB FUNCTIONS ────────────────────────────────────────────────────────────

let activeTab = "All";

function updateActivetab() {
  document.querySelectorAll(".tab").forEach(function(tab) {
    tab.classList.remove("active");
    if (tab.dataset.status === activeTab) {
      tab.classList.add("active");
    }
  });
}

// ─── EVENT LISTENERS ──────────────────────────────────────────────────────────

// Book list clicks
document.getElementById("bookList").addEventListener("click", function(e) {

  if (e.target.classList.contains("optionsBtn")) {
    e.stopPropagation();
    let id = e.target.dataset.id;
    let dropdown = document.getElementById(`options-${id}`);
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  }

  if (e.target.classList.contains("deleteBtn")) {
    e.stopPropagation();
    let id = Number(e.target.dataset.id);
    let confirm = window.confirm("Are you sure you want to delete this book?");
    if (confirm) {
      books = books.filter(function(book) {
        return book.id !== id;
      });
      delete document.getElementById("bookForm").dataset.editId;
      document.getElementById("popup").querySelector("h2").textContent = "Add a Book";
      document.getElementById("bookForm").querySelector("button[type='submit']").textContent = "Add Book";
      saveBooks();
      renderBooks();
    }
  }

  if (e.target.classList.contains("editBtn")) {
    e.stopPropagation();
    let id = Number(e.target.dataset.id);
    openEditPopup(id);
  }

  if (e.target.classList.contains("readMoreBtn")) {
    e.stopPropagation();
    let id = e.target.dataset.id;
    let notesSpan = document.getElementById("notes-" + id);
    if (notesSpan.classList.contains("expanded")) {
      notesSpan.classList.remove("expanded");
      e.target.textContent = "Read more";
    } else {
      notesSpan.classList.add("expanded");
      e.target.textContent = "Read less";
    }
  }

});

// Tab clicks
document.querySelectorAll(".tab").forEach(function(tab) {
  tab.addEventListener("click", function() {
    activeTab = this.dataset.status;
    document.getElementById("searchInput").value = "";
    updateActivetab();
    renderBooks();
  });
});

// Form submission
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

    activeTab = status;
    delete this.dataset.editId;
    document.getElementById("popup").querySelector("h2").textContent = "Add a Book";
    this.querySelector("button[type='submit']").textContent = "Add Book";
    updateActivetab();

  } else {
    addBook(title, author, genre, publishYear, status, rating, notes);
  }

  saveBooks();
  renderBooks();
  e.target.reset();
  document.getElementById("popup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
});

// Open form popup
document.getElementById("openForm").addEventListener("click", function() {
  document.getElementById("popup").style.display = "block";
  document.getElementById("overlay").style.display = "block";
});

// Close form via X button
document.getElementById("closeForm").addEventListener("click", function() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  document.getElementById("bookForm").reset();
  document.getElementById("notes").style.height = "auto";
});

// Close form via overlay
document.getElementById("overlay").addEventListener("click", function() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  document.getElementById("bookForm").reset();
  document.getElementById("notes").style.height = "auto";
});

// Notes auto resize
document.getElementById("notes").addEventListener("input", function() {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

// Status change disables rating
document.getElementById("status").addEventListener("change", function() {
  let ratingInput = document.getElementById("rating");
  if (this.value === "Read") {
    ratingInput.disabled = false;
  } else {
    ratingInput.disabled = true;
    ratingInput.value = "";
  }
});

// Filter dropdown open/close
document.getElementById("openFilter").addEventListener("click", function(e) {
  e.stopPropagation();
  let dropdown = document.getElementById("filterDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

document.getElementById("filterDropdown").addEventListener("click", function(e) {
  e.stopPropagation();
});

// Apply filter button
document.getElementById("applyFilter").addEventListener("click", function() {
  filterAndSort();
  document.getElementById("filterDropdown").style.display = "none";
});

// Close dropdowns when clicking outside
document.addEventListener("click", function() {
  document.querySelectorAll(".optionsMenu").forEach(function(menu) {
    menu.style.display = "none";
  });
  document.getElementById("filterDropdown").style.display = "none";
});

// Celebration close
document.getElementById("celebrationClose").addEventListener("click", function() {
  document.getElementById("celebrationOverlay").classList.remove("active");
});

// Search input
document.getElementById("searchInput").addEventListener("input", function() {
  let query = this.value.toLowerCase().trim();
  let filtered = books.filter(function(book) {
    return (activeTab === "All" || book.status === activeTab) &&
      (book.title.toLowerCase().includes(query) ||
       book.author.toLowerCase().includes(query));
  });
  renderBooks(filtered);
});

// ─── INITIALISE ───────────────────────────────────────────────────────────────

loadBooks();
updateActivetab();
renderBooks();