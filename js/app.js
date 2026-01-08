// App Module
// Main application logic and UI integration

// State
let currentDeckId = null;
let currentView = "welcome"; // welcome, deckManagement, study

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  // Load and render decks
  renderDeckList();

  // Event listeners
  document.getElementById("newDeckBtn").addEventListener("click", showNewDeckModal);

  // Check if there are decks
  const decks = loadDecks();
  if (decks.length === 0) {
    showView("welcome");
  }
}

// Render deck list in sidebar
function renderDeckList() {
  const decks = getDecksWithCounts();
  const deckListEl = document.getElementById("deckList");

  if (decks.length === 0) {
    deckListEl.innerHTML = `
      <div class="text-center text-gray-400 py-8">
        <p>No decks yet</p>
      </div>
    `;
    return;
  }

  deckListEl.innerHTML = decks.map(deck => `
    <div
      class="deck-item p-4 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition ${deck.id === currentDeckId ? 'ring-2 ring-blue-500' : ''}"
      data-deck-id="${deck.id}"
      onclick="selectDeck('${deck.id}')"
    >
      <div class="font-semibold">📚 ${escapeHtml(deck.name)}</div>
      <div class="text-sm text-gray-400 mt-1">
        ${deck.cardCount} cards · 0 due today
      </div>
    </div>
  `).join("");
}

// Select a deck
function selectDeck(deckId) {
  currentDeckId = deckId;

  // Update UI
  renderDeckList();
  showDeckActions();
  showView("deckManagement");
  renderDeckManagementView(deckId);
}

// Show deck actions buttons
function showDeckActions() {
  document.getElementById("deckActions").classList.remove("hidden");
}

// Show new deck modal
function showNewDeckModal() {
  const modalContent = `
    <h3 class="text-xl font-bold mb-4">Create New Deck</h3>
    <form id="newDeckForm" class="space-y-4">
      <div>
        <label for="deckNameInput" class="block text-sm font-medium mb-2">Deck Name:</label>
        <input
          type="text"
          id="deckNameInput"
          class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          required
          autocomplete="off"
        />
        <div id="deckNameError" class="text-red-500 text-sm mt-1 hidden"></div>
      </div>
      <div>
        <label for="deckDescInput" class="block text-sm font-medium mb-2">Description (optional):</label>
        <textarea
          id="deckDescInput"
          rows="2"
          class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
        ></textarea>
      </div>
      <div class="flex gap-2">
        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition min-h-[44px]">
          Create
        </button>
        <button type="button" onclick="closeModal()" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition min-h-[44px]">
          Cancel
        </button>
      </div>
    </form>
  `;

  showModal(modalContent);

  // Form submit handler
  document.getElementById("newDeckForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleCreateDeck();
  });

  // Focus on name input
  document.getElementById("deckNameInput").focus();
}

// Handle create deck
function handleCreateDeck() {
  const nameInput = document.getElementById("deckNameInput");
  const descInput = document.getElementById("deckDescInput");
  const errorEl = document.getElementById("deckNameError");

  const name = nameInput.value;
  const description = descInput.value;

  // Validate
  const decks = loadDecks();
  const validation = validateDeckName(name, decks);

  if (!validation.valid) {
    errorEl.textContent = validation.error;
    errorEl.classList.remove("hidden");
    return;
  }

  // Create deck
  const newDeck = createDeck(name, description);
  decks.push(newDeck);
  saveDecks(decks);

  // Update UI
  closeModal();
  renderDeckList();
  selectDeck(newDeck.id);
}

// Show edit deck modal
function showEditDeckModal(deckId) {
  const decks = loadDecks();
  const deck = getDeck(deckId, decks);

  if (!deck) return;

  const modalContent = `
    <h3 class="text-xl font-bold mb-4">Edit Deck</h3>
    <form id="editDeckForm" class="space-y-4">
      <div>
        <label for="editDeckNameInput" class="block text-sm font-medium mb-2">Deck Name:</label>
        <input
          type="text"
          id="editDeckNameInput"
          value="${escapeHtml(deck.name)}"
          class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          required
          autocomplete="off"
        />
        <div id="editDeckNameError" class="text-red-500 text-sm mt-1 hidden"></div>
      </div>
      <div>
        <label for="editDeckDescInput" class="block text-sm font-medium mb-2">Description:</label>
        <textarea
          id="editDeckDescInput"
          rows="2"
          class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
        >${escapeHtml(deck.description)}</textarea>
      </div>
      <div class="flex gap-2">
        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition min-h-[44px]">
          Save
        </button>
        <button type="button" onclick="closeModal()" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition min-h-[44px]">
          Cancel
        </button>
      </div>
      <hr class="border-gray-600">
      <button
        type="button"
        onclick="handleDeleteDeck('${deckId}')"
        class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition min-h-[44px]"
      >
        Delete Deck
      </button>
    </form>
  `;

  showModal(modalContent);

  document.getElementById("editDeckForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleUpdateDeck(deckId);
  });
}

// Handle update deck
function handleUpdateDeck(deckId) {
  const nameInput = document.getElementById("editDeckNameInput");
  const descInput = document.getElementById("editDeckDescInput");
  const errorEl = document.getElementById("editDeckNameError");

  const name = nameInput.value;
  const description = descInput.value;

  // Validate
  let decks = loadDecks();
  const validation = validateDeckName(name, decks, deckId);

  if (!validation.valid) {
    errorEl.textContent = validation.error;
    errorEl.classList.remove("hidden");
    return;
  }

  // Update deck
  const updatedDeck = updateDeck(deckId, { name, description }, decks);
  decks = decks.map(d => d.id === deckId ? updatedDeck : d);
  saveDecks(decks);

  // Update UI
  closeModal();
  renderDeckList();
  renderDeckManagementView(deckId);
}

// Handle delete deck
function handleDeleteDeck(deckId) {
  const decks = loadDecks();
  const deck = getDeck(deckId, decks);
  const cards = loadCards();
  const deckCardCount = cards.filter(c => c.deckId === deckId).length;

  const message = deckCardCount > 0
    ? `Delete "${deck.name}"?\n\n${deckCardCount} card(s) will also be deleted.`
    : `Delete "${deck.name}"?`;

  if (!confirm(message)) return;

  // Delete with cascade
  deleteDeckWithCards(deckId);

  // Update UI
  closeModal();
  currentDeckId = null;
  renderDeckList();
  showView("welcome");
  document.getElementById("deckActions").classList.add("hidden");
}

// Render deck management view
function renderDeckManagementView(deckId) {
  const decks = loadDecks();
  const deck = getDeck(deckId, decks);

  if (!deck) {
    showView("welcome");
    return;
  }

  document.getElementById("deckTitle").textContent = deck.name;
  document.getElementById("deckDescription").textContent = deck.description || "No description";

  // For now, show empty card list (will be implemented in Phase 2)
  const cardListEl = document.getElementById("cardList");
  cardListEl.innerHTML = `
    <div class="text-center text-gray-400 py-8">
      <p>No cards yet. Add your first card!</p>
    </div>
  `;

  // Setup manage button
  document.getElementById("manageDeckBtn").onclick = () => showEditDeckModal(deckId);
}

// Show/hide views
function showView(viewName) {
  currentView = viewName;

  document.getElementById("welcomeView").classList.add("hidden");
  document.getElementById("deckManagementView").classList.add("hidden");
  document.getElementById("studyView").classList.add("hidden");

  if (viewName === "welcome") {
    document.getElementById("welcomeView").classList.remove("hidden");
  } else if (viewName === "deckManagement") {
    document.getElementById("deckManagementView").classList.remove("hidden");
  } else if (viewName === "study") {
    document.getElementById("studyView").classList.remove("hidden");
  }
}

// Modal utilities
function showModal(content) {
  const overlay = document.getElementById("modalOverlay");
  const modalContent = document.getElementById("modalContent");

  modalContent.innerHTML = content;
  overlay.classList.remove("hidden");

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  };

  // Close on Esc
  document.addEventListener("keydown", handleModalEsc);
}

function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
  document.removeEventListener("keydown", handleModalEsc);
}

function handleModalEsc(e) {
  if (e.key === "Escape") {
    closeModal();
  }
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
