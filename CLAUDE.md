# Flashcard Learning App

Spaced repetition flashcard system using the Leitner algorithm with LocalStorage persistence.

## Tech Stack
- **Frontend**: HTML5 + Tailwind CSS (CDN) + Vanilla JavaScript (ES6+)
- **Storage**: LocalStorage API with quota management
- **Architecture**: Modular JS (5 modules: app, cards, decks, learning, storage)
- **Animation**: CSS 3D transforms (card flip with backface-visibility)

## Project Structure
```
day6-flashcard/
├── index.html              # Main app with card flip CSS
├── js/
│   ├── app.js             # UI logic, event handlers, views (1368 lines)
│   ├── decks.js           # Deck CRUD + validation
│   ├── cards.js           # Card CRUD + search/filter
│   ├── learning.js        # Leitner algorithm + date utilities
│   └── storage.js         # LocalStorage + export/import
├── specs/
│   ├── PRD.md             # Product requirements
│   └── IMPLEMENTATION.md  # Phase-based implementation plan
└── CLAUDE.md              # This file
```

## Features Implemented

### Phase 1: Deck Management
- ✅ Deck CRUD (create, read, update, delete)
- ✅ Deck name validation (no duplicates, .trim() whitespace)
- ✅ CASCADE delete (deck → cards)
- ✅ LocalStorage persistence with error handling
- ✅ Sidebar deck list with card counts

### Phase 2: Card Management
- ✅ Card CRUD with level preservation on edit
- ✅ Search with 300ms debounce (front + back content)
- ✅ Filter by level (1/2/3) or due status
- ✅ Level display (⭐⭐⭐)
- ✅ Empty states ("Add your first card!")

### Phase 3: Learning System (Leitner Algorithm)
- ✅ Level 1 → 2: +3 days
- ✅ Level 2 → 3: +7 days
- ✅ Level 3 → 3: +7 days (stays at max)
- ✅ Incorrect → Level 1: +1 day
- ✅ Date normalization (midnight comparison, timezone-safe)
- ✅ Due cards filtering (nextReview <= today)
- ✅ Level 1 cards prioritized in study queue

### Phase 4: Study Mode
- ✅ Card flip animation (0.6s, 3D Y-axis rotation)
- ✅ Keyboard shortcuts:
  - Space: Flip card
  - → (Right): I know it
  - ← (Left): Review again
  - Esc: Exit study mode
- ✅ Session stats (correct %, time, cards reviewed)
- ✅ Progress bar (0-100%)
- ✅ Due count badges in sidebar

### Phase 5: Polish & Export
- ✅ Export deck as JSON (deck + cards + metadata)
- ✅ Import with conflict resolution:
  - ID conflicts → new UUIDs
  - Name conflicts → "Name (2)"
- ✅ Multi-tab sync (storage event listener)
- ✅ Global keyboard shortcuts:
  - N: New deck
  - /: Focus search
- ✅ Responsive design (320px+, 44px touch targets — WCAG 2.5.5 compliant)
- ✅ `overflow-x-hidden` on outer container — prevents header min-w-fit overflow on 375px mobile (fix: 2026-03-21)

## Commands

### Run App
```bash
start index.html
# or
start "" "C:\workspace\prj20060203\day6-flashcard\index.html"
```

### Run Tests
Open browser console (F12) and run:
```javascript
// Run all test suites
DeckTests.runAll()      // 8 tests: CRUD, validation, storage
CardTests.runAll()      // 10 tests: CRUD, search, filter
LeitnerTests.runAll()   // 12 tests: level transitions, dates
StudyTests.runAll()     // 9 tests: session, flip, keyboard
ExportTests.runAll()    // 7 tests: export/import, conflicts
StorageTests.runAll()   // 4 tests: localStorage operations

// Or run all at once
[DeckTests, CardTests, LeitnerTests, StudyTests, ExportTests, StorageTests]
  .forEach(suite => suite.runAll())
```

## Critical Implementation Details

### Leitner Algorithm (learning.js)
```javascript
// Level progression
markCorrect(card):
  Level 1 → 2: nextReview = now + 3 days
  Level 2 → 3: nextReview = now + 7 days
  Level 3 → 3: nextReview = now + 7 days (max level)

markIncorrect(card):
  Any Level → 1: nextReview = now + 1 day

// Date handling (timezone-safe)
normalizeDate(date):
  - Strips time component (00:00:00.000)
  - Used for due card comparison

isCardDue(card):
  - Compares normalized dates only (ignores time)
  - Returns true if nextReview <= today
```

### Data Schema (LocalStorage)
```javascript
{
  version: "1.0",
  decks: [
    {
      id: UUID,
      name: string,
      description: string,
      created: ISO8601,
      cardCount: number
    }
  ],
  cards: [
    {
      id: UUID,
      deckId: UUID,
      front: string,
      back: string,
      level: 1-3,
      correctCount: number,
      lastReviewed: ISO8601 | null,
      nextReview: ISO8601,
      created: ISO8601
    }
  ],
  settings: {
    darkMode: true,
    sessionLimit: 20,
    autoShuffle: false
  }
}
```

### Export Format
```javascript
{
  version: "1.0",
  exportDate: ISO8601,
  deck: { /* deck object */ },
  cards: [ /* array of cards */ ]
}
```

## Development Workflow

### Before ANY Commit
```bash
# 1. Run ALL test suites in browser console
DeckTests.runAll()
CardTests.runAll()
LeitnerTests.runAll()
StudyTests.runAll()
ExportTests.runAll()
StorageTests.runAll()

# 2. Manual verification
- Create deck → add cards → study
- Test keyboard shortcuts (Space, →, ←, Esc, N, /)
- Export deck → import in fresh session
- Open 2 tabs → verify multi-tab sync
- Check responsive design (mobile viewport)
- Verify no console errors

# 3. Commit only if ALL tests pass
git add .
git commit -m "feat: description"
```

### Git Conventions
- **Branches**: `develop` (main), `feature/*`, `fix/*`
- **Commits**:
  - `feat:` - New feature
  - `fix:` - Bug fix
  - `test:` - Test updates
  - `docs:` - Documentation
  - Include "🤖 Generated with Claude Code" footer

## Code Conventions

### Dates & IDs
```javascript
// ALWAYS use ISO 8601 for dates
created: new Date().toISOString()
nextReview: addDays(new Date(), 3)

// ALWAYS use crypto.randomUUID() for IDs
id: crypto.randomUUID()
```

### Validation
```javascript
// ALWAYS trim before validation
name.trim()
front.trim()

// ALWAYS check duplicates
validateDeckName(name, existingDecks)
```

### UI/UX
```javascript
// ALWAYS 44px minimum touch targets
class="min-h-[44px]"

// ALWAYS debounce search (300ms)
debounce(handleSearch, 300)

// ALWAYS confirm destructive actions
if (!confirm("Delete deck? Cards will also be deleted.")) return;
```

## Critical Rules

### MUST DO
✅ Preserve card progress on edit (level, dates, correctCount)
✅ Update deck.cardCount on card add/delete
✅ Save immediately after each review
✅ Normalize dates for due comparison (midnight only)
✅ Handle LocalStorage quota (80% warn, 95% error)
✅ Show empty states for no decks/cards/due cards
✅ Disable keyboard shortcuts in input fields

### NEVER DO
❌ Allow duplicate deck names
❌ Use setInterval for timing (use Date.now())
❌ Block UI during save (LocalStorage is synchronous but fast)
❌ Skip validation on import (check structure + fields)
❌ Level > 3 or < 1 (clamp to 1-3 range)
❌ Lose data on tab close (auto-save on every action)

## Troubleshooting

### Tests Failing
1. Open browser console (F12)
2. Check for red errors
3. Run individual test suite to isolate issue
4. Verify LocalStorage is enabled (private mode blocks it)

### Import Not Working
- Check JSON format matches export schema
- Verify `deck` and `cards` fields exist
- Import creates NEW deck (doesn't overwrite)

### Multi-tab Not Syncing
- Only works when storage changes in OTHER tab
- Same tab changes don't trigger storage event
- Check console for "Storage changed in another tab" log

### Due Cards Not Showing
- Cards must have `nextReview <= today` (normalized)
- Check browser date/time is correct
- Run `LeitnerTests.testIsCardDue_Today()` to verify

## Performance

- LocalStorage quota: ~5MB typical
- Cards tested: 100+ cards (< 100ms search)
- Animations: 60fps (GPU-accelerated with `will-change`)
- Debounce: 300ms search, prevents typing lag

## Known Issues & Fix History

### Fixed (v0.1.0.0 — 2026-03-21)

**Add Card modal validation failure (ISSUE-001)**
- Root cause: `index.html` static `#cardFormView` (line 444) contains `id="cardFrontInput"` and `id="cardBackInput"`. These duplicate IDs are also used by the dynamically-created modal. `document.getElementById()` always returns the FIRST match in DOM order — the hidden static element.
- Fix: `js/app.js handleAddCard()` now uses `form.querySelector("#cardFrontInput")` scoped to `#addCardForm` instead of `document.getElementById()`.
- ⚠️ Lingering smell: the duplicate IDs still exist in the DOM. Future improvement: rename static element IDs to `id="static-cardFrontInput"` or remove `#cardFormView` from HTML entirely.

**Mobile 375px horizontal scroll (ISSUE-002)**
- Root cause: `min-w-fit` on header left/right sections forced the header to 506px, wider than viewport.
- Fix: `overflow-x-hidden` added to outer `div.flex.flex-col.h-screen` container (index.html:160).

**Touch targets below WCAG 2.5.5 (FINDING-001/002 from design-review)**
- Settings button was 40×40px. Import button was 42×44px.
- Fix: Added `min-w-[44px] min-h-[44px]` to both.

## Browser Compatibility

- **Chrome/Edge**: ✅ Full support
- **Firefox**: ✅ Full support
- **Safari**: ✅ Full support (requires user gesture for audio in future)
- **Mobile**: ✅ Responsive (320px+)
- **Private Mode**: ⚠️ LocalStorage may be disabled

## Future Enhancements (Not Implemented)

- [ ] Dark mode toggle (currently always dark)
- [ ] Audio/sound on card flip
- [ ] Virtual scrolling for 1000+ cards
- [ ] Service Worker for offline support
- [ ] Cloud sync (Firebase/Supabase)
- [ ] Card images/rich text
- [ ] Study statistics dashboard
- [ ] Spaced repetition algorithm variants (SM-2, FSRS)

## License

MIT License - Educational project for learning web development with Claude Code.
