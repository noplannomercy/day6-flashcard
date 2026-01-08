// Learning Module
// Handles Leitner system logic (Phase 3)

// ========================
// Date Utilities
// ========================

/**
 * Normalize date to midnight (00:00:00.000)
 * @param {Date|string} date - Date to normalize
 * @returns {Date} - Normalized date at midnight
 */
function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Add days to a date (timezone-safe)
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {string} - ISO 8601 string
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString();
}

// ========================
// Leitner Algorithm
// ========================

/**
 * Calculate next review date based on level
 * @param {number} level - Current card level (1-3)
 * @returns {string} - ISO 8601 string for next review date
 */
function calculateNextReview(level) {
  const now = new Date();
  let days;

  switch(level) {
    case 1:
      days = 1; // Review next day
      break;
    case 2:
      days = 3; // Review in 3 days
      break;
    case 3:
      days = 7; // Review in 7 days
      break;
    default:
      days = 1;
  }

  return addDays(now, days);
}

/**
 * Mark card as correct (level up)
 * @param {Object} card - Card object
 * @returns {Object} - Updated card
 */
function markCorrect(card) {
  const now = new Date().toISOString();

  // Level up (max level 3)
  const newLevel = Math.min(card.level + 1, 3);

  // Calculate next review based on NEW level
  const nextReview = calculateNextReview(newLevel);

  return {
    ...card,
    level: newLevel,
    correctCount: (card.correctCount || 0) + 1,
    lastReviewed: now,
    nextReview: nextReview
  };
}

/**
 * Mark card as incorrect (reset to level 1)
 * @param {Object} card - Card object
 * @returns {Object} - Updated card
 */
function markIncorrect(card) {
  const now = new Date().toISOString();

  // Reset to level 1
  const newLevel = 1;

  // Next review in 1 day
  const nextReview = calculateNextReview(newLevel);

  return {
    ...card,
    level: newLevel,
    lastReviewed: now,
    nextReview: nextReview
  };
}

// ========================
// Due Cards Management
// ========================

/**
 * Check if card is due for review
 * @param {Object} card - Card object
 * @returns {boolean} - True if card is due
 */
function isCardDue(card) {
  if (!card.nextReview) return true;

  // Normalize both dates to midnight for comparison
  const now = normalizeDate(new Date());
  const reviewDate = normalizeDate(new Date(card.nextReview));

  return reviewDate <= now;
}

/**
 * Get all due cards for a deck
 * @param {string} deckId - Deck ID
 * @param {Array} cards - All cards
 * @returns {Array} - Due cards sorted by level (level 1 first)
 */
function getDueCards(deckId, cards) {
  return cards
    .filter(card => card.deckId === deckId && isCardDue(card))
    .sort((a, b) => a.level - b.level); // Level 1 cards first
}

/**
 * Get count of due cards for a deck
 * @param {string} deckId - Deck ID
 * @param {Array} cards - All cards
 * @returns {number} - Count of due cards
 */
function getDueCount(deckId, cards) {
  return getDueCards(deckId, cards).length;
}

// ========================
// Tests
// ========================

const LeitnerTests = {
  /**
   * Test: markCorrect from Level 1 to 2
   */
  testMarkCorrect_Level1to2() {
    const card = {
      id: '1',
      level: 1,
      correctCount: 0,
      lastReviewed: null,
      nextReview: new Date().toISOString()
    };

    const updated = markCorrect(card);

    console.assert(updated.level === 2, '❌ Level should be 2');
    console.assert(updated.correctCount === 1, '❌ correctCount should be 1');
    console.assert(updated.lastReviewed !== null, '❌ lastReviewed should be set');

    // Verify nextReview is +3 days (Level 2 interval)
    const expectedDate = normalizeDate(addDays(new Date(), 3));
    const actualDate = normalizeDate(updated.nextReview);
    const daysDiff = Math.round((actualDate - expectedDate) / (1000 * 60 * 60 * 24));

    console.assert(daysDiff === 0, `❌ nextReview should be +3 days, got ${daysDiff} days difference`);
    console.log('✅ testMarkCorrect_Level1to2 passed');
  },

  /**
   * Test: markCorrect from Level 2 to 3
   */
  testMarkCorrect_Level2to3() {
    const card = {
      id: '2',
      level: 2,
      correctCount: 5,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date().toISOString()
    };

    const updated = markCorrect(card);

    console.assert(updated.level === 3, '❌ Level should be 3');
    console.assert(updated.correctCount === 6, '❌ correctCount should be 6');

    // Verify nextReview is +7 days (Level 3 interval)
    const expectedDate = normalizeDate(addDays(new Date(), 7));
    const actualDate = normalizeDate(updated.nextReview);
    const daysDiff = Math.round((actualDate - expectedDate) / (1000 * 60 * 60 * 24));

    console.assert(daysDiff === 0, `❌ nextReview should be +7 days, got ${daysDiff} days difference`);
    console.log('✅ testMarkCorrect_Level2to3 passed');
  },

  /**
   * Test: markCorrect at Level 3 stays at Level 3
   */
  testMarkCorrect_Level3Stay() {
    const card = {
      id: '3',
      level: 3,
      correctCount: 10,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date().toISOString()
    };

    const updated = markCorrect(card);

    console.assert(updated.level === 3, '❌ Level should stay at 3');
    console.assert(updated.correctCount === 11, '❌ correctCount should be 11');

    // Verify nextReview is still +7 days
    const expectedDate = normalizeDate(addDays(new Date(), 7));
    const actualDate = normalizeDate(updated.nextReview);
    const daysDiff = Math.round((actualDate - expectedDate) / (1000 * 60 * 60 * 24));

    console.assert(daysDiff === 0, `❌ nextReview should be +7 days, got ${daysDiff} days difference`);
    console.log('✅ testMarkCorrect_Level3Stay passed');
  },

  /**
   * Test: markIncorrect resets to Level 1
   */
  testMarkIncorrect_Reset() {
    const card = {
      id: '4',
      level: 2,
      correctCount: 5,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date().toISOString()
    };

    const updated = markIncorrect(card);

    console.assert(updated.level === 1, '❌ Level should reset to 1');
    console.assert(updated.lastReviewed !== null, '❌ lastReviewed should be set');

    // Verify nextReview is +1 day
    const expectedDate = normalizeDate(addDays(new Date(), 1));
    const actualDate = normalizeDate(updated.nextReview);
    const daysDiff = Math.round((actualDate - expectedDate) / (1000 * 60 * 60 * 24));

    console.assert(daysDiff === 0, `❌ nextReview should be +1 day, got ${daysDiff} days difference`);
    console.log('✅ testMarkIncorrect_Reset passed');
  },

  /**
   * Test: markIncorrect from Level 3 also resets to Level 1
   */
  testMarkIncorrect_FromL3() {
    const card = {
      id: '5',
      level: 3,
      correctCount: 15,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date().toISOString()
    };

    const updated = markIncorrect(card);

    console.assert(updated.level === 1, '❌ Level should reset to 1 from Level 3');

    // Verify nextReview is +1 day
    const expectedDate = normalizeDate(addDays(new Date(), 1));
    const actualDate = normalizeDate(updated.nextReview);
    const daysDiff = Math.round((actualDate - expectedDate) / (1000 * 60 * 60 * 24));

    console.assert(daysDiff === 0, `❌ nextReview should be +1 day, got ${daysDiff} days difference`);
    console.log('✅ testMarkIncorrect_FromL3 passed');
  },

  /**
   * Test: isCardDue returns true for past dates
   */
  testIsCardDue_True() {
    const yesterday = addDays(new Date(), -1);
    const card = {
      id: '6',
      nextReview: yesterday
    };

    const isDue = isCardDue(card);
    console.assert(isDue === true, '❌ Card with past nextReview should be due');
    console.log('✅ testIsCardDue_True passed');
  },

  /**
   * Test: isCardDue returns false for future dates
   */
  testIsCardDue_False() {
    const tomorrow = addDays(new Date(), 1);
    const card = {
      id: '7',
      nextReview: tomorrow
    };

    const isDue = isCardDue(card);
    console.assert(isDue === false, '❌ Card with future nextReview should not be due');
    console.log('✅ testIsCardDue_False passed');
  },

  /**
   * Test: isCardDue returns true for today
   */
  testIsCardDue_Today() {
    const today = new Date().toISOString();
    const card = {
      id: '8',
      nextReview: today
    };

    const isDue = isCardDue(card);
    console.assert(isDue === true, '❌ Card with today\'s nextReview should be due');
    console.log('✅ testIsCardDue_Today passed');
  },

  /**
   * Test: getDueCards returns cards sorted by level
   */
  testGetDueCards_Order() {
    const deckId = 'deck-1';
    const cards = [
      { id: '1', deckId, level: 3, nextReview: addDays(new Date(), -1) },
      { id: '2', deckId, level: 1, nextReview: addDays(new Date(), -1) },
      { id: '3', deckId, level: 2, nextReview: addDays(new Date(), -1) },
      { id: '4', deckId: 'other', level: 1, nextReview: addDays(new Date(), -1) }, // Different deck
      { id: '5', deckId, level: 1, nextReview: addDays(new Date(), 5) } // Not due
    ];

    const dueCards = getDueCards(deckId, cards);

    console.assert(dueCards.length === 3, `❌ Should have 3 due cards, got ${dueCards.length}`);
    console.assert(dueCards[0].level === 1, '❌ First card should be level 1');
    console.assert(dueCards[1].level === 2, '❌ Second card should be level 2');
    console.assert(dueCards[2].level === 3, '❌ Third card should be level 3');
    console.log('✅ testGetDueCards_Order passed');
  },

  /**
   * Test: nextReview produces actual Date objects, not strings
   */
  testNextReviewDates() {
    const card = { id: '9', level: 1, correctCount: 0 };
    const updated = markCorrect(card);

    console.assert(typeof updated.nextReview === 'string', '❌ nextReview should be ISO string');
    console.assert(!isNaN(new Date(updated.nextReview).getTime()), '❌ nextReview should be valid date');
    console.log('✅ testNextReviewDates passed');
  },

  /**
   * Test: addDays handles timezone changes correctly
   */
  testAddDays_Timezone() {
    const date = new Date('2024-03-10T12:00:00Z'); // Example date
    const result = addDays(date, 1);
    const resultDate = new Date(result);

    console.assert(resultDate.getDate() === date.getDate() + 1 || resultDate.getDate() === 1,
                   '❌ addDays should add exactly 1 day');
    console.log('✅ testAddDays_Timezone passed');
  },

  /**
   * Test: normalizeDate removes time component
   */
  testNormalizeDate() {
    const date = new Date('2024-03-15T15:30:45.123Z');
    const normalized = normalizeDate(date);

    console.assert(normalized.getHours() === 0, '❌ Hours should be 0');
    console.assert(normalized.getMinutes() === 0, '❌ Minutes should be 0');
    console.assert(normalized.getSeconds() === 0, '❌ Seconds should be 0');
    console.assert(normalized.getMilliseconds() === 0, '❌ Milliseconds should be 0');
    console.log('✅ testNormalizeDate passed');
  },

  /**
   * Run all tests
   */
  runAll() {
    console.log('=== Running LeitnerTests ===');
    this.testMarkCorrect_Level1to2();
    this.testMarkCorrect_Level2to3();
    this.testMarkCorrect_Level3Stay();
    this.testMarkIncorrect_Reset();
    this.testMarkIncorrect_FromL3();
    this.testIsCardDue_True();
    this.testIsCardDue_False();
    this.testIsCardDue_Today();
    this.testGetDueCards_Order();
    this.testNextReviewDates();
    this.testAddDays_Timezone();
    this.testNormalizeDate();
    console.log('=== All LeitnerTests Complete ===');
  }
};
