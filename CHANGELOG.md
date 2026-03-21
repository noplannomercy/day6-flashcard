# Changelog

All notable changes to Flash Cards are documented here.

## [Unreleased] - 2026-03-21

### Fixed

- Add Card modal always showed "Front cannot be empty" validation error even
  when text was present — root cause was duplicate `id="cardFrontInput"` in DOM
  (static hidden form vs modal-generated element). Fixed by scoping querySelector
  to `#addCardForm` in `handleAddCard()`. (ISSUE-001)
- Mobile 375px viewport caused horizontal scroll when a deck was selected —
  header `min-w-fit` sections expanded to 506px. Fixed by adding `overflow-x-hidden`
  to the outer flex container. (ISSUE-002)
- Settings button rendered at 40×40px (below WCAG 2.5.5 minimum). Fixed by
  changing to `min-w-[44px] min-h-[44px]`. (FINDING-001)
- Import button rendered at 42×44px on mobile. Fixed by adding `min-w-[44px]`.
  (FINDING-002)

### Added

- Design audit report (`.gstack/design-reports/`) — score 88→94/100, AI Slop A
- QA report (`.gstack/qa-reports/`) — health score 82→94/100
