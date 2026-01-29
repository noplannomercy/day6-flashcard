# Flash Cards - Learning App

A modern, minimal flashcard learning application with spaced repetition using the Leitner algorithm.

## Features

### Core Functionality
- **Deck Management** - Create, edit, delete card decks with validation
- **Card CRUD** - Add, edit, delete flashcards with front/back content
- **Spaced Repetition** - Leitner algorithm for optimal learning intervals
- **Study Mode** - Interactive card flip with keyboard shortcuts

### Study System (Leitner Algorithm)
| Action | Level Change | Next Review |
|--------|--------------|-------------|
| Correct (Lv.1) | 1 → 2 | +3 days |
| Correct (Lv.2) | 2 → 3 | +7 days |
| Correct (Lv.3) | 3 → 3 | +7 days |
| Incorrect | Any → 1 | +1 day |

### UI/UX
- Dark mode with mint/cyan accent (`#13b499`)
- Card flip animation (3D Y-axis rotation)
- Gradient border shimmer effect
- Responsive design (320px+)
- 44px minimum touch targets

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `N` | New deck |
| `/` | Focus search |
| `Space` | Flip card |
| `→` | I know it |
| `←` | Review again |
| `Esc` | Exit study mode |

### Data Management
- LocalStorage persistence
- Export deck as JSON
- Import with conflict resolution
- Multi-tab synchronization

## Tech Stack

- **Frontend**: HTML5 + Tailwind CSS (CDN) + Vanilla JavaScript (ES6+)
- **Storage**: LocalStorage API
- **Fonts**: Inter (Google Fonts)
- **Icons**: Material Symbols Outlined
- **Design**: Generated with [Stitch](https://stitch.withgoogle.com)

## Quick Start

### Run the App
```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

Or simply double-click `index.html` in your file explorer.

### Run Tests
Open browser console (F12) and run:
```javascript
// Run all test suites
[DeckTests, CardTests, LeitnerTests, StudyTests, ExportTests, StorageTests]
  .forEach(suite => suite.runAll())
```

## Project Structure

```
day6-flashcard/
├── index.html              # Main app (HTML + Tailwind + CSS animations)
├── js/
│   ├── app.js             # UI logic, event handlers, views
│   ├── decks.js           # Deck CRUD + validation
│   ├── cards.js           # Card CRUD + search/filter
│   ├── learning.js        # Leitner algorithm + date utilities
│   └── storage.js         # LocalStorage + export/import
├── docs/
│   ├── DESIGN.md          # Design system documentation
│   └── ...
├── specs/
│   ├── PRD.md             # Product requirements
│   └── IMPLEMENTATION.md  # Implementation plan
├── CLAUDE.md              # Development instructions
└── README.md              # This file
```

## Design System

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#13b499` | Buttons, accents |
| Background | `#11211e` | Main background |
| Card | `#1a2c29` | Card surfaces |
| Surface | `#244741` | Secondary buttons |
| Coral | `#fb7185` | Review/wrong |
| Text Muted | `#93c8bf` | Secondary text |
| Text Subtle | `#5d7f79` | Hints, placeholders |

### Typography
- **Font**: Inter (400, 500, 600, 700, 800)
- **Card Text**: 48px-72px, extrabold
- **Body**: 14px-16px, regular

See [docs/DESIGN.md](docs/DESIGN.md) for complete design documentation.

## Data Schema

### Deck
```javascript
{
  id: "uuid",
  name: "Deck Name",
  description: "Optional description",
  created: "2024-01-01T00:00:00.000Z",
  cardCount: 10
}
```

### Card
```javascript
{
  id: "uuid",
  deckId: "deck-uuid",
  front: "Question",
  back: "Answer",
  level: 1,              // 1-3
  correctCount: 0,
  lastReviewed: null,
  nextReview: "2024-01-01T00:00:00.000Z",
  created: "2024-01-01T00:00:00.000Z"
}
```

### Export Format
```javascript
{
  version: "1.0",
  exportDate: "2024-01-01T00:00:00.000Z",
  deck: { /* deck object */ },
  cards: [ /* array of cards */ ]
}
```

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome/Edge | Full |
| Firefox | Full |
| Safari | Full |
| Mobile | Full (320px+) |
| Private Mode | LocalStorage may be disabled |

## Accessibility

- Keyboard navigation support
- Focus ring indicators
- `prefers-reduced-motion` support
- Minimum 44px touch targets
- High contrast text colors

## Screenshots

### Welcome Screen
Dark themed welcome screen with deck creation prompt.

### Study Mode
- Large flashcard with 3D flip animation
- Gradient border shimmer effect
- Progress indicator and stats
- Keyboard shortcut hints

### Deck Management
- Sidebar with deck list and due counts
- Search and filter cards
- Level badges (Lv.1, Lv.2, Lv.3)

## Development

### Before Committing
1. Run all test suites in browser console
2. Manual verification:
   - Create deck → add cards → study
   - Test keyboard shortcuts
   - Export/import deck
   - Multi-tab sync
   - Responsive design check
3. Commit only if all tests pass

### Git Conventions
- **Branches**: `develop`, `feature/*`, `fix/*`
- **Commits**: `feat:`, `fix:`, `test:`, `docs:`

## Future Enhancements

- [ ] Dark/Light mode toggle
- [ ] Audio pronunciation
- [ ] Rich text / images in cards
- [ ] Cloud sync (Firebase/Supabase)
- [ ] Statistics dashboard
- [ ] SM-2 / FSRS algorithm options
- [ ] PWA / Offline support

## License

MIT License - Educational project for learning web development.

---

Built with [Claude Code](https://claude.ai/code)
