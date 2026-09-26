// ─────────────────────────────────────────────────────────
// 1. SUPABASE SETUP
// Replace these two values with your own project's details.
// Find them in Supabase: Project Settings → API
// ─────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ayqvnrtzqdaigkfhrrtp.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_3pqGiQwkmaGvo2X0TFYf9A_vDtrC48z";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABLE = "movies";

// ─────────────────────────────────────────────────────────
// 2. STATE
// ─────────────────────────────────────────────────────────
let movies = [];
let currentFilter = "all";
let searchTerm = "";

// ─────────────────────────────────────────────────────────
// 3. DOM REFS
// ─────────────────────────────────────────────────────────
const grid = document.getElementById("grid");
const emptyState = document.getElementById("emptyState");
const statusMsg = document.getElementById("statusMsg");
const addForm = document.getElementById("addForm");
const addToggle = document.getElementById("addToggle");
const cancelAdd = document.getElementById("cancelAdd");
const searchInput = document.getElementById("search");
const tabs = document.querySelectorAll(".tab");

// ─────────────────────────────────────────────────────────
// 4. HELPERS
// ─────────────────────────────────────────────────────────
function setStatus(msg, isError = false) {
  statusMsg.textContent = msg;
  statusMsg.classList.toggle("error", isError);
}

// Deterministic "poster" color from the title, so each card looks distinct
// without needing real poster images or an external API key.
function posterStyle(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `background: linear-gradient(155deg, hsl(${hue}, 45%, 28%), hsl(${(hue + 40) % 360}, 55%, 18%));`;
}

function initials(title) {
  return title.trim().charAt(0).toUpperCase() || "?";
}

// ─────────────────────────────────────────────────────────
// 5. DATA LAYER (Supabase)
// ─────────────────────────────────────────────────────────
async function fetchMovies() {
  setStatus("Loading your list...");
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    setStatus("Couldn't load your list. Check your Supabase URL/key in app.js.", true);
    return;
  }
  movies = data;
  setStatus("");
  render();
}

async function addMovie(movie) {
  const { data, error } = await supabase.from(TABLE).insert(movie).select();
  if (error) {
    console.error(error);
    setStatus("Couldn't add that movie. Please try again.", true);
    return;
  }
  movies.unshift(data[0]);
  render();
}

async function updateMovie(id, changes) {
  const previous = [...movies];
  movies = movies.map((m) => (m.id === id ? { ...m, ...changes } : m));
  render();

  const { error } = await supabase.from(TABLE).update(changes).eq("id", id);
  if (error) {
    console.error(error);
    movies = previous;
    render();
    setStatus("That update didn't save. Please try again.", true);
  }
}

async function deleteMovie(id) {
  const previous = [...movies];
  movies = movies.filter((m) => m.id !== id);
  render();

  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) {
    console.error(error);
    movies = previous;
    render();
    setStatus("Couldn't delete that movie. Please try again.", true);
  }
}

// ─────────────────────────────────────────────────────────
// 6. RENDERING
// ─────────────────────────────────────────────────────────
function render() {
  const filtered = movies.filter((m) => {
    const matchesFilter = currentFilter === "all" || m.status === currentFilter;
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  grid.innerHTML = "";
  emptyState.classList.toggle("hidden", filtered.length > 0);

  filtered.forEach((movie) => {
    const card = document.createElement("article");
    card.className = "card";

    const metaParts = [movie.year, movie.genre].filter(Boolean);

    card.innerHTML = `
      <div class="poster" style="${posterStyle(movie.title)}">${initials(movie.title)}</div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(movie.title)}</div>
        ${metaParts.length ? `<div class="card-meta">${escapeHtml(metaParts.join(" · "))}</div>` : ""}
        ${movie.notes ? `<div class="card-notes">"${escapeHtml(movie.notes)}"</div>` : ""}
        <div class="card-row">
          <button class="status-pill ${movie.status}" data-action="toggle-status" data-id="${movie.id}">
            ${movie.status === "watched" ? "Watched" : "To watch"}
          </button>
          <div class="stars" data-id="${movie.id}">
            ${[1, 2, 3, 4, 5]
              .map(
                (n) => `<button class="star ${movie.rating >= n ? "filled" : ""}"
                  data-action="rate" data-id="${movie.id}" data-value="${n}"
                  ${movie.status !== "watched" ? "disabled" : ""}>★</button>`
              )
              .join("")}
          </div>
        </div>
      </div>
      <button class="delete-btn" data-action="delete" data-id="${movie.id}">Remove</button>
    `;

    grid.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ─────────────────────────────────────────────────────────
// 7. EVENT LISTENERS
// ─────────────────────────────────────────────────────────
addToggle.addEventListener("click", () => {
  addForm.classList.toggle("hidden");
  if (!addForm.classList.contains("hidden")) {
    document.getElementById("title").focus();
  }
});

cancelAdd.addEventListener("click", () => {
  addForm.reset();
  addForm.classList.add("hidden");
});

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  if (!title) return;

  const movie = {
    title,
    year: document.getElementById("year").value || null,
    genre: document.getElementById("genre").value.trim() || null,
    notes: document.getElementById("notes").value.trim() || null,
    status: "to_watch",
  };

  await addMovie(movie);
  addForm.reset();
  addForm.classList.add("hidden");
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentFilter = tab.dataset.filter;
    render();
  });
});

searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  render();
});

grid.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const { action, id, value } = btn.dataset;

  if (action === "toggle-status") {
    const movie = movies.find((m) => m.id === id);
    const nextStatus = movie.status === "watched" ? "to_watch" : "watched";
    const changes = { status: nextStatus };
    if (nextStatus === "to_watch") changes.rating = null;
    updateMovie(id, changes);
  }

  if (action === "rate") {
    updateMovie(id, { rating: Number(value) });
  }

  if (action === "delete") {
    if (confirm("Remove this movie from your list?")) {
      deleteMovie(id);
    }
  }
});

// ─────────────────────────────────────────────────────────
// 8. INIT
// ─────────────────────────────────────────────────────────
fetchMovies();
