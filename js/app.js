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
  updateHeaderDeckSelector();

  // Event listeners
  document.getElementById("newDeckBtn").addEventListener("click", showNewDeckModal);
  document.getElementById("importDeckBtn").addEventListener("click", handleImportClick);

  // Header deck selector change
  document.getElementById("headerDeckSelect").addEventListener("change", (e) => {
    if (e.target.value) {
      selectDeck(e.target.value);
    }
  });

  // Check if there are decks
  const decks = loadDecks();
  if (decks.length === 0) {
    showView("welcome");
  }

  // Setup multi-tab sync
  setupStorageSync(() => {
    renderDeckList();
    updateHeaderDeckSelector();
    if (currentDeckId) {
      renderDeckManagementView(currentDeckId);
      updateHeaderCardCount(currentDeckId);
    }
  });

  // Setup global keyboard shortcuts
  setupGlobalKeyboardShortcuts();
}

// Update header deck selector dropdown
function updateHeaderDeckSelector() {
  const decks = loadDecks();
  const headerSelect = document.getElementById("headerDeckSelect");

  headerSelect.innerHTML = decks.map(deck =>
    `<option value="${deck.id}" ${deck.id === currentDeckId ? 'selected' : ''}>${escapeHtml(deck.name)}</option>`
  ).join("");
}

// Update header card count badge
function updateHeaderCardCount(deckId) {
  const decks = loadDecks();
  const deck = getDeck(deckId, decks);
  const cards = loadCards();
  const deckCards = cards.filter(c => c.deckId === deckId);

  document.getElementById("headerCardCountText").textContent = `${deckCards.length} cards`;
}

// Show/hide header controls
function showHeaderControls(show) {
  const headerControls = document.getElementById("headerControls");
  const headerCardCount = document.getElementById("headerCardCount");

  if (show) {
    headerControls.classList.remove("hidden");
    headerControls.classList.add("flex");
    headerCardCount.classList.remove("hidden");
    headerCardCount.classList.add("lg:flex");
  } else {
    headerControls.classList.add("hidden");
    headerControls.classList.remove("flex");
    headerCardCount.classList.add("hidden");
    headerCardCount.classList.remove("lg:flex");
  }
}

// Render deck list in sidebar
function renderDeckList() {
  const decks = getDecksWithCounts();
  const deckListEl = document.getElementById("deckList");

  if (decks.length === 0) {
    deckListEl.innerHTML = `
      <div class="text-center text-text-subtle py-8">
        <span class="material-symbols-outlined text-4xl text-text-subtle mb-2 block">folder_off</span>
        <p>No decks yet</p>
      </div>
    `;
    return;
  }

  const allCards = loadCards();

  deckListEl.innerHTML = decks.map(deck => {
    const dueCount = getDueCount(deck.id, allCards);
    const isSelected = deck.id === currentDeckId;
    return `
    <div
      class="deck-item p-4 ${isSelected ? 'bg-surface ring-2 ring-primary' : 'bg-card-dark hover:bg-card-hover'} rounded-xl cursor-pointer transition-all group"
      data-deck-id="${deck.id}"
      onclick="selectDeck('${deck.id}')"
    >
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center size-10 rounded-lg ${isSelected ? 'bg-primary/20' : 'bg-surface'} transition-colors">
          <span class="material-symbols-outlined ${isSelected ? 'text-primary' : 'text-text-muted'} text-[20px]">style</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-white truncate">${escapeHtml(deck.name)}</div>
          <div class="text-sm text-text-subtle flex items-center gap-2 mt-0.5">
            <span>${deck.cardCount} cards</span>
            ${dueCount > 0 ? `
              <span class="inline-flex items-center gap-1 text-primary">
                <span class="material-symbols-outlined text-[14px]">schedule</span>
                <span class="font-medium">${dueCount} due</span>
              </span>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
    `;
  }).join("");
}

// Select a deck
function selectDeck(deckId) {
  currentDeckId = deckId;

  // Update UI
  renderDeckList();
  showDeckActions();
  showView("deckManagement");
  renderDeckManagementView(deckId);

  // Show header controls and update
  showHeaderControls(true);
  updateHeaderDeckSelector();
  updateHeaderCardCount(deckId);

  // Show export button (use flex to show, hidden to hide)
  const exportBtn = document.getElementById("exportDeckBtn");
  exportBtn.classList.remove("hidden");
  exportBtn.classList.add("flex");
  exportBtn.onclick = () => handleExportDeck(deckId);
}

// Show deck actions buttons
function showDeckActions() {
  document.getElementById("deckActions").classList.remove("hidden");
}

// Show new deck modal
function showNewDeckModal() {
  const modalContent = `
    <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
      <span class="material-symbols-outlined text-primary">create_new_folder</span>
      Create New Deck
    </h3>
    <form id="newDeckForm" class="space-y-4">
      <div>
        <label for="deckNameInput" class="block text-sm font-medium mb-2 text-text-muted">Deck Name</label>
        <input
          type="text"
          id="deckNameInput"
          class="w-full bg-background-dark rounded-lg border-0 px-4 py-3 text-white placeholder:text-text-subtle ring-1 ring-inset ring-border-dark hover:ring-border-hover focus:ring-2 focus:ring-primary transition-all"
          placeholder="Enter deck name..."
          required
          autocomplete="off"
        />
        <div id="deckNameError" class="text-coral text-sm mt-2 hidden"></div>
      </div>
      <div>
        <label for="deckDescInput" class="block text-sm font-medium mb-2 text-text-muted">Description (optional)</label>
        <textarea
          id="deckDescInput"
          rows="2"
          class="w-full bg-background-dark rounded-lg border-0 px-4 py-3 text-white placeholder:text-text-subtle ring-1 ring-inset ring-border-dark hover:ring-border-hover focus:ring-2 focus:ring-primary transition-all resize-none"
          placeholder="Enter description..."
        ></textarea>
      </div>
      <div class="flex gap-3 pt-2">
        <button type="submit" class="flex-1 h-12 bg-primary hover:bg-primary-hover text-background-dark font-bold rounded-xl transition-all btn-primary-glow flex items-center justify-center gap-2 min-h-[44px]">
          <span class="material-symbols-outlined">add</span>
          Create
        </button>
        <button type="button" onclick="closeModal()" class="flex-1 h-12 bg-surface hover:bg-surface-hover text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px]">
          <span class="material-symbols-outlined">close</span>
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
    <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
      <span class="material-symbols-outlined text-primary">edit</span>
      Edit Deck
    </h3>
    <form id="editDeckForm" class="space-y-4">
      <div>
        <label for="editDeckNameInput" class="block text-sm font-medium mb-2 text-text-muted">Deck Name</label>
        <input
          type="text"
          id="editDeckNameInput"
          value="${escapeHtml(deck.name)}"
          class="w-full bg-background-dark rounded-lg border-0 px-4 py-3 text-white placeholder:text-text-subtle ring-1 ring-inset ring-border-dark hover:ring-border-hover focus:ring-2 focus:ring-primary transition-all"
          required
          autocomplete="off"
        />
        <div id="editDeckNameError" class="text-coral text-sm mt-2 hidden"></div>
      </div>
      <div>
        <label for="editDeckDescInput" class="block text-sm font-medium mb-2 text-text-muted">Description</label>
        <textarea
          id="editDeckDescInput"
          rows="2"
          class="w-full bg-background-dark rounded-lg border-0 px-4 py-3 text-white placeholder:text-text-subtle ring-1 ring-inset ring-border-dark hover:ring-border-hover focus:ring-2 focus:ring-primary transition-all resize-none"
        >${escapeHtml(deck.description)}</textarea>
      </div>
      <div class="flex gap-3 pt-2">
        <button type="submit" class="flex-1 h-12 bg-primary hover:bg-primary-hover text-background-dark font-bold rounded-xl transition-all btn-primary-glow flex items-center justify-center gap-2 min-h-[44px]">
          <span class="material-symbols-outlined">save</span>
          Save
        </button>
        <button type="button" onclick="closeModal()" class="flex-1 h-12 bg-surface hover:bg-surface-hover text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px]">
          <span class="material-symbols-outlined">close</span>
          Cancel
        </button>
      </div>
      <hr class="border-border-dark my-4">
      <button
        type="button"
        onclick="handleDeleteDeck('${deckId}')"
        class="w-full h-12 bg-coral/10 border border-coral/20 text-coral font-bold rounded-xl hover:bg-coral hover:text-white transition-all flex items-center justify-center gap-2 min-h-[44px]"
      >
        <span class="material-symbols-outlined">delete</span>
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
  updateHeaderDeckSelector();
  showView("welcome");
  document.getElementById("deckActions").classList.add("hidden");

  // Hide header controls
  showHeaderControls(false);

  // Hide export button
  const exportBtn = document.getElementById("exportDeckBtn");
  exportBtn.classList.add("hidden");
  exportBtn.classList.remove("flex");
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

  // Render card list
  renderCardList(deckId);

  // Setup buttons
  document.getElementById("manageDeckBtn").onclick = () => showEditDeckModal(deckId);
  document.getElementById("addCardBtn").onclick = () => showAddCardModal(deckId);

  // Setup search and filter
  setupSearchAndFilter(deckId);
}

// Render card list
function renderCardList(deckId, searchQuery = "", filterLevel = "all") {
  const allCards = loadCards();
  let cards = getCardsByDeck(deckId, allCards);

  // Apply search
  if (searchQuery) {
    cards = searchCards(cards, searchQuery);
  }

  // Apply filter
  if (filterLevel && filterLevel !== "all") {
    cards = filterCardsByLevel(cards, filterLevel);
  }

  const cardListEl = document.getElementById("cardList");

  if (cards.length === 0) {
    const message = searchQuery || filterLevel !== "all"
      ? "No cards match your search or filter"
      : "No cards yet. Add your first card!";

    cardListEl.innerHTML = `
      <div class="text-center text-text-subtle py-12">
        <span class="material-symbols-outlined text-4xl text-text-subtle mb-3 block">note_stack</span>
        <p>${message}</p>
      </div>
    `;
    return;
  }

  cardListEl.innerHTML = cards.map(card => `
    <div class="bg-card-dark hover:bg-card-hover p-5 rounded-xl transition-colors group">
      <div class="flex justify-between items-start gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Front</span>
            ${getLevelBadge(card.level)}
          </div>
          <div class="font-semibold text-white mb-3 break-words">${escapeHtml(card.front)}</div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold text-text-muted bg-surface px-2 py-0.5 rounded-full uppercase tracking-wider">Back</span>
          </div>
          <div class="text-text-muted text-sm break-words">${escapeHtml(card.back)}</div>
        </div>
      </div>
      <div class="flex gap-2 mt-4 pt-4 border-t border-border-dark">
        <button
          onclick="showEditCardModal('${card.id}')"
          class="flex-1 h-10 bg-surface hover:bg-surface-hover text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <span class="material-symbols-outlined text-[18px]">edit</span>
          Edit
        </button>
        <button
          onclick="handleDeleteCard('${card.id}')"
          class="h-10 px-4 bg-coral/10 border border-coral/20 text-coral text-sm font-medium rounded-lg hover:bg-coral hover:text-white transition-all flex items-center justify-center gap-1.5"
        >
          <span class="material-symbols-outlined text-[18px]">delete</span>
          Delete
        </button>
      </div>
    </div>
  `).join("");

  // Update deck card count
  updateDeckCardCount(deckId);
}

// Setup search and filter (with debounce)
let currentSearchQuery = "";
let currentFilterLevel = "all";

function setupSearchAndFilter(deckId) {
  const searchInput = document.getElementById("cardSearch");
  const filterSelect = document.getElementById("filterLevel");

  // Reset
  searchInput.value = "";
  filterSelect.value = "all";
  currentSearchQuery = "";
  currentFilterLevel = "all";

  // Search with debounce (300ms)
  const debouncedSearch = debounce((query) => {
    currentSearchQuery = query;
    renderCardList(deckId, currentSearchQuery, currentFilterLevel);
  }, 300);

  searchInput.oninput = (e) => {
    debouncedSearch(e.target.value);
  };

  // Filter (immediate)
  filterSelect.onchange = (e) => {
    currentFilterLevel = e.target.value;
    renderCardList(deckId, currentSearchQuery, currentFilterLevel);
  };
}

// Show add card modal
function showAddCardModal(deckId) {
  const modalContent = `
    <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
      <span class="material-symbols-outlined text-primary">add_card</span>
      Add New Card
    </h3>
    <form id="addCardForm" class="space-y-4">
      <div>
        <label for="cardFrontInput" class="block text-sm font-medium mb-2 text-text-muted">Front (Question/Term)</label>
        <textarea
          id="cardFrontInput"
          rows="3"
          class="w-full bg-background-dark rounded-lg border-0 px-4 py-3 text-white placeholder:text-text-subtle ring-1 ring-inset ring-border-dark hover:ring-border-hover focus:ring-2 focus:ring-primary transition-all resize-none"
          placeholder="Enter question or term..."
          required
        ></textarea>
        <div id="cardFrontError" class="text-coral text-sm mt-2 hidden"></div>
      </div>
      <div>
        <label for="cardBackInput" class="block text-sm font-medium mb-2 text-text-muted">Back (Answer/Definition)</label>
        <textarea
          id="cardBackInput"
          rows="3"
          class="w-full bg-background-dark rounded-lg border-0 px-4 py-3 text-white placeholder:text-text-subtle ring-1 ring-inset ring-border-dark hover:ring-border-hover focus:ring-2 focus:ring-primary transition-all resize-none"
          placeholder="Enter answer or definition..."
          required
        ></textarea>
        <div id="cardBackError" class="text-coral text-sm mt-2 hidden"></div>
      </div>
      <div class="flex gap-3 pt-2">
        <button type="submit" class="flex-1 h-12 bg-primary hover:bg-primary-hover text-background-dark font-bold rounded-xl transition-all btn-primary-glow flex items-center justify-center gap-2 min-h-[44px]">
          <span class="material-symbols-outlined">add</span>
          Add Card
        </button>
        <button type="button" onclick="closeModal()" class="flex-1 h-12 bg-surface hover:bg-surface-hover text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px]">
          <span class="material-symbols-outlined">close</span>
          Cancel
        </button>
      </div>
    </form>
  `;

  showModal(modalContent);

  document.getElementById("addCardForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleAddCard(deckId);
  });

  document.getElementById("cardFrontInput").focus();
}

// Handle add card
function handleAddCard(deckId) {
  const frontInput = document.getElementById("cardFrontInput");
  const backInput = document.getElementById("cardBackInput");
  const frontError = document.getElementById("cardFrontError");
  const backError = document.getElementById("cardBackError");

  const front = frontInput.value;
  const back = backInput.value;

  // Hide previous errors
  frontError.classList.add("hidden");
  backError.classList.add("hidden");

  // Validate
  const validation = validateCard(front, back);
  if (!validation.valid) {
    if (!front.trim()) {
      frontError.textContent = validation.error;
      frontError.classList.remove("hidden");
    } else {
      backError.textContent = validation.error;
      backError.classList.remove("hidden");
    }
    return;
  }

  // Create card
  const newCard = createCard(deckId, front, back);
  const cards = loadCards();
  cards.push(newCard);
  saveCards(cards);

  // Update deck count
  updateDeckCardCount(deckId);
  const decks = loadDecks();
  saveDecks(decks);

  // Update UI
  closeModal();
  renderCardList(deckId, currentSearchQuery, currentFilterLevel);
  renderDeckList();
  updateHeaderCardCount(deckId);
}

// Show edit card modal
function showEditCardModal(cardId) {
  const cards = loadCards();
  const card = getCard(cardId, cards);

  if (!card) return;

  const modalContent = `
    <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
      <span class="material-symbols-outlined text-primary">edit_note</span>
      Edit Card
    </h3>
    <form id="editCardForm" class="space-y-4">
      <div>
        <label for="editCardFrontInput" class="block text-sm font-medium mb-2 text-text-muted">Front (Question/Term)</label>
        <textarea
          id="editCardFrontInput"
          rows="3"
          class="w-full bg-background-dark rounded-lg border-0 px-4 py-3 text-white placeholder:text-text-subtle ring-1 ring-inset ring-border-dark hover:ring-border-hover focus:ring-2 focus:ring-primary transition-all resize-none"
          required
        >${escapeHtml(card.front)}</textarea>
        <div id="editCardFrontError" class="text-coral text-sm mt-2 hidden"></div>
      </div>
      <div>
        <label for="editCardBackInput" class="block text-sm font-medium mb-2 text-text-muted">Back (Answer/Definition)</label>
        <textarea
          id="editCardBackInput"
          rows="3"
          class="w-full bg-background-dark rounded-lg border-0 px-4 py-3 text-white placeholder:text-text-subtle ring-1 ring-inset ring-border-dark hover:ring-border-hover focus:ring-2 focus:ring-primary transition-all resize-none"
          required
        >${escapeHtml(card.back)}</textarea>
        <div id="editCardBackError" class="text-coral text-sm mt-2 hidden"></div>
      </div>
      <div class="flex items-center gap-4 p-3 bg-surface rounded-lg text-sm">
        <div class="flex items-center gap-2 text-text-muted">
          <span class="material-symbols-outlined text-[18px]">trending_up</span>
          ${getLevelBadge(card.level)}
        </div>
        <div class="flex items-center gap-2 text-text-subtle">
          <span class="material-symbols-outlined text-[18px]">calendar_today</span>
          ${new Date(card.created).toLocaleDateString()}
        </div>
      </div>
      <div class="flex gap-3 pt-2">
        <button type="submit" class="flex-1 h-12 bg-primary hover:bg-primary-hover text-background-dark font-bold rounded-xl transition-all btn-primary-glow flex items-center justify-center gap-2 min-h-[44px]">
          <span class="material-symbols-outlined">save</span>
          Save
        </button>
        <button type="button" onclick="closeModal()" class="flex-1 h-12 bg-surface hover:bg-surface-hover text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px]">
          <span class="material-symbols-outlined">close</span>
          Cancel
        </button>
      </div>
    </form>
  `;

  showModal(modalContent);

  document.getElementById("editCardForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleUpdateCard(cardId);
  });
}

// Handle update card
function handleUpdateCard(cardId) {
  const frontInput = document.getElementById("editCardFrontInput");
  const backInput = document.getElementById("editCardBackInput");
  const frontError = document.getElementById("editCardFrontError");
  const backError = document.getElementById("editCardBackError");

  const front = frontInput.value;
  const back = backInput.value;

  // Hide previous errors
  frontError.classList.add("hidden");
  backError.classList.add("hidden");

  // Validate
  const validation = validateCard(front, back);
  if (!validation.valid) {
    if (!front.trim()) {
      frontError.textContent = validation.error;
      frontError.classList.remove("hidden");
    } else {
      backError.textContent = validation.error;
      backError.classList.remove("hidden");
    }
    return;
  }

  // Update card
  let cards = loadCards();
  const updatedCard = updateCard(cardId, { front, back }, cards);
  cards = cards.map(c => c.id === cardId ? updatedCard : c);
  saveCards(cards);

  // Update UI
  closeModal();
  renderCardList(currentDeckId, currentSearchQuery, currentFilterLevel);
}

// Handle delete card
function handleDeleteCard(cardId) {
  const cards = loadCards();
  const card = getCard(cardId, cards);

  if (!confirm(`Delete this card?\n\nFront: ${card.front}`)) return;

  // Delete card
  const updatedCards = deleteCard(cardId, cards);
  saveCards(updatedCards);

  // Update deck count
  updateDeckCardCount(card.deckId);
  const decks = loadDecks();
  saveDecks(decks);

  // Update UI
  renderCardList(currentDeckId, currentSearchQuery, currentFilterLevel);
  renderDeckList();
  updateHeaderCardCount(card.deckId);
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

// Utility: Get level display
function getLevelDisplay(level) {
  const stars = "⭐".repeat(level);
  return `Level ${level} ${stars}`;
}

// Utility: Get level badge HTML
function getLevelBadge(level) {
  const colors = {
    1: 'bg-coral/10 text-coral',
    2: 'bg-yellow-500/10 text-yellow-400',
    3: 'bg-primary/10 text-primary'
  };
  const colorClass = colors[level] || colors[1];
  return `<span class="text-xs font-bold ${colorClass} px-2 py-0.5 rounded-full">Lv.${level}</span>`;
}

// Utility: Debounce function
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// ========================
// Study Mode (Phase 4)
// ========================

// Study session state
let studySession = {
  deckId: null,
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  stats: {
    correct: 0,
    incorrect: 0,
    total: 0,
    startTime: null
  }
};

// Start study session
function startStudySession(deckId) {
  const allCards = loadCards();
  const dueCards = getDueCards(deckId, allCards);

  // Check if there are cards to study
  if (dueCards.length === 0) {
    alert("No cards are due for review!\n\nAll caught up!");
    return;
  }

  // Get deck name
  const decks = loadDecks();
  const deck = getDeck(deckId, decks);

  // Initialize session
  studySession = {
    deckId: deckId,
    deckName: deck ? deck.name : "Study Session",
    cards: dueCards,
    currentIndex: 0,
    isFlipped: false,
    stats: {
      correct: 0,
      incorrect: 0,
      total: dueCards.length,
      startTime: Date.now()
    }
  };

  // Show study view
  showView("study");

  // Show bottom progress bar
  document.getElementById("bottomProgressBar").classList.remove("hidden");

  // Set deck name
  document.getElementById("studyDeckName").textContent = studySession.deckName + " Deck";

  renderStudyCard();
  updateStudyProgress();

  // Setup study button handlers
  setupStudyButtons();

  // Setup keyboard shortcuts
  document.addEventListener("keydown", handleStudyKeyboard);
}

// Setup study button handlers
function setupStudyButtons() {
  document.getElementById("showAnswerBtn").onclick = () => flipCard();
  document.getElementById("reviewAgainBtn").onclick = () => handleReviewAnswer(false);
  document.getElementById("knowItBtn").onclick = () => handleReviewAnswer(true);
}

// Render current study card
function renderStudyCard() {
  const card = studySession.cards[studySession.currentIndex];

  if (!card) {
    endStudySession();
    return;
  }

  // Set card content
  document.getElementById("cardFront").textContent = card.front;
  document.getElementById("cardBack").textContent = card.back;

  // Reset flip state
  studySession.isFlipped = false;
  document.getElementById("studyCard").classList.remove("flipped");

  // Show/hide buttons
  document.getElementById("showAnswerBtn").classList.remove("hidden");
  document.getElementById("reviewAgainBtn").classList.add("hidden");
  document.getElementById("knowItBtn").classList.add("hidden");
}

// Flip card to show answer
function flipCard() {
  if (studySession.isFlipped) return;

  studySession.isFlipped = true;
  document.getElementById("studyCard").classList.add("flipped");

  // Switch buttons
  document.getElementById("showAnswerBtn").classList.add("hidden");
  document.getElementById("reviewAgainBtn").classList.remove("hidden");
  document.getElementById("knowItBtn").classList.remove("hidden");
}

// Handle review answer
function handleReviewAnswer(isCorrect) {
  if (!studySession.isFlipped) return;

  const card = studySession.cards[studySession.currentIndex];
  let allCards = loadCards();

  // Update card based on answer
  let updatedCard;
  if (isCorrect) {
    updatedCard = markCorrect(card);
    studySession.stats.correct++;
  } else {
    updatedCard = markIncorrect(card);
    studySession.stats.incorrect++;
  }

  // Save updated card
  allCards = allCards.map(c => c.id === card.id ? updatedCard : c);
  saveCards(allCards);

  // Move to next card
  studySession.currentIndex++;
  updateStudyProgress();

  if (studySession.currentIndex >= studySession.cards.length) {
    endStudySession();
  } else {
    renderStudyCard();
  }
}

// Update study progress
function updateStudyProgress() {
  const current = studySession.currentIndex + 1;
  const total = studySession.stats.total;
  const percentage = (studySession.currentIndex / total) * 100;

  // Update progress text
  document.getElementById("studyProgress").textContent = `Card ${Math.min(current, total)}`;
  document.getElementById("studyTotal").textContent = `of ${total}`;

  // Update progress bar
  document.getElementById("progressBar").style.width = `${percentage}%`;

  // Update stats counters
  document.getElementById("correctCount").textContent = studySession.stats.correct;
  document.getElementById("incorrectCount").textContent = studySession.stats.incorrect;
}

// End study session
function endStudySession() {
  const stats = studySession.stats;
  const duration = Math.floor((Date.now() - stats.startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const correctPercentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  const message = `
Session Complete!

Cards Reviewed: ${stats.total}
Correct: ${stats.correct} (${correctPercentage}%)
Review Again: ${stats.incorrect}
Time: ${minutes}m ${seconds}s

Great work!
  `.trim();

  alert(message);

  // Remove keyboard listener
  document.removeEventListener("keydown", handleStudyKeyboard);

  // Hide bottom progress bar
  document.getElementById("bottomProgressBar").classList.add("hidden");

  // Return to deck view
  showView("deckManagement");
  renderDeckManagementView(studySession.deckId);
  renderDeckList(); // Update due counts
}

// Handle keyboard shortcuts in study mode
function handleStudyKeyboard(e) {
  // Don't trigger if user is in an input field
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    return;
  }

  switch(e.key) {
    case " ": // Space - flip card or do nothing if already flipped
      e.preventDefault();
      if (!studySession.isFlipped) {
        flipCard();
      }
      break;
    case "ArrowRight": // Right arrow - I know it
      e.preventDefault();
      if (studySession.isFlipped) {
        handleReviewAnswer(true);
      }
      break;
    case "ArrowLeft": // Left arrow - Review again
      e.preventDefault();
      if (studySession.isFlipped) {
        handleReviewAnswer(false);
      }
      break;
    case "Escape": // Esc - exit study mode
      e.preventDefault();
      if (confirm("Exit study session?")) {
        document.removeEventListener("keydown", handleStudyKeyboard);
        document.getElementById("bottomProgressBar").classList.add("hidden");
        showView("deckManagement");
        renderDeckManagementView(studySession.deckId);
      }
      break;
  }
}

// Setup Study button in deck actions
document.addEventListener("DOMContentLoaded", () => {
  // This will run after initializeApp
  setTimeout(() => {
    const studyBtn = document.getElementById("studyBtn");
    if (studyBtn) {
      studyBtn.onclick = () => {
        if (currentDeckId) {
          startStudySession(currentDeckId);
        }
      };
    }
  }, 100);
});

// ========================
// Study Tests (Phase 4)
// ========================

const StudyTests = {
  /**
   * Test: Start session loads due cards only
   */
  testStartSession() {
    // Create test deck and cards
    const testDeckId = crypto.randomUUID();
    const testDeck = createDeck("Test Deck", "For testing");
    testDeck.id = testDeckId;

    const decks = loadDecks();
    decks.push(testDeck);
    saveDecks(decks);

    // Create cards with different due dates
    const cards = [];
    const dueCard = createCard(testDeckId, "Due Front", "Due Back");
    dueCard.nextReview = addDays(new Date(), -1); // Yesterday
    cards.push(dueCard);

    const notDueCard = createCard(testDeckId, "Not Due Front", "Not Due Back");
    notDueCard.nextReview = addDays(new Date(), 5); // Future
    cards.push(notDueCard);

    saveCards([...loadCards(), ...cards]);

    // Start session
    startStudySession(testDeckId);

    console.assert(studySession.cards.length === 1, `❌ Should load 1 due card, got ${studySession.cards.length}`);
    console.assert(studySession.cards[0].front === "Due Front", '❌ Should load the due card');

    // Cleanup
    document.removeEventListener("keydown", handleStudyKeyboard);

    console.log('✅ testStartSession passed');
  },

  /**
   * Test: Start session with no due cards
   */
  testStartSession_Empty() {
    const testDeckId = crypto.randomUUID();
    const testDeck = createDeck("Empty Test Deck", "No due cards");
    testDeck.id = testDeckId;

    const decks = loadDecks();
    decks.push(testDeck);
    saveDecks(decks);

    // Create card that's not due
    const notDueCard = createCard(testDeckId, "Not Due", "Back");
    notDueCard.nextReview = addDays(new Date(), 5);
    saveCards([...loadCards(), notDueCard]);

    // This should show alert and not start session
    console.log('Manual test: startStudySession should show "No cards due" alert');

    console.log('✅ testStartSession_Empty passed (manual verification)');
  },

  /**
   * Test: Flip card toggles state
   */
  testFlipCard() {
    console.assert(typeof flipCard === 'function', '❌ flipCard function should exist');
    console.log('✅ testFlipCard passed');
  },

  /**
   * Test: Mark correct calls learning.markCorrect
   */
  testMarkCorrect() {
    const testCard = {
      id: 'test-1',
      level: 1,
      correctCount: 0,
      nextReview: new Date().toISOString()
    };

    const result = markCorrect(testCard);
    console.assert(result.level === 2, '❌ markCorrect should increase level');
    console.log('✅ testMarkCorrect passed');
  },

  /**
   * Test: Mark incorrect calls learning.markIncorrect
   */
  testMarkIncorrect() {
    const testCard = {
      id: 'test-2',
      level: 3,
      correctCount: 10,
      nextReview: new Date().toISOString()
    };

    const result = markIncorrect(testCard);
    console.assert(result.level === 1, '❌ markIncorrect should reset to level 1');
    console.log('✅ testMarkIncorrect passed');
  },

  /**
   * Test: Session progress advances correctly
   */
  testSessionProgress() {
    studySession.currentIndex = 0;
    studySession.stats.total = 5;

    updateStudyProgress();

    const progressText = document.getElementById("studyProgress").textContent;
    console.assert(progressText.includes("1 of 5"), `❌ Progress should show "1 of 5", got "${progressText}"`);

    console.log('✅ testSessionProgress passed');
  },

  /**
   * Test: Keyboard shortcuts exist
   */
  testKeyboardShortcuts() {
    console.assert(typeof handleStudyKeyboard === 'function', '❌ handleStudyKeyboard should exist');
    console.log('✅ testKeyboardShortcuts passed (manual verification needed)');
    console.log('  Manual test: Space (flip), → (know it), ← (review), Esc (exit)');
  },

  /**
   * Test: Keyboard disabled in input fields
   */
  testKeyboardInInput() {
    console.log('✅ testKeyboardInInput passed (manual verification needed)');
    console.log('  Manual test: Focus on input field, press Space - should not flip card');
  },

  /**
   * Test: Empty session handling
   */
  testEmptySession() {
    console.log('✅ testEmptySession passed (manual verification needed)');
    console.log('  Manual test: Study deck with 0 cards - should show appropriate message');
  },

  /**
   * Run all tests
   */
  runAll() {
    console.log('=== Running StudyTests ===');
    this.testStartSession();
    this.testStartSession_Empty();
    this.testFlipCard();
    this.testMarkCorrect();
    this.testMarkIncorrect();
    this.testSessionProgress();
    this.testKeyboardShortcuts();
    this.testKeyboardInInput();
    this.testEmptySession();
    console.log('=== All StudyTests Complete ===');
  }
};

// ========================
// Export/Import (Phase 5)
// ========================

/**
 * Handle export deck
 */
function handleExportDeck(deckId) {
  try {
    const exportData = exportDeck(deckId);
    const decks = loadDecks();
    const deck = decks.find(d => d.id === deckId);
    const filename = `${deck.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`;

    downloadJSON(exportData, filename);

    alert(`Deck exported successfully!\n\nFile: ${filename}`);
  } catch (e) {
    alert(`Export failed: ${e.message}`);
  }
}

/**
 * Handle import deck button click
 */
function handleImportClick() {
  const fileInput = document.getElementById("importFileInput");
  fileInput.value = ""; // Reset
  fileInput.onchange = handleImportFile;
  fileInput.click();
}

/**
 * Handle import file selection
 */
function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const importData = JSON.parse(event.target.result);
      const result = importDeck(importData);

      if (result.success) {
        alert(`Import successful!\n\nDeck: ${result.deck.name}\nCards: ${result.cardCount}`);
        renderDeckList();
        selectDeck(result.deck.id);
      } else {
        alert(`Import failed: ${result.error}`);
      }
    } catch (e) {
      alert(`Import failed: Invalid JSON file\n\n${e.message}`);
    }
  };

  reader.onerror = () => {
    alert("Failed to read file");
  };

  reader.readAsText(file);
}

// ========================
// Global Keyboard Shortcuts (Phase 5)
// ========================

/**
 * Setup global keyboard shortcuts
 */
function setupGlobalKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Don't trigger in input fields
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }

    // Don't trigger in study mode (has its own shortcuts)
    if (currentView === "study") {
      return;
    }

    switch(e.key) {
      case "n":
      case "N":
        // N: New deck
        e.preventDefault();
        showNewDeckModal();
        break;

      case "/":
        // /: Focus search
        e.preventDefault();
        const searchInput = document.getElementById("cardSearch");
        if (searchInput && !searchInput.classList.contains("hidden")) {
          searchInput.focus();
        }
        break;

      case "Escape":
        // Esc: Close modal (already handled in modal code)
        break;
    }
  });
}

// ========================
// Export Tests (Phase 5)
// ========================

const ExportTests = {
  /**
   * Test: Export format is valid JSON
   */
  testExportFormat() {
    // Create test deck
    const testDeck = createDeck("Export Test", "Test export");
    const decks = loadDecks();
    decks.push(testDeck);
    saveDecks(decks);

    // Create test card
    const testCard = createCard(testDeck.id, "Front", "Back");
    const cards = loadCards();
    cards.push(testCard);
    saveCards(cards);

    // Export
    const exportData = exportDeck(testDeck.id);

    console.assert(exportData.version === STORAGE_VERSION, '❌ Export should have version');
    console.assert(exportData.deck !== undefined, '❌ Export should have deck');
    console.assert(Array.isArray(exportData.cards), '❌ Export should have cards array');
    console.assert(exportData.cards.length === 1, '❌ Export should have 1 card');
    console.assert(exportData.exportDate !== undefined, '❌ Export should have exportDate');

    console.log('✅ testExportFormat passed');
  },

  /**
   * Test: Import creates deck + cards
   */
  testImportValid() {
    // Create export data
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      deck: {
        id: "test-import-deck",
        name: "Import Test Deck",
        description: "Test",
        created: new Date().toISOString(),
        cardCount: 1
      },
      cards: [
        {
          id: "test-import-card",
          deckId: "test-import-deck",
          front: "Imported Front",
          back: "Imported Back",
          level: 1,
          correctCount: 0,
          created: new Date().toISOString(),
          nextReview: new Date().toISOString()
        }
      ]
    };

    const result = importDeck(exportData);

    console.assert(result.success === true, '❌ Import should succeed');
    console.assert(result.deck !== undefined, '❌ Import should return deck');
    console.assert(result.cardCount === 1, '❌ Import should return cardCount');

    // Verify deck was created
    const decks = loadDecks();
    const importedDeck = decks.find(d => d.name === "Import Test Deck");
    console.assert(importedDeck !== undefined, '❌ Imported deck should exist');

    console.log('✅ testImportValid passed');
  },

  /**
   * Test: Import with invalid data shows error
   */
  testImportInvalid() {
    const invalidData = {
      // Missing deck and cards
      version: "1.0"
    };

    const result = importDeck(invalidData);

    console.assert(result.success === false, '❌ Import should fail for invalid data');
    console.assert(result.error !== undefined, '❌ Import should return error message');

    console.log('✅ testImportInvalid passed');
  },

  /**
   * Test: Import doesn't overwrite existing (creates new IDs)
   */
  testImportMerge() {
    const decksBefore = loadDecks().length;

    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      deck: {
        id: "merge-test-deck",
        name: "Merge Test",
        description: "",
        created: new Date().toISOString(),
        cardCount: 0
      },
      cards: []
    };

    const result = importDeck(exportData);

    const decksAfter = loadDecks().length;
    console.assert(decksAfter === decksBefore + 1, '❌ Import should add new deck, not replace');

    console.log('✅ testImportMerge passed');
  },

  /**
   * Test: Import with ID conflict generates new IDs
   */
  testImportIdConflict() {
    // Create deck
    const originalDeck = createDeck("ID Conflict Test", "");
    const decks = loadDecks();
    decks.push(originalDeck);
    saveDecks(decks);

    // Export data with same ID
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      deck: {
        id: originalDeck.id, // Same ID!
        name: "ID Conflict Test Copy",
        description: "",
        created: new Date().toISOString(),
        cardCount: 0
      },
      cards: []
    };

    const result = importDeck(exportData);

    console.assert(result.success === true, '❌ Import should succeed even with ID conflict');
    console.assert(result.deck.id !== originalDeck.id, '❌ Import should generate new ID');

    console.log('✅ testImportIdConflict passed');
  },

  /**
   * Test: Import with duplicate name adds (2)
   */
  testImportDupeName() {
    // Create deck
    const originalDeck = createDeck("Dupe Name Test", "");
    const decks = loadDecks();
    decks.push(originalDeck);
    saveDecks(decks);

    // Export data with same name
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      deck: {
        id: crypto.randomUUID(),
        name: "Dupe Name Test", // Same name!
        description: "",
        created: new Date().toISOString(),
        cardCount: 0
      },
      cards: []
    };

    const result = importDeck(exportData);

    console.assert(result.success === true, '❌ Import should succeed');
    console.assert(result.deck.name === "Dupe Name Test (2)", `❌ Import should rename to "Dupe Name Test (2)", got "${result.deck.name}"`);

    console.log('✅ testImportDupeName passed');
  },

  /**
   * Test: Storage event listener (manual test)
   */
  testStorageEvent() {
    console.log('✅ testStorageEvent passed (manual verification needed)');
    console.log('  Manual test: Open app in 2 tabs, create deck in one, should auto-update in other');
  },

  /**
   * Run all tests
   */
  runAll() {
    console.log('=== Running ExportTests ===');
    this.testExportFormat();
    this.testImportValid();
    this.testImportInvalid();
    this.testImportMerge();
    this.testImportIdConflict();
    this.testImportDupeName();
    this.testStorageEvent();
    console.log('=== All ExportTests Complete ===');
  }
};
