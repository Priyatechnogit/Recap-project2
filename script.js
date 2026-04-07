// ==========================
// DATA (localStorage safe)
// ==========================
const defaultQuestions = [
  { id: "q1", question: "What does HTML stand for?", answer: "HyperText Markup Language" },
  { id: "q2", question: "What does CSS stand for?", answer: "Cascading Style Sheets" },
  { id: "q3", question: "What is JavaScript?", answer: "A programming language for the web" }
];

let questions = JSON.parse(localStorage.getItem("questions")) || defaultQuestions;
let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

// ==========================
// SAVE FUNCTIONS
// ==========================
function saveQuestions() {
  localStorage.setItem("questions", JSON.stringify(questions));
}

function saveBookmarks() {
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

// ==========================
// TOGGLE FUNCTIONS
// ==========================
function toggleAnswer(button) {
  const card = button.closest(".card");
  const answer = card.querySelector(".card__answer");

  answer.classList.toggle("hidden");

  button.textContent = answer.classList.contains("hidden")
    ? "Show Answer"
    : "Hide Answer";
}

function toggleBookmark(button, id) {
  const isSaved = bookmarks.includes(id);

  if (isSaved) {
    bookmarks = bookmarks.filter(b => b !== id);
    button.classList.remove("bookmark--active");
  } else {
    bookmarks.push(id);
    button.classList.add("bookmark--active");
  }

  saveBookmarks();
  updateProfileCounters();
}

// ==========================
// CREATE CARD
// ==========================
function createCard(questionObj) {
  const isBookmarked = bookmarks.includes(questionObj.id);

  const card = document.createElement("article");
  card.className = "card";

  card.innerHTML = `
    <h2 class="card__question">${questionObj.question}</h2>

    <button class="bookmark ${isBookmarked ? "bookmark--active" : ""}">
      <img src="./assets/bookmark.svg" class="bookmark__icon" />
    </button>

    <p class="card__answer hidden">${questionObj.answer}</p>

    <button class="answer-btn">Show Answer</button>
  `;

  // EVENTS (VERY IMPORTANT)
  const answerBtn = card.querySelector(".answer-btn");
  const bookmarkBtn = card.querySelector(".bookmark");

  answerBtn.addEventListener("click", () => toggleAnswer(answerBtn));
  bookmarkBtn.addEventListener("click", () => toggleBookmark(bookmarkBtn, questionObj.id));

  return card;
}

// ==========================
// UPDATE PROFILE COUNTERS
// ==========================
function updateProfileCounters() {
  const total = document.getElementById("totalQuestions");
  const bookmarked = document.getElementById("bookmarkedCount");
  if (total) total.textContent = questions.length;
  if (bookmarked) bookmarked.textContent = bookmarks.length;
}

// ==========================
// DARK MODE TOGGLE PERSISTENCE
// ==========================
function loadDarkMode() {
  const darkModeEnabled = localStorage.getItem("darkMode") === "true";
  const toggle = document.getElementById("dark-toggle");

  if (toggle) {
    toggle.checked = darkModeEnabled;
  }

  if (darkModeEnabled) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

function setupDarkModeToggle() {
  const toggle = document.getElementById("dark-toggle");
  if (!toggle) return;

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  });
}

// ==========================
// INIT APP
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  // ======================
  // HOME PAGE
  // ======================
  if (document.querySelector(".quiz-main") && path.includes("index")) {
    const main = document.querySelector(".quiz-main");
    main.innerHTML = "";

    questions.forEach(q => {
      main.appendChild(createCard(q));
    });
  }

  // ======================
  // BOOKMARK PAGE
  // ======================
  if (document.querySelector(".quiz-main") && path.includes("bookmarks")) {
    const main = document.querySelector(".quiz-main");
    main.innerHTML = "";

    const filtered = questions.filter(q => bookmarks.includes(q.id));

    if (filtered.length === 0) {
      main.innerHTML = "<p>No bookmarks yet</p>";
      return;
    }

    filtered.forEach(q => {
      main.appendChild(createCard(q));
    });
  }

  // ======================
  // FORM PAGE
  // ======================
  if (document.getElementById("questionForm")) {
    const form = document.getElementById("questionForm");
    const qInput = document.getElementById("questionInput");
    const aInput = document.getElementById("answerInput");
    const qCounter = document.getElementById("questionCounter");
    const aCounter = document.getElementById("answerCounter");
    const newCards = document.getElementById("newCards");

    // COUNTER FUNCTION
    function updateCounter(input, counter) {
      counter.textContent = `${input.maxLength - input.value.length} characters left`;
    }

    qInput.addEventListener("input", () => updateCounter(qInput, qCounter));
    aInput.addEventListener("input", () => updateCounter(aInput, aCounter));

    form.addEventListener("submit", e => {
      e.preventDefault();

      const newQuestion = {
        id: "q" + Date.now(),
        question: qInput.value.trim(),
        answer: aInput.value.trim()
      };

      if (!newQuestion.question || !newQuestion.answer) {
        alert("Please fill all fields");
        return;
      }

      // SAVE
      questions.push(newQuestion);
      saveQuestions();

      // SHOW BELOW FORM
      newCards.appendChild(createCard(newQuestion));

      form.reset();
      updateCounter(qInput, qCounter);
      updateCounter(aInput, aCounter);
      updateProfileCounters();
    });
  }

  // ======================
  // PROFILE PAGE
  // ======================
  if (document.getElementById("totalQuestions")) {
    updateProfileCounters();
    loadDarkMode();
    setupDarkModeToggle();
  }
});