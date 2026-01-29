// Decks Module
// Handles deck CRUD operations and validation

// Create a new deck
function createDeck(name, description = "") {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    description: description.trim(),
    created: new Date().toISOString(),
    cardCount: 0
  };
}

// Validate deck name (no duplicates, no empty)
function validateDeckName(name, existingDecks = [], excludeId = null) {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: "Deck name cannot be empty" };
  }

  // Check for duplicates (case-insensitive)
  const duplicate = existingDecks.find(deck =>
    deck.id !== excludeId &&
    deck.name.toLowerCase() === trimmed.toLowerCase()
  );

  if (duplicate) {
    return { valid: false, error: "A deck with this name already exists" };
  }

  return { valid: true };
}

// Get deck by ID
function getDeck(id, decks) {
  return decks.find(deck => deck.id === id);
}

// Update deck (preserves id, created, cardCount)
function updateDeck(id, updates, decks) {
  const deck = getDeck(id, decks);
  if (!deck) return null;

  // Preserve critical fields
  return {
    ...deck,
    ...updates,
    id: deck.id,
    created: deck.created,
    cardCount: deck.cardCount,
    // Trim string updates
    name: updates.name ? updates.name.trim() : deck.name,
    description: updates.description !== undefined ? updates.description.trim() : deck.description
  };
}

// Delete deck (returns new decks array)
function deleteDeck(id, decks) {
  return decks.filter(deck => deck.id !== id);
}

// Delete deck with CASCADE (also deletes cards)
function deleteDeckWithCards(deckId) {
  // Delete deck
  let decks = loadDecks();
  decks = deleteDeck(deckId, decks);
  saveDecks(decks);

  // Delete associated cards
  let cards = loadCards();
  cards = cards.filter(card => card.deckId !== deckId);
  saveCards(cards);

  return true;
}

// Get all decks with updated card counts
function getDecksWithCounts() {
  const decks = loadDecks();
  const cards = loadCards();

  return decks.map(deck => {
    const deckCards = cards.filter(card => card.deckId === deck.id);
    return {
      ...deck,
      cardCount: deckCards.length
    };
  });
}

// Update deck's card count
function updateDeckCardCount(deckId) {
  const decks = loadDecks();
  const cards = loadCards();

  const deck = getDeck(deckId, decks);
  if (!deck) return false;

  const cardCount = cards.filter(card => card.deckId === deckId).length;
  deck.cardCount = cardCount;

  saveDecks(decks);
  return true;
}

// Deck Tests
const DeckTests = {
  runAll() {
    console.log("=== Running Deck Tests ===");
    this.testCreateDeck();
    this.testValidateName();
    this.testValidateNameTrim();
    this.testUpdateDeck();
    this.testDeleteDeck();
    this.testDeleteDeckCascade();
    this.testStorageSaveLoad();
    console.log("=== Deck Tests Complete ===");
  },

  testCreateDeck() {
    const deck = createDeck("Test Deck", "Test Description");

    console.assert(deck.id, "Deck should have an ID");
    console.assert(deck.name === "Test Deck", "Deck name should match");
    console.assert(deck.description === "Test Description", "Description should match");
    console.assert(deck.cardCount === 0, "Card count should be 0");
    console.assert(deck.created, "Deck should have created timestamp");
    console.log("✓ testCreateDeck");
  },

  testValidateName() {
    const decks = [
      createDeck("Existing Deck")
    ];

    // Empty name
    let result = validateDeckName("", decks);
    console.assert(result.valid === false, "Empty name should be invalid");

    // Whitespace only
    result = validateDeckName("   ", decks);
    console.assert(result.valid === false, "Whitespace-only should be invalid");

    // Duplicate name
    result = validateDeckName("Existing Deck", decks);
    console.assert(result.valid === false, "Duplicate name should be invalid");

    // Valid unique name
    result = validateDeckName("New Deck", decks);
    console.assert(result.valid === true, "Unique name should be valid");

    console.log("✓ testValidateName");
  },

  testValidateNameTrim() {
    const decks = [];

    const result = validateDeckName("  Test Deck  ", decks);
    console.assert(result.valid === true, "Trimmed name should be valid");

    // Create with whitespace
    const deck = createDeck("  Spaced  ", "  Desc  ");
    console.assert(deck.name === "Spaced", "Name should be trimmed");
    console.assert(deck.description === "Desc", "Description should be trimmed");

    console.log("✓ testValidateNameTrim");
  },

  testUpdateDeck() {
    let decks = [createDeck("Original")];
    const originalId = decks[0].id;
    const originalCreated = decks[0].created;

    const updated = updateDeck(originalId, { name: "Updated" }, decks);

    console.assert(updated.id === originalId, "ID should be preserved");
    console.assert(updated.created === originalCreated, "Created should be preserved");
    console.assert(updated.name === "Updated", "Name should be updated");
    console.assert(updated.cardCount === 0, "Card count should be preserved");

    console.log("✓ testUpdateDeck");
  },

  testDeleteDeck() {
    let decks = [
      createDeck("Deck 1"),
      createDeck("Deck 2"),
      createDeck("Deck 3")
    ];

    const idToDelete = decks[1].id;
    decks = deleteDeck(idToDelete, decks);

    console.assert(decks.length === 2, "Should have 2 decks after delete");
    console.assert(!decks.find(d => d.id === idToDelete), "Deleted deck should not exist");

    console.log("✓ testDeleteDeck");
  },

  testDeleteDeckCascade() {
    // Setup: Create deck and cards
    const deck = createDeck("Test Deck");
    saveDecks([deck]);

    const card1 = { id: "c1", deckId: deck.id, front: "Q1", back: "A1" };
    const card2 = { id: "c2", deckId: deck.id, front: "Q2", back: "A2" };
    const card3 = { id: "c3", deckId: "other", front: "Q3", back: "A3" };
    saveCards([card1, card2, card3]);

    // Delete deck with cascade
    deleteDeckWithCards(deck.id);

    const decks = loadDecks();
    const cards = loadCards();

    console.assert(decks.length === 0, "Deck should be deleted");
    console.assert(cards.length === 1, "Only cards from other decks should remain");
    console.assert(cards[0].id === "c3", "Remaining card should be c3");

    console.log("✓ testDeleteDeckCascade");

    // Cleanup
    saveDecks([]);
    saveCards([]);
  },

  testStorageSaveLoad() {
    const deck1 = createDeck("Deck 1");
    const deck2 = createDeck("Deck 2");

    saveDecks([deck1, deck2]);
    const loaded = loadDecks();

    console.assert(loaded.length === 2, "Should load 2 decks");
    console.assert(loaded[0].name === "Deck 1", "First deck name should match");
    console.assert(loaded[1].name === "Deck 2", "Second deck name should match");

    console.log("✓ testStorageSaveLoad");

    // Cleanup
    saveDecks([]);
  }
};
