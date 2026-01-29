// Cards Module
// Handles card CRUD operations

// Create a new card
function createCard(deckId, front, back) {
  return {
    id: crypto.randomUUID(),
    deckId: deckId,
    front: front.trim(),
    back: back.trim(),
    level: 1,
    correctCount: 0,
    lastReviewed: null,
    nextReview: new Date().toISOString(), // Due immediately
    created: new Date().toISOString()
  };
}

// Validate card (front and back required, trim whitespace)
function validateCard(front, back) {
  const trimmedFront = front.trim();
  const trimmedBack = back.trim();

  if (!trimmedFront) {
    return { valid: false, error: "Front cannot be empty" };
  }

  if (!trimmedBack) {
    return { valid: false, error: "Back cannot be empty" };
  }

  return { valid: true };
}

// Get card by ID
function getCard(id, cards) {
  return cards.find(card => card.id === id);
}

// Get cards by deck ID
function getCardsByDeck(deckId, cards) {
  return cards.filter(card => card.deckId === deckId);
}

// Update card (preserves id, created, level, dates)
function updateCard(id, updates, cards) {
  const card = getCard(id, cards);
  if (!card) return null;

  // Preserve critical fields
  return {
    ...card,
    ...updates,
    id: card.id,
    created: card.created,
    level: card.level,
    correctCount: card.correctCount,
    lastReviewed: card.lastReviewed,
    nextReview: card.nextReview,
    // Trim string updates
    front: updates.front !== undefined ? updates.front.trim() : card.front,
    back: updates.back !== undefined ? updates.back.trim() : card.back
  };
}

// Delete card (returns new cards array)
function deleteCard(id, cards) {
  return cards.filter(card => card.id !== id);
}

// Delete cards by deck ID (CASCADE)
function deleteCardsByDeckId(deckId, cards) {
  return cards.filter(card => card.deckId !== deckId);
}

// Search cards (matches front + back, case-insensitive)
function searchCards(cards, query) {
  if (!query || !query.trim()) return cards;

  const lowerQuery = query.toLowerCase();
  return cards.filter(card =>
    card.front.toLowerCase().includes(lowerQuery) ||
    card.back.toLowerCase().includes(lowerQuery)
  );
}

// Filter cards by level
function filterCardsByLevel(cards, level) {
  if (!level || level === "all") return cards;

  if (level === "due") {
    const now = new Date();
    return cards.filter(card => new Date(card.nextReview) <= now);
  }

  return cards.filter(card => card.level === parseInt(level));
}

// Get level display (stars)
function getLevelDisplay(level) {
  const stars = "⭐".repeat(level);
  const labels = { 1: "Learning", 2: "Review", 3: "Mastered" };
  return `${stars} ${labels[level] || ""}`;
}

// Debounce utility (for search)
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Card Tests
const CardTests = {
  runAll() {
    console.log("=== Running Card Tests ===");
    this.testCreateCard();
    this.testValidateCard();
    this.testValidateCardTrim();
    this.testUpdateCard();
    this.testDeleteCard();
    this.testDeleteByDeckId();
    this.testGetByDeck();
    this.testSearchCards();
    this.testFilterByLevel();
    console.log("=== Card Tests Complete ===");
  },

  testCreateCard() {
    const card = createCard("deck1", "Question", "Answer");

    console.assert(card.id, "Card should have an ID");
    console.assert(card.deckId === "deck1", "Deck ID should match");
    console.assert(card.front === "Question", "Front should match");
    console.assert(card.back === "Answer", "Back should match");
    console.assert(card.level === 1, "Level should be 1");
    console.assert(card.correctCount === 0, "Correct count should be 0");
    console.assert(card.lastReviewed === null, "Last reviewed should be null");
    console.assert(card.nextReview, "Next review should be set");
    console.assert(card.created, "Created timestamp should exist");
    console.log("✓ testCreateCard");
  },

  testValidateCard() {
    // Empty front
    let result = validateCard("", "Answer");
    console.assert(result.valid === false, "Empty front should be invalid");

    // Empty back
    result = validateCard("Question", "");
    console.assert(result.valid === false, "Empty back should be invalid");

    // Whitespace only
    result = validateCard("   ", "Answer");
    console.assert(result.valid === false, "Whitespace-only front should be invalid");

    result = validateCard("Question", "   ");
    console.assert(result.valid === false, "Whitespace-only back should be invalid");

    // Valid
    result = validateCard("Question", "Answer");
    console.assert(result.valid === true, "Valid card should pass");

    console.log("✓ testValidateCard");
  },

  testValidateCardTrim() {
    const card = createCard("deck1", "  Question  ", "  Answer  ");
    console.assert(card.front === "Question", "Front should be trimmed");
    console.assert(card.back === "Answer", "Back should be trimmed");
    console.log("✓ testValidateCardTrim");
  },

  testUpdateCard() {
    let cards = [createCard("deck1", "Original Front", "Original Back")];
    const originalId = cards[0].id;
    const originalCreated = cards[0].created;
    const originalLevel = cards[0].level;

    const updated = updateCard(originalId, { front: "Updated Front" }, cards);

    console.assert(updated.id === originalId, "ID should be preserved");
    console.assert(updated.created === originalCreated, "Created should be preserved");
    console.assert(updated.level === originalLevel, "Level should be preserved");
    console.assert(updated.front === "Updated Front", "Front should be updated");
    console.assert(updated.back === "Original Back", "Back should be unchanged");

    console.log("✓ testUpdateCard");
  },

  testDeleteCard() {
    let cards = [
      createCard("deck1", "Q1", "A1"),
      createCard("deck1", "Q2", "A2"),
      createCard("deck1", "Q3", "A3")
    ];

    const idToDelete = cards[1].id;
    cards = deleteCard(idToDelete, cards);

    console.assert(cards.length === 2, "Should have 2 cards after delete");
    console.assert(!cards.find(c => c.id === idToDelete), "Deleted card should not exist");

    console.log("✓ testDeleteCard");
  },

  testDeleteByDeckId() {
    let cards = [
      createCard("deck1", "Q1", "A1"),
      createCard("deck1", "Q2", "A2"),
      createCard("deck2", "Q3", "A3"),
      createCard("deck2", "Q4", "A4")
    ];

    cards = deleteCardsByDeckId("deck1", cards);

    console.assert(cards.length === 2, "Should have 2 cards after CASCADE delete");
    console.assert(cards.every(c => c.deckId === "deck2"), "Only deck2 cards should remain");

    console.log("✓ testDeleteByDeckId");
  },

  testGetByDeck() {
    const cards = [
      createCard("deck1", "Q1", "A1"),
      createCard("deck1", "Q2", "A2"),
      createCard("deck2", "Q3", "A3")
    ];

    const deck1Cards = getCardsByDeck("deck1", cards);

    console.assert(deck1Cards.length === 2, "Should get 2 cards for deck1");
    console.assert(deck1Cards.every(c => c.deckId === "deck1"), "All cards should be from deck1");

    console.log("✓ testGetByDeck");
  },

  testSearchCards() {
    const cards = [
      createCard("deck1", "Hello World", "안녕하세요"),
      createCard("deck1", "Goodbye", "안녕히 가세요"),
      createCard("deck1", "Thank you", "감사합니다")
    ];

    // Search front
    let results = searchCards(cards, "hello");
    console.assert(results.length === 1, "Should find 1 card with 'hello'");

    // Search back
    results = searchCards(cards, "안녕");
    console.assert(results.length === 2, "Should find 2 cards with '안녕'");

    // No match
    results = searchCards(cards, "xyz");
    console.assert(results.length === 0, "Should find 0 cards");

    // Empty query
    results = searchCards(cards, "");
    console.assert(results.length === 3, "Empty query should return all");

    console.log("✓ testSearchCards");
  },

  testFilterByLevel() {
    const cards = [
      createCard("deck1", "Q1", "A1"),
      createCard("deck1", "Q2", "A2"),
      createCard("deck1", "Q3", "A3")
    ];

    // Manually set levels
    cards[0].level = 1;
    cards[1].level = 2;
    cards[2].level = 3;

    // Filter level 1
    let results = filterCardsByLevel(cards, 1);
    console.assert(results.length === 1, "Should find 1 level 1 card");

    // Filter level 2
    results = filterCardsByLevel(cards, 2);
    console.assert(results.length === 1, "Should find 1 level 2 card");

    // Filter all
    results = filterCardsByLevel(cards, "all");
    console.assert(results.length === 3, "Should return all cards");

    console.log("✓ testFilterByLevel");
  }
};
