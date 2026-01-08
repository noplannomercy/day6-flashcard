# Flashcard App - Implementation Plan

## Overview
- **Total Phases**: 5
- **Approach**: TDD (Tests First)
- **Stack**: HTML5 + Tailwind CSS + Vanilla JS + LocalStorage

---

## Phase 1: Deck Management (~12 min)
**Status**: [✓] Complete

### Setup
- [x] Create index.html with Tailwind CDN
- [x] Create sidebar (30%) + main area (70%) layout
- [x] Dark mode default styling
- [x] Create empty JS modules: app.js, decks.js, storage.js

### Deck CRUD
- [x] `decks.js`: createDeck(name, description) → returns deck object
- [x] `decks.js`: updateDeck(id, updates) → preserves id/created
- [x] `decks.js`: deleteDeck(id) → removes deck + CASCADE delete cards
- [x] `decks.js`: getDeck(id) → finds by id
- [x] `decks.js`: validateDeckName(name, existingDecks) → no duplicates, `.trim()` 후 검증

### Storage
- [x] `storage.js`: STORAGE_VERSION = "1.0" (마이그레이션 대비)
- [x] `storage.js`: saveDecks(decks) → LocalStorage
- [x] `storage.js`: loadDecks() → returns [] if empty, JSON 파싱 에러 핸들링
- [x] `storage.js`: isLocalStorageAvailable() → feature detection
- [x] `storage.js`: getStorageUsage() → quota 체크 (80% 경고, 95% 에러)

### UI Integration
- [x] Render deck list in sidebar
- [x] "New Deck" button → modal/form
- [x] Click deck → select and highlight
- [x] Edit deck name inline or modal
- [x] Delete deck → confirm dialog ("카드 X개도 함께 삭제됩니다")

### Tests: DeckTests
```javascript
DeckTests = {
  testCreateDeck()           // id, name, created, cardCount=0
  testValidateName()         // rejects duplicates, empty, whitespace-only
  testValidateNameTrim()     // "  test  " → "test" 로 처리
  testUpdateDeck()           // preserves id, updates name
  testDeleteDeck()           // removes from array
  testDeleteDeckCascade()    // 연관 cards도 삭제 확인
  testStorageSaveLoad()      // round-trip persistence
  testStorageCorrupted()     // JSON 파싱 에러 시 [] 반환
}
```

- [x] Test: Run `DeckTests.runAll()` in console
- [x] Test: Create deck → refresh → deck persists
- [x] Test: Duplicate name shows error
- [x] Test: Delete deck → 연관 cards도 삭제됨

---

## Phase 2: Card Management (~15 min)
**Status**: [✓] Complete

### Card CRUD
- [x] `cards.js`: createCard(deckId, front, back) → card with level=1, nextReview=now
- [x] `cards.js`: updateCard(id, updates) → preserves id, created, level, dates
- [x] `cards.js`: deleteCard(id) → removes card
- [x] `cards.js`: deleteCardsByDeckId(deckId) → CASCADE 삭제용
- [x] `cards.js`: getCardsByDeck(deckId) → filtered list
- [x] `cards.js`: updateDeckCardCount(deckId) → sync count
- [x] `cards.js`: validateCard(front, back) → `.trim()` 후 빈 값 체크

### Storage
- [x] `storage.js`: saveCards(cards) → LocalStorage
- [x] `storage.js`: loadCards() → returns [] if empty, JSON 에러 핸들링

### UI: Card List View
- [x] Main area shows cards for selected deck
- [x] Each card shows: front, back (truncated), level stars
- [x] Empty state: "No cards yet. Add your first card!"
- [x] 카드 0개 deck에서 Study 클릭 → "카드를 먼저 추가하세요" 안내

### UI: Add/Edit Card
- [x] "Add Card" button → form with front/back textareas
- [x] Validate: `.trim()` 후 front and back required
- [x] Edit card → pre-fill form, preserve progress (level, dates)
- [x] Delete card → confirm dialog

### Search & Filter
- [x] Search input → filters by front+back text
- [x] **Debounce 300ms** 적용 (성능 최적화)
- [x] Filter dropdown: All, Level 1, Level 2, Level 3, Due Today

### Tests: CardTests
```javascript
CardTests = {
  testCreateCard()        // level=1, nextReview=now, deckId set
  testValidateCard()      // rejects empty, whitespace-only
  testValidateCardTrim()  // "  hello  " → "hello"
  testUpdateCard()        // preserves level, created, lastReviewed
  testDeleteCard()        // removes and updates deckCount
  testDeleteByDeckId()    // CASCADE 삭제 동작
  testGetByDeck()         // filters correctly
  testSearchCards()       // matches front+back
  testSearchDebounce()    // 300ms debounce 동작
  testFilterByLevel()     // returns correct subset
}
```

- [x] Test: Run `CardTests.runAll()` in console
- [x] Test: Add card → deck cardCount increases
- [x] Test: Edit card → level/dates unchanged
- [x] Test: Delete card → deck cardCount decreases
- [x] Test: 공백만 입력 시 에러

---

## Phase 3: Learning System (~15 min)
**Status**: [ ] Not Started

### Leitner Algorithm (PRD 기준 정확한 로직)
```
Level 1 (Learning): Review next day     → +1 day
Level 2 (Review):   Review in 3 days    → +3 days
Level 3 (Mastered): Review in 7 days    → +7 days
```

- [ ] `learning.js`: markCorrect(card) → level up + nextReview
  - Level 1 → 2: nextReview = **+3 days** (다음 레벨 기준)
  - Level 2 → 3: nextReview = **+7 days** (다음 레벨 기준)
  - Level 3 → 3: nextReview = **+7 days** (유지)
- [ ] `learning.js`: markIncorrect(card) → reset to level 1, nextReview = **+1 day**
- [ ] `learning.js`: calculateNextReview(level) → Date object
- [ ] `learning.js`: isCardDue(card) → nextReview <= now

### Date Utilities (타임존 안전)
```javascript
// 날짜 정규화 (시간 제거, 자정 기준)
function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// 일수 추가
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString();
}
```

- [ ] `learning.js`: normalizeDate(date) → 자정 기준 정규화
- [ ] `learning.js`: addDays(date, days) → 타임존 안전한 날짜 계산

### Due Cards
- [ ] `learning.js`: getDueCards(deckId, cards) → filtered + sorted by level
- [ ] `learning.js`: getDueCount(deckId, cards) → number for sidebar
- [ ] Due 비교 시 날짜만 비교 (시간 무시)

### Tests: LeitnerTests (CRITICAL)
```javascript
LeitnerTests = {
  testMarkCorrect_Level1to2()  // level=2, nextReview=+3d
  testMarkCorrect_Level2to3()  // level=3, nextReview=+7d
  testMarkCorrect_Level3Stay() // level=3, nextReview=+7d
  testMarkIncorrect_Reset()    // level=1, nextReview=+1d
  testMarkIncorrect_FromL3()   // Level 3에서도 Level 1로 리셋
  testIsCardDue_True()         // nextReview in past
  testIsCardDue_False()        // nextReview in future
  testIsCardDue_Today()        // nextReview = 오늘 → due
  testGetDueCards_Order()      // level 1 first
  testNextReviewDates()        // actual Date objects, not strings
  testAddDays_Timezone()       // 타임존 변경해도 정확
  testNormalizeDate()          // 시간 제거 확인
}
```

- [ ] Test: Run `LeitnerTests.runAll()` in console
- [ ] Test: Verify date math (+1d, +3d, +7d) is correct
- [ ] Test: Level never goes above 3 or below 1
- [ ] Test: 타임존 변경해도 날짜 계산 정확

---

## Phase 4: Study Mode (~12 min)
**Status**: [ ] Not Started

### Study Session
- [ ] `app.js`: startStudySession(deckId) → load due cards
- [ ] `app.js`: currentCard, cardIndex, sessionStats
- [ ] `app.js`: flipCard() → show back side
- [ ] `app.js`: nextCard() → advance or complete
- [ ] `app.js`: endSession() → show summary
- [ ] 카드 0개 시 Study 버튼 비활성화 또는 안내 메시지

### Card Flip Animation
- [ ] CSS: .card-container with perspective
- [ ] CSS: .card-front, .card-back with backface-visibility
- [ ] CSS: .flipped rotates 180deg on Y-axis
- [ ] Transition: 0.6s ease-in-out

### Study UI
- [ ] Study view replaces main area
- [ ] Card display: large, centered
- [ ] "Show Answer" button (before flip)
- [ ] "I Know It" / "Review Again" buttons (after flip)
- [ ] Progress bar: X of Y cards
- [ ] Due count badge in sidebar

### Keyboard Shortcuts
- [ ] Space: Flip card / Show answer
- [ ] → (Right Arrow): I know it
- [ ] ← (Left Arrow): Review again
- [ ] Esc: Exit study mode
- [ ] 입력 필드 focus 시 단축키 비활성화

### Session Complete
- [ ] Stats: cards reviewed, correct %, time spent
- [ ] "Study Again" or "Back to Deck" buttons

### Tests: StudyTests
```javascript
StudyTests = {
  testStartSession()        // loads due cards only
  testStartSession_Empty()  // 0개 시 적절한 처리
  testFlipCard()            // toggles flipped state
  testMarkCorrect()         // calls learning.markCorrect
  testMarkIncorrect()       // calls learning.markIncorrect
  testSessionProgress()     // index advances correctly
  testKeyboardShortcuts()   // Space, arrows, Esc work
  testKeyboardInInput()     // input focus 시 비활성화
  testEmptySession()        // handles 0 due cards
}
```

- [ ] Test: Run `StudyTests.runAll()` in console
- [ ] Test: Card flip animation is smooth
- [ ] Test: Keyboard shortcuts work in study mode
- [ ] Test: Session ends and shows stats

---

## Phase 5: Polish & Export (~10 min)
**Status**: [ ] Not Started

### Export/Import
- [ ] Export deck as JSON (deck + cards)
- [ ] Download .json file
- [ ] Import: file input → validate → merge/replace
- [ ] Import validation: required fields, format check
- [ ] **Import 시 ID 충돌 → 새 ID 생성**
- [ ] Import 시 deck 이름 중복 → "이름 (2)" 처리

### Multi-tab Sync (선택)
- [ ] `storage` 이벤트 리스너로 다른 탭 변경 감지
- [ ] 변경 시 데이터 리로드

### Dark Mode
- [ ] Already default, ensure consistency
- [ ] Toggle button in header (optional)
- [ ] Save preference to LocalStorage

### Responsive Design
- [ ] Mobile (320px+): stack sidebar above main
- [ ] Touch targets: 44px minimum
- [ ] Scrollable deck list and card list
- [ ] 카드 100+ 개 시 가상 스크롤 또는 페이지네이션 고려

### Global Keyboard Shortcuts
- [ ] N: New card (focus form)
- [ ] /: Focus search
- [ ] D: Toggle dark mode
- [ ] Esc: Close modal / exit mode

### Empty States
- [ ] No decks: "Create your first deck to get started"
- [ ] No cards: "Add cards to start learning"
- [ ] No due cards: "All caught up! Study all cards?"

### Final Polish
- [ ] Loading states (if needed)
- [ ] Error toasts for failures
- [ ] Confirm dialogs styled

### Tests: ExportTests
```javascript
ExportTests = {
  testExportFormat()      // valid JSON structure
  testImportValid()       // creates deck + cards
  testImportInvalid()     // shows error, no crash
  testImportMerge()       // doesn't overwrite existing
  testImportIdConflict()  // 새 ID 생성 확인
  testImportDupeName()    // "이름 (2)" 처리
  testStorageEvent()      // 다른 탭 변경 감지
}
```

- [ ] Test: Run `ExportTests.runAll()` in console
- [ ] Test: Export → Import round-trip works
- [ ] Test: Responsive on mobile viewport
- [ ] Test: All keyboard shortcuts work

---

## Final Verification Checklist

### Leitner System (CRITICAL)
- [ ] New card starts at Level 1
- [ ] "I know it": 1→2 (+3d), 2→3 (+7d), 3→3 (+7d)
- [ ] "Review again": any level → 1 (+1d)
- [ ] Due cards = nextReview <= now (날짜만 비교)
- [ ] Level 1 cards shown first in study

### Data Integrity
- [ ] Deck names are unique
- [ ] Card edit preserves progress (level, dates)
- [ ] cardCount syncs on add/delete
- [ ] Deck 삭제 시 cards CASCADE 삭제
- [ ] Refresh preserves all data
- [ ] `.trim()` 후 빈 값 검증

### UX
- [ ] Card flip animation smooth (0.6s)
- [ ] Keyboard shortcuts work globally
- [ ] Empty states show helpful messages
- [ ] Delete confirms before action
- [ ] Search debounce 300ms

### Performance
- [ ] No console errors
- [ ] Interactions < 100ms
- [ ] LocalStorage quota handled (80% 경고)
- [ ] JSON 파싱 에러 graceful 처리

### Edge Cases
- [ ] Deck 삭제 → cards도 삭제
- [ ] Import ID 충돌 → 새 ID 생성
- [ ] 빈 값/공백만 입력 → 에러
- [ ] 다른 탭에서 수정 → storage 이벤트 감지
- [ ] 카드 0개 deck Study → 안내 메시지

---

## Test Suites Summary

| Suite | Location | Run Command |
|-------|----------|-------------|
| DeckTests | decks.js | `DeckTests.runAll()` |
| CardTests | cards.js | `CardTests.runAll()` |
| LeitnerTests | learning.js | `LeitnerTests.runAll()` |
| StudyTests | app.js | `StudyTests.runAll()` |
| ExportTests | storage.js | `ExportTests.runAll()` |

**Run All**: `[DeckTests, CardTests, LeitnerTests, StudyTests, ExportTests].forEach(t => t.runAll())`

---

## LocalStorage Schema (v1.0)

```javascript
{
  version: "1.0",
  decks: [
    { id, name, description, created, cardCount }
  ],
  cards: [
    { id, deckId, front, back, level, correctCount, lastReviewed, nextReview, created }
  ],
  settings: {
    darkMode: true,
    sessionLimit: 20,
    autoShuffle: false
  }
}
```
