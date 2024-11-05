// script.js

// Select Elements
const isbnInput = document.getElementById("isbn-input");
const addBookBtn = document.getElementById("add-book-btn");
const bookList = document.getElementById("book-list"); // tbody element

// Book Array
let books = JSON.parse(localStorage.getItem("books")) || [];
displayBooks();

// Event Listener for Add Book Button
addBookBtn.addEventListener("click", addBook);

function addBook() {
  const isbn = isbnInput.value.trim();
  if (isbn) {
    fetchBookDetails(isbn);
    isbnInput.value = "";
  } else {
    alert("Please enter a valid ISBN.");
  }
}

function fetchBookDetails(isbn) {
  function fetchBookDetails(isbn) {
    fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    )
      .then((response) => response.json())
      .then((data) => {
        const bookData = data[`ISBN:${isbn}`];
        if (bookData) {
          const book = {
            isbn: isbn,
            title: bookData.title || "No Title Available",
            cover: bookData.cover ? bookData.cover.medium : "",
            genre: bookData.subjects
              ? bookData.subjects[0].name
              : "No Genre Available",
            readingStatus: "Not Started",
            notes: "",
            summary: bookData.excerpts
              ? bookData.excerpts[0].text
              : "No Summary Available",
          };
          books.push(book);
          displayBooks();
        } else {
          alert("No book found with that ISBN.");
        }
      })
      .catch((error) => {
        console.error("Error fetching book details:", error);
        alert("An error occurred while fetching book details.");
      });
  }
}

function displayBooks() {
  bookList.innerHTML = ""; // Clear the list before rendering

  books.forEach((book, index) => {
    // Create table row
    const row = document.createElement("tr");

    // Cover Cell
    const coverCell = document.createElement("td");
    if (book.cover) {
      const img = document.createElement("img");
      img.src = book.cover;
      img.alt = `${book.title} Cover`;
      img.classList.add("book-cover");
      coverCell.appendChild(img);
    } else {
      coverCell.textContent = "No Cover Available";
    }
    row.appendChild(coverCell);

    // Title Cell
    const titleCell = document.createElement("td");
    titleCell.textContent = book.title;
    row.appendChild(titleCell);

    // Genre Cell
    const genreCell = document.createElement("td");
    genreCell.textContent = book.genre;
    row.appendChild(genreCell);

    // Summary Cell
    const summaryCell = document.createElement("td");
    summaryCell.textContent = book.summary;
    row.appendChild(summaryCell);

    // Notes Cell
    const notesCell = document.createElement("td");
    notesCell.textContent = book.notes;
    row.appendChild(notesCell);

    // Reading Status Cell
    const statusCell = document.createElement("td");
    statusCell.textContent = book.readingStatus;
    row.appendChild(statusCell);

    // Actions Cell
    const actionsCell = document.createElement("td");

    // Edit Button
    const editBtn = document.createElement("button");
    editBtn.classList.add("action-btn", "edit-btn");
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.addEventListener("click", () => openEditModal(index));
    actionsCell.appendChild(editBtn);

    // Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("action-btn", "delete-btn");
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.addEventListener("click", () => deleteBook(index));
    actionsCell.appendChild(deleteBtn);

    row.appendChild(actionsCell);

    // Append row to table body
    bookList.appendChild(row);
  });

  // Save to Local Storage
  localStorage.setItem("books", JSON.stringify(books));
}

function editBook(index) {
  const newStatus = prompt(
    "Enter new reading status:",
    books[index].readingStatus
  );
  if (newStatus !== null && newStatus.trim() !== "") {
    books[index].readingStatus = newStatus.trim();
    displayBooks();
  }
}

function deleteBook(index) {
  if (confirm("Are you sure you want to delete this book?")) {
    books.splice(index, 1);
    displayBooks();
  }
}

// Variables for Modal
const editModal = document.getElementById("edit-modal");
const closeButton = document.querySelector(".close-button");
const editForm = document.getElementById("edit-form");

let currentEditIndex = null;

// Function to Open Edit Modal
function openEditModal(index) {
  currentEditIndex = index;
  const book = books[index];

  // Populate form fields with current book data
  document.getElementById("edit-cover").value = book.cover;
  document.getElementById("edit-title").value = book.title;
  document.getElementById("edit-genre").value = book.genre;
  document.getElementById("edit-summary").value = book.summary;
  document.getElementById("edit-notes").value = book.notes;
  document.getElementById("edit-status").value = book.readingStatus;

  // Show the modal
  editModal.style.display = "block";
}

// Function to Close Edit Modal
function closeEditModal() {
  editModal.style.display = "none";
}

// Event Listener for Close Button
closeButton.addEventListener("click", closeEditModal);

// Event Listener for Outside Click
window.addEventListener("click", function (event) {
  if (event.target == editModal) {
    closeEditModal();
  }
});

// Handle Form Submission
editForm.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get updated values from form
  const updatedBook = {
    ...books[currentEditIndex],
    cover: document.getElementById("edit-cover").value.trim(),
    title: document.getElementById("edit-title").value.trim(),
    genre: document.getElementById("edit-genre").value.trim(),
    summary: document.getElementById("edit-summary").value.trim(),
    notes: document.getElementById("edit-notes").value.trim(),
    readingStatus: document.getElementById("edit-status").value.trim(),
  };

  // Update the book in the array
  books[currentEditIndex] = updatedBook;

  // Refresh the display and close the modal
  displayBooks();
  closeEditModal();
});
