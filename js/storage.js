// Storage Module
// Handles LocalStorage operations with error handling and quota management

const STORAGE_VERSION = "1.0";
const STORAGE_KEY = "flashcard_app_data";

// Check if LocalStorage is available
function isLocalStorageAvailable() {
  try {
    const test = "__test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// Get storage usage (returns percentage 0-100)
function getStorageUsage() {
  if (!isLocalStorageAvailable()) return 0;

  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }

    // Estimate 5MB quota (typical for LocalStorage)
    const quota = 5 * 1024 * 1024;
    const percentage = (total / quota) * 100;

    // Warn at 80%, error at 95%
    if (percentage >= 95) {
      console.error("LocalStorage quota almost full (>95%)!");
    } else if (percentage >= 80) {
      console.warn("LocalStorage quota high (>80%)");
    }

    return percentage;
  } catch (e) {
    console.error("Failed to calculate storage usage:", e);
    return 0;
  }
}

// Load all data from LocalStorage
function loadData() {
  if (!isLocalStorageAvailable()) {
    console.warn("LocalStorage not available");
    return { version: STORAGE_VERSION, decks: [], cards: [], settings: {} };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { version: STORAGE_VERSION, decks: [], cards: [], settings: {} };
    }

    const parsed = JSON.parse(data);

    // Ensure version exists
    if (!parsed.version) {
      parsed.version = STORAGE_VERSION;
    }

    // Ensure arrays exist
    if (!Array.isArray(parsed.decks)) parsed.decks = [];
    if (!Array.isArray(parsed.cards)) parsed.cards = [];
    if (!parsed.settings) parsed.settings = {};

    return parsed;
  } catch (e) {
    console.error("Failed to parse LocalStorage data:", e);
    // Return empty structure on corrupted data
    return { version: STORAGE_VERSION, decks: [], cards: [], settings: {} };
  }
}

// Save all data to LocalStorage
function saveData(data) {
  if (!isLocalStorageAvailable()) {
    console.error("LocalStorage not available");
    return false;
  }

  try {
    // Ensure version
    data.version = STORAGE_VERSION;

    const json = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, json);

    // Check quota after save
    getStorageUsage();

    return true;
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      console.error("LocalStorage quota exceeded!");
      alert("Storage quota exceeded. Please delete some decks or cards.");
    } else {
      console.error("Failed to save to LocalStorage:", e);
    }
    return false;
  }
}

// Load decks
function loadDecks() {
  const data = loadData();
  return data.decks || [];
}

// Save decks
function saveDecks(decks) {
  const data = loadData();
  data.decks = decks;
  return saveData(data);
}

// Load cards
function loadCards() {
  const data = loadData();
  return data.cards || [];
}

// Save cards
function saveCards(cards) {
  const data = loadData();
  data.cards = cards;
  return saveData(data);
}

// Load settings
function loadSettings() {
  const data = loadData();
  return data.settings || {
    darkMode: true,
    sessionLimit: 20,
    autoShuffle: false
  };
}

// Save settings
function saveSettings(settings) {
  const data = loadData();
  data.settings = settings;
  return saveData(data);
}

// Export Tests
const StorageTests = {
  runAll() {
    console.log("=== Running Storage Tests ===");
    this.testLocalStorageAvailable();
    this.testSaveLoadDecks();
    this.testSaveLoadCards();
    this.testCorruptedData();
    this.testStorageUsage();
    console.log("=== Storage Tests Complete ===");
  },

  testLocalStorageAvailable() {
    const available = isLocalStorageAvailable();
    console.assert(available === true, "LocalStorage should be available");
    console.log("✓ testLocalStorageAvailable");
  },

  testSaveLoadDecks() {
    const testDecks = [
      { id: "test1", name: "Test Deck", description: "Test", created: new Date().toISOString(), cardCount: 0 }
    ];

    saveDecks(testDecks);
    const loaded = loadDecks();

    console.assert(loaded.length === 1, "Should load 1 deck");
    console.assert(loaded[0].name === "Test Deck", "Deck name should match");
    console.log("✓ testSaveLoadDecks");

    // Cleanup
    saveDecks([]);
  },

  testSaveLoadCards() {
    const testCards = [
      { id: "card1", deckId: "deck1", front: "Q", back: "A", level: 1, created: new Date().toISOString() }
    ];

    saveCards(testCards);
    const loaded = loadCards();

    console.assert(loaded.length === 1, "Should load 1 card");
    console.assert(loaded[0].front === "Q", "Card front should match");
    console.log("✓ testSaveLoadCards");

    // Cleanup
    saveCards([]);
  },

  testCorruptedData() {
    // Corrupt data
    if (isLocalStorageAvailable()) {
      localStorage.setItem(STORAGE_KEY, "{ invalid json }");
    }

    const loaded = loadDecks();
    console.assert(Array.isArray(loaded), "Should return empty array on corrupted data");
    console.assert(loaded.length === 0, "Should return empty array");
    console.log("✓ testCorruptedData");

    // Cleanup
    saveDecks([]);
  },

  testStorageUsage() {
    const usage = getStorageUsage();
    console.assert(typeof usage === "number", "Usage should be a number");
    console.assert(usage >= 0 && usage <= 100, "Usage should be 0-100%");
    console.log("✓ testStorageUsage:", usage.toFixed(2) + "%");
  }
};
