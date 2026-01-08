# Flashcard App - Product Requirements Document

## Project Overview

**Name:** Flashcard Learning App  
**Type:** Single Page Application  
**Target:** Students, language learners, exam prep  
**Timeline:** Day 6 (1-1.5 hours)

---

## WHAT (Tech Stack)

**Frontend:**
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript (ES6+)

**Storage:**
- LocalStorage API

**Structure:**
- Single HTML file
- Modular JS (app.js, cards.js, decks.js, learning.js, storage.js)
- No build tools

---

## WHY (Purpose & Goals)

**Primary Goal:**  
Effective spaced repetition learning with minimal friction

**Target Users:**
- Students studying for exams
- Language learners building vocabulary
- Anyone memorizing facts/concepts

**Key Differentiators:**
- Leitner system (proven method)
- Simple, focused UI
- Keyboard-driven
- Offline-first (LocalStorage)
- No account required

---

## HOW (Features & Requirements)

### 1. Core Data Structure

**Card:**
```javascript
card = {
  id: "card_uuid",
  deckId: "deck_uuid",
  front: "Question or term",
  back: "Answer or definition",
  level: 1,           // Leitner level: 1, 2, 3
  correctCount: 0,
  lastReviewed: "2026-01-08T10:00:00Z",
  nextReview: "2026-01-09T10:00:00Z",
  created: "2026-01-08T09:00:00Z"
}
```

**Deck:**
```javascript
deck = {
  id: "deck_uuid",
  name: "Spanish Vocabulary",
  description: "Common phrases",
  created: "2026-01-08T09:00:00Z",
  cardCount: 50
}
```

### 2. User Interface

**Layout Structure:**
```
[Header: Flashcard App]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEFT SIDEBAR (30%):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[My Decks]
┌─────────────────────────────┐
│ + New Deck                  │
├─────────────────────────────┤
│ 📚 Spanish Vocabulary       │
│    50 cards · 12 due today  │
├─────────────────────────────┤
│ 📚 Biology Terms            │
│    30 cards · 5 due today   │
└─────────────────────────────┘

[Selected Deck Actions]
[Study Now] [Add Card] [Manage]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RIGHT MAIN AREA (70%):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VIEW 1: Deck Management
┌─────────────────────────────┐
│ Spanish Vocabulary          │
│ Common phrases              │
├─────────────────────────────┤
│ Search cards: [________]    │
│                             │
│ Card 1                      │
│ Front: ¿Cómo estás?         │
│ Back: How are you?          │
│ Level: ⭐⭐ (Review)         │
│ [Edit] [Delete]             │
│                             │
│ Card 2...                   │
└─────────────────────────────┘

VIEW 2: Study Mode
┌─────────────────────────────┐
│         12 cards due        │
│                             │
│  ┌─────────────────────┐   │
│  │                     │   │
│  │   ¿Cómo estás?      │   │
│  │                     │   │
│  │  [Show Answer]      │   │
│  │                     │   │
│  └─────────────────────┘   │
│                             │
│  Progress: ████░░░░  5/12   │
└─────────────────────────────┘

VIEW 3: Add/Edit Card
┌─────────────────────────────┐
│ Add New Card                │
│                             │
│ Front (Question/Term):      │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ Back (Answer/Definition):   │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ [Save] [Cancel]             │
└─────────────────────────────┘
```

**UI Requirements:**
- Responsive (mobile 320px+)
- Dark mode default
- Keyboard shortcuts
- Card flip animation
- Progress indicators

### 3. Leitner System Logic

**3 Levels:**
```
Level 1 (Learning):   Review next day
Level 2 (Review):     Review in 3 days
Level 3 (Mastered):   Review in 7 days
```

**State Transitions:**
```javascript
// User clicks "I know it"
if (currentLevel === 1) {
  level = 2;
  nextReview = today + 3 days;
} else if (currentLevel === 2) {
  level = 3;
  nextReview = today + 7 days;
} else if (currentLevel === 3) {
  // Stay at level 3
  nextReview = today + 7 days;
}

// User clicks "Review again"
level = 1;
nextReview = today + 1 day;
```

**Due Cards Calculation:**
```javascript
function getDueCards(deckId) {
  const now = new Date();
  return cards
    .filter(c => c.deckId === deckId)
    .filter(c => new Date(c.nextReview) <= now)
    .sort((a, b) => a.level - b.level); // Level 1 first
}
```

### 4. Study Mode

**Session Flow:**
```
1. Select deck
2. Load due cards (or all if shuffle mode)
3. Show front
4. User reveals back
5. User marks: "I know it" or "Review again"
6. Update card level and nextReview
7. Next card
8. Session complete → show stats
```

**Study Options:**
```
□ Due cards only (default)
□ All cards (shuffle)
□ Limit: 20 cards per session
□ Randomize order
```

**Keyboard Shortcuts:**
```
Space:  Flip card
→:      I know it
←:      Review again
Esc:    Exit study mode
```

### 5. Deck Management

**Create Deck:**
```javascript
function createDeck(name, description) {
  return {
    id: generateId(),
    name,
    description,
    created: new Date().toISOString(),
    cardCount: 0
  };
}
```

**Deck Actions:**
- Create
- Rename
- Delete (confirm if cards exist)
- Duplicate
- Export (JSON)
- Import (JSON)

**Deck Statistics:**
```
Total cards: 50
Due today: 12
Level 1: 20 (Learning)
Level 2: 15 (Review)
Level 3: 15 (Mastered)
```

### 6. Card Management

**Create Card:**
```javascript
function createCard(deckId, front, back) {
  return {
    id: generateId(),
    deckId,
    front,
    back,
    level: 1,
    correctCount: 0,
    lastReviewed: null,
    nextReview: new Date().toISOString(), // Due immediately
    created: new Date().toISOString()
  };
}
```

**Card Actions:**
- Add
- Edit
- Delete
- Duplicate
- Move to another deck
- Reset progress

**Bulk Operations:**
```
□ Select multiple cards
□ Delete selected
□ Move selected to deck
□ Reset selected
```

### 7. Search & Filter

**Search:**
- Full-text search (front + back)
- Real-time filtering
- Highlight matches

**Filter:**
- All cards
- Level 1 only
- Level 2 only
- Level 3 only
- Due today
- Never reviewed

### 8. Data Persistence

**LocalStorage Schema:**
```javascript
{
  decks: [
    {id, name, description, created, cardCount}
  ],
  cards: [
    {id, deckId, front, back, level, correctCount, lastReviewed, nextReview, created}
  ],
  settings: {
    darkMode: true,
    sessionLimit: 20,
    autoShuffle: false
  },
  stats: {
    totalStudySessions: 50,
    totalCardsReviewed: 500,
    streakDays: 7
  }
}
```

**Storage Functions:**
```javascript
saveDecks(decks)
loadDecks()
saveCards(cards)
loadCards()
saveSettings(settings)
loadSettings()
```

**Quota Management:**
- Check usage: `getStorageUsage()`
- Warn at 80%
- Error at 95%

### 9. Export & Import

**Export Format (JSON):**
```json
{
  "deck": {
    "name": "Spanish Vocabulary",
    "description": "Common phrases"
  },
  "cards": [
    {
      "front": "¿Cómo estás?",
      "back": "How are you?"
    }
  ],
  "exported": "2026-01-08T12:00:00Z",
  "version": "1.0"
}
```

**Export:**
- Single deck
- All decks
- Download as .json

**Import:**
- Upload .json file
- Validate format
- Merge or replace
- Show preview before import

### 10. Keyboard Shortcuts

**Global:**
- `N`: New card
- `/`: Focus search
- `Esc`: Close modal/exit mode
- `D`: Toggle dark mode

**Deck List:**
- `↑/↓`: Navigate decks
- `Enter`: Study selected deck
- `Del`: Delete selected deck

**Study Mode:**
- `Space`: Flip card
- `→`: I know it
- `←`: Review again
- `Esc`: Exit study mode

**Card Management:**
- `E`: Edit selected card
- `Del`: Delete selected card
- `Ctrl+D`: Duplicate

---

## File Structure

```
day6-flashcard/
├── index.html       
├── js/
│   ├── app.js       # Main logic
│   ├── cards.js     # Card CRUD
│   ├── decks.js     # Deck CRUD
│   ├── learning.js  # Leitner system
│   └── storage.js   # LocalStorage
└── docs/
    ├── PRD.md
    └── PROMPTS-DAY6.md
```

---

## Implementation Sequence

**Phase 1: Deck Management (12 min)**
1. HTML structure (sidebar + main)
2. Deck list display
3. Create/edit/delete deck
4. LocalStorage save/load

**Phase 2: Card Management (15 min)**
5. Add card form
6. Card list display
7. Edit/delete card
8. Search and filter

**Phase 3: Learning System (15 min)**
9. Leitner algorithm implementation
10. Study mode UI
11. Card flip animation
12. Progress tracking

**Phase 4: Study Mode (12 min)**
13. Due cards calculation
14. Session flow
15. Keyboard shortcuts
16. Stats display

**Phase 5: Polish & Export (10 min)**
17. Dark mode styling
18. Export/import JSON
19. Responsive design
20. Final testing

---

## CRITICAL RULES

**IMPORTANT:**
- Leitner levels MUST be calculated correctly (1→2→3)
- nextReview dates MUST use actual dates (not ticks)
- Study mode MUST only show due cards by default
- Card flip MUST be smooth (CSS animation)
- LocalStorage MUST handle quota errors

**YOU MUST:**
- Use ISO 8601 for all dates
- Calculate nextReview based on level
- Shuffle cards in study mode (if option enabled)
- Validate JSON on import
- Show clear progress indicators

**NEVER:**
- Allow duplicate deck names
- Lose card progress on edit
- Show 0 due cards in study mode (show all if none due)
- Block UI during save
- Use setInterval for timing

**ALWAYS:**
- Save after every card review
- Update deck.cardCount when cards added/removed
- Show keyboard shortcuts hints
- Provide "Are you sure?" for delete
- Handle empty states gracefully

---

## Success Criteria

**Functional:**
- [ ] Create, edit, delete decks
- [ ] Create, edit, delete cards
- [ ] Study mode works (flip, mark)
- [ ] Leitner system advances levels correctly
- [ ] Due cards calculated correctly
- [ ] Export/import works
- [ ] Keyboard shortcuts work

**Non-Functional:**
- [ ] Smooth card flip animation
- [ ] No LocalStorage errors
- [ ] Responsive on mobile (320px+)
- [ ] Dark mode works
- [ ] Fast (< 100ms interactions)

---

## Testing Checklist

**Leitner System:**
- [ ] New card starts at Level 1
- [ ] "I know it" advances: 1→2, 2→3, 3→3
- [ ] "Review again" resets to Level 1
- [ ] nextReview dates calculated: +1d, +3d, +7d
- [ ] Due cards shown only when nextReview <= today

**Study Mode:**
- [ ] Shows due cards only (default)
- [ ] Shuffle option works
- [ ] Session limit (20 cards) works
- [ ] Stats accurate at end
- [ ] Keyboard shortcuts (Space, →, ←)

**Data Persistence:**
- [ ] Decks saved and loaded
- [ ] Cards saved and loaded
- [ ] Progress persists (levels, dates)
- [ ] Refresh maintains state

**Edge Cases:**
- [ ] Empty deck shows "No cards" message
- [ ] No due cards shows "All caught up" or offers "Study all"
- [ ] Delete deck with cards asks confirmation
- [ ] Import invalid JSON shows error
- [ ] LocalStorage quota exceeded handled
- [ ] Duplicate deck name prevented

---

## Bonus Features (If Time)

- [ ] Study statistics dashboard
- [ ] Streak tracking (consecutive days)
- [ ] Card difficulty rating (Easy/Hard)
- [ ] Markdown support in cards
- [ ] Image upload (future)
