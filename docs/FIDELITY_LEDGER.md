# Visual fidelity ledger

Accepted concepts:

- Desktop: `docs/design/campaign-studio-desktop.png`
- Mobile: `docs/design/campaign-studio-mobile.png`

Latest implementation captures:

- Desktop: `output/playwright/campaign-studio-desktop.png`
- Mobile: `output/playwright/campaign-studio-mobile.png`

## Comparison

| Area | Accepted intent | Implemented result |
| --- | --- | --- |
| Desktop frame | Fixed brief composer beside a spacious result canvas | Preserved with a 428 px maximum composer and fluid result canvas |
| Information order | Concept, three copy variants, checklist, visuals, then readiness | Preserved exactly; concept also includes its strategy name and rationale |
| Visual language | White workspace, restrained rules, blue actions, green success, amber partial state | Preserved with reusable design tokens and accessible status text |
| Readiness view | Direct-labeled horizontal percentage bars | Preserved and supplemented by a screen-reader-only data table |
| Mobile flow | Brief first, one-column result sections, export at the end | Preserved; the desktop export action is hidden and a full-width mobile action is shown |
| Generated images | Clear creative direction with partial-state guidance | Preserved with generated, failed, and unavailable states plus prompt text |
| Interaction states | Loading, error, empty, completion, checklist progress | Implemented; inline brief validation was also added |

## Deliberate deviations

- The approved mobile concept used a shortened input model. The implementation retains all required desktop fields on mobile so the product brief remains complete.
- The implementation shows channel applicability under each copy variant and evidence under every readiness bar; these additions make generated output easier to audit.
- Demo imagery represents the hydration brief used for browser validation rather than the fashion placeholder used in the early mobile concept.

## Browser verification

- Desktop: 1440 × 1000 CSS pixels, no console errors or horizontal overflow.
- Mobile: 390 × 844 CSS pixels, no horizontal overflow.
- Verified: exactly three copy variants, four readiness rows, two image cards, checklist interaction, inline validation, and mobile export visibility.
