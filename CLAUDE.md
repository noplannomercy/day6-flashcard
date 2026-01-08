# Flashcard Learning App

## Tech Stack
- HTML5 + Tailwind CSS (CDN) + Vanilla JS (ES6+)
- LocalStorage API for persistence
- Modular JS: app.js, cards.js, decks.js, learning.js, storage.js

## Commands
- Open: `start index.html`
- Test: Browser console (`LeitnerTests.runAll()`, `StorageTests.runAll()`)

## Development Workflow
CRITICAL: Follow Phase-based workflow:
1. Complete each phase fully
2. Test in browser console
3. Commit ONLY if tests pass
4. Update IMPLEMENTATION.md status
5. Continue to next phase

## Git Workflow
Branch: `feature/[name]`, `fix/[name]`
Commit: `feat:`, `fix:`, `test:`, `docs:`

YOU MUST before ANY commit:
- Run Leitner tests (level 1→2→3 transitions)
- Verify nextReview calculations (+1d, +3d, +7d)
- Test due cards filtering
- Check keyboard shortcuts (Space, →, ←)
- Confirm no console errors

## Testing Requirements
ALWAYS write tests FIRST:
- Leitner level transitions (1→2→3, wrong resets to 1)
- nextReview date calculations (+1d, +3d, +7d)
- Due cards filtering (nextReview <= now)
- Card flip animation triggers
- LocalStorage save/load operations
- Keyboard shortcuts (Space, arrows, Esc)

## Code Conventions
- ISO 8601 for ALL dates (`new Date().toISOString()`)
- UUID for IDs (`crypto.randomUUID()`)
- CSS flip animation (transform, backface-visibility)
- 44px minimum touch targets
- Dark mode default

## Critical Rules
IMPORTANT:
- Leitner levels MUST calculate correctly (1→2→3)
- nextReview MUST use actual Date objects, not ticks
- Study mode MUST show only due cards by default

NEVER:
- Allow duplicate deck names
- Lose card progress on edit
- Use setInterval for timing
- Block UI during save

ALWAYS:
- Save after every card review
- Update deck.cardCount on card add/remove
- Show "Are you sure?" for delete actions
- Handle empty states gracefully
