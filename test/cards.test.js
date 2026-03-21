/**
 * Tests for card CRUD, search, and filter (js/cards.js)
 */

beforeEach(() => {
  localStorage.clear()
})

let deckId

beforeEach(() => {
  const deck = createDeck('Test Deck', '')
  deckId = deck.id
})

describe('validateCard', () => {
  it('accepts valid card', () => {
    const result = validateCard('Front text', 'Back text')
    expect(result.valid).toBe(true)
  })

  it('rejects empty front', () => {
    const result = validateCard('', 'Answer')
    expect(result.valid).toBe(false)
  })

  it('rejects empty back', () => {
    const result = validateCard('Question', '')
    expect(result.valid).toBe(false)
  })

  it('rejects whitespace-only front', () => {
    const result = validateCard('   ', 'Answer')
    expect(result.valid).toBe(false)
  })
})

describe('createCard', () => {
  it('creates card with required fields', () => {
    const card = createCard(deckId, 'Capital of France?', 'Paris')
    expect(card.id).toBeTruthy()
    expect(card.deckId).toBe(deckId)
    expect(card.front).toBe('Capital of France?')
    expect(card.back).toBe('Paris')
    expect(card.level).toBe(1)
    expect(card.correctCount).toBe(0)
    expect(card.lastReviewed).toBeNull()
    expect(card.nextReview).toBeTruthy()
  })
})

describe('getCard / updateCard / deleteCard', () => {
  it('can retrieve created card', () => {
    const card = createCard(deckId, 'Q', 'A')
    const found = getCard(card.id, [card])
    expect(found.front).toBe('Q')
  })

  it('returns undefined for unknown id', () => {
    expect(getCard('nonexistent', [])).toBeUndefined()
  })

  it('updateCard preserves level/correctCount (progress preserved on edit)', () => {
    const card = createCard(deckId, 'Q', 'A')
    // Simulate a card that has progressed through learning
    const progressedCard = { ...card, level: 3, correctCount: 7 }
    // Edit content — level and correctCount must survive unchanged
    const updated = updateCard(card.id, { front: 'Updated Q', back: 'A' }, [progressedCard])
    expect(updated.level).toBe(3)       // level preserved
    expect(updated.correctCount).toBe(7) // progress preserved
    expect(updated.front).toBe('Updated Q')
  })

  it('deleteCard returns array without the card', () => {
    const card = createCard(deckId, 'Q', 'A')
    const remaining = deleteCard(card.id, [card])
    expect(remaining).toHaveLength(0)
    expect(getCard(card.id, remaining)).toBeUndefined()
  })
})

describe('getCardsByDeck', () => {
  it('returns only cards for the specified deck', () => {
    const other = createDeck('Other', '')
    const c1 = createCard(deckId, 'Q1', 'A1')
    const c2 = createCard(deckId, 'Q2', 'A2')
    const c3 = createCard(other.id, 'Q3', 'A3')
    const cards = getCardsByDeck(deckId, [c1, c2, c3])
    expect(cards).toHaveLength(2)
    expect(cards.every(c => c.deckId === deckId)).toBe(true)
  })
})

describe('searchCards', () => {
  let testCards

  beforeEach(() => {
    const c1 = createCard(deckId, 'The mitochondria', 'powerhouse of the cell')
    const c2 = createCard(deckId, 'Capital of Japan', 'Tokyo')
    const c3 = createCard(deckId, 'What is H2O?', 'Water')
    testCards = [c1, c2, c3]
  })

  it('searches front content', () => {
    const results = searchCards(testCards, 'mitochondria')
    expect(results).toHaveLength(1)
    expect(results[0].front).toContain('mitochondria')
  })

  it('searches back content', () => {
    const results = searchCards(testCards, 'Tokyo')
    expect(results).toHaveLength(1)
    expect(results[0].back).toBe('Tokyo')
  })

  it('is case-insensitive', () => {
    const results = searchCards(testCards, 'WATER')
    expect(results).toHaveLength(1)
  })

  it('empty query returns all cards', () => {
    const results = searchCards(testCards, '')
    expect(results).toHaveLength(3)
  })
})

describe('filterCardsByLevel', () => {
  let testCards

  beforeEach(() => {
    const c1 = createCard(deckId, 'Q1', 'A1')                             // level 1
    const c2 = { ...createCard(deckId, 'Q2', 'A2'), level: 2 }
    const c3 = { ...createCard(deckId, 'Q3', 'A3'), level: 3 }
    testCards = [c1, c2, c3]
  })

  it('filters by level 1', () => {
    const filtered = filterCardsByLevel(testCards, 1)
    expect(filtered.every(c => c.level === 1)).toBe(true)
  })

  it('filters by level 2', () => {
    const filtered = filterCardsByLevel(testCards, 2)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].level).toBe(2)
  })

  it('null filter returns all cards', () => {
    const filtered = filterCardsByLevel(testCards, null)
    expect(filtered).toHaveLength(3)
  })
})
