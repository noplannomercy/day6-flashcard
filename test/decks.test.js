/**
 * Tests for deck CRUD and validation (js/decks.js)
 */

beforeEach(() => {
  localStorage.clear()
})

describe('validateDeckName', () => {
  it('accepts valid name', () => {
    const result = validateDeckName('My Deck', [])
    expect(result.valid).toBe(true)
  })

  it('rejects empty name', () => {
    const result = validateDeckName('', [])
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('rejects whitespace-only name', () => {
    const result = validateDeckName('   ', [])
    expect(result.valid).toBe(false)
  })

  it('rejects duplicate name (case-sensitive)', () => {
    const existing = [{ name: 'Vocab' }]
    const result = validateDeckName('Vocab', existing)
    expect(result.valid).toBe(false)
  })

  it('allows name matching existing deck when editing same deck (excludeId)', () => {
    const existing = [{ id: 'abc', name: 'Vocab' }]
    const result = validateDeckName('Vocab', existing, 'abc')
    expect(result.valid).toBe(true)
  })
})

describe('createDeck', () => {
  it('creates deck with required fields', () => {
    const deck = createDeck('Science', 'Biology basics')
    expect(deck.id).toBeTruthy()
    expect(deck.name).toBe('Science')
    expect(deck.description).toBe('Biology basics')
    expect(deck.cardCount).toBe(0)
    expect(deck.created).toBeTruthy()
  })

  it('trims name and description', () => {
    const deck = createDeck('  Math  ', '  Algebra  ')
    expect(deck.name).toBe('Math')
    expect(deck.description).toBe('Algebra')
  })
})

describe('getDeck / updateDeck / deleteDeck', () => {
  it('can retrieve a created deck', () => {
    const deck = createDeck('History', '')
    const found = getDeck(deck.id, [deck])
    expect(found.name).toBe('History')
  })

  it('returns undefined for unknown id', () => {
    expect(getDeck('nonexistent-id', [])).toBeUndefined()
  })

  it('updateDeck returns updated deck', () => {
    const deck = createDeck('Old Name', '')
    const updated = updateDeck(deck.id, { name: 'New Name' }, [deck])
    expect(updated.name).toBe('New Name')
  })

  it('deleteDeck returns array without the deck', () => {
    const deck = createDeck('Temp', '')
    const remaining = deleteDeck(deck.id, [deck])
    expect(remaining).toHaveLength(0)
    expect(getDeck(deck.id, remaining)).toBeUndefined()
  })
})

describe('deleteDeckWithCards — cascade delete', () => {
  it('deletes the deck and all its cards', () => {
    const deck = createDeck('Cascade Test', '')
    const c1 = createCard(deck.id, 'Q1', 'A1')
    const c2 = createCard(deck.id, 'Q2', 'A2')
    // Seed storage — deleteDeckWithCards reads/writes storage internally
    saveDecks([deck])
    saveCards([c1, c2])

    deleteDeckWithCards(deck.id)

    expect(getDeck(deck.id, loadDecks())).toBeUndefined()
    expect(getCardsByDeck(deck.id, loadCards())).toHaveLength(0)
  })
})
