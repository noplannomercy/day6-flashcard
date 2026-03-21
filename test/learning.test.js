/**
 * Tests for the Leitner spaced repetition algorithm (js/learning.js)
 */

describe('normalizeDate', () => {
  it('strips time component to midnight', () => {
    const d = new Date('2024-06-15T14:30:00.000Z')
    const normalized = normalizeDate(d)
    expect(normalized.getHours()).toBe(0)
    expect(normalized.getMinutes()).toBe(0)
    expect(normalized.getSeconds()).toBe(0)
    expect(normalized.getMilliseconds()).toBe(0)
  })

  it('returns a new Date object (does not mutate)', () => {
    const d = new Date('2024-06-15T14:30:00.000Z')
    const normalized = normalizeDate(d)
    expect(normalized).not.toBe(d)
  })
})

describe('addDays', () => {
  it('adds days to a date', () => {
    const d = new Date('2024-01-01T00:00:00.000Z')
    const result = addDays(d, 3)
    // addDays returns ISO string — wrap in new Date() to inspect
    expect(new Date(result).getDate()).toBe(4) // Jan 1 + 3 = Jan 4 (in local time)
  })

  it('adding 0 days returns same date', () => {
    const d = new Date('2024-06-15')
    const result = addDays(d, 0) // returns ISO string
    expect(normalizeDate(result).getTime()).toBe(normalizeDate(d).getTime())
  })
})

describe('markCorrect — Leitner level progression', () => {
  function makeCard(level) {
    return {
      id: 'test-id',
      level,
      correctCount: 0,
      lastReviewed: null,
      nextReview: new Date().toISOString(),
    }
  }

  it('Level 1 → 2, nextReview +3 days', () => {
    const card = makeCard(1)
    const updated = markCorrect(card)
    expect(updated.level).toBe(2)
    // nextReview is an ISO string — normalizeDate accepts strings
    const expected = addDays(new Date(), 3) // also ISO string
    expect(normalizeDate(updated.nextReview).getTime()).toBe(normalizeDate(expected).getTime())
  })

  it('Level 2 → 3, nextReview +7 days', () => {
    const card = makeCard(2)
    const updated = markCorrect(card)
    expect(updated.level).toBe(3)
    const expected = addDays(new Date(), 7)
    expect(normalizeDate(updated.nextReview).getTime()).toBe(normalizeDate(expected).getTime())
  })

  it('Level 3 stays at 3, nextReview +7 days', () => {
    const card = makeCard(3)
    const updated = markCorrect(card)
    expect(updated.level).toBe(3) // max level — does not exceed 3
    const expected = addDays(new Date(), 7)
    expect(normalizeDate(updated.nextReview).getTime()).toBe(normalizeDate(expected).getTime())
  })

  it('increments correctCount', () => {
    const card = makeCard(1)
    card.correctCount = 4
    const updated = markCorrect(card)
    expect(updated.correctCount).toBe(5)
  })

  it('sets lastReviewed to today', () => {
    const card = makeCard(1)
    const updated = markCorrect(card)
    const today = normalizeDate(new Date())
    const reviewed = normalizeDate(new Date(updated.lastReviewed))
    expect(reviewed.getTime()).toBe(today.getTime())
  })
})

describe('markIncorrect — resets to Level 1', () => {
  it('any level resets to 1, nextReview +1 day', () => {
    for (const level of [1, 2, 3]) {
      const card = { id: 'x', level, correctCount: 5, lastReviewed: null, nextReview: new Date().toISOString() }
      const updated = markIncorrect(card)
      expect(updated.level).toBe(1)
      const expected = addDays(new Date(), 1) // ISO string
      expect(normalizeDate(updated.nextReview).getTime()).toBe(normalizeDate(expected).getTime())
    }
  })
})

describe('isCardDue', () => {
  it('returns true when nextReview is today', () => {
    const card = { nextReview: normalizeDate(new Date()).toISOString() }
    expect(isCardDue(card)).toBe(true)
  })

  it('returns true when nextReview is in the past', () => {
    const past = addDays(new Date(), -3) // ISO string — use directly
    const card = { nextReview: past }
    expect(isCardDue(card)).toBe(true)
  })

  it('returns false when nextReview is in the future', () => {
    const future = addDays(new Date(), 3) // ISO string — use directly
    const card = { nextReview: future }
    expect(isCardDue(card)).toBe(false)
  })
})

describe('getDueCards', () => {
  it('returns only cards due today or earlier', () => {
    const deckId = 'test-deck'
    const past = addDays(new Date(), -1)    // ISO string
    const today = normalizeDate(new Date()).toISOString()
    const future = addDays(new Date(), 1)   // ISO string
    const cards = [
      { id: '1', deckId, level: 1, nextReview: past },
      { id: '2', deckId, level: 2, nextReview: today },
      { id: '3', deckId, level: 3, nextReview: future },
    ]
    const due = getDueCards(deckId, cards)
    expect(due.map(c => c.id)).toEqual(['1', '2'])
  })

  it('prioritizes Level 1 cards', () => {
    const deckId = 'test-deck'
    const today = normalizeDate(new Date()).toISOString()
    const cards = [
      { id: 'lv3', deckId, level: 3, nextReview: today },
      { id: 'lv1', deckId, level: 1, nextReview: today },
      { id: 'lv2', deckId, level: 2, nextReview: today },
    ]
    const due = getDueCards(deckId, cards)
    expect(due[0].id).toBe('lv1') // Level 1 first
  })
})
