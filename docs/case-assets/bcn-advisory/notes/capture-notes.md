# Barcelona Private Advisory - Capture Notes

## Product Status

Ready for capture.

Core product is frozen for case capture after BCN-QA-01A.

## Core Flow

intent -> lens -> signal -> dossier -> inquiry

## Routes Captured

- `/`
- `/search`
- `/search?intent=family-calm&district=sarria`
- `/p/l-04`
- `/about`
- `/contact`
- `/es/`
- `/es/search?intent=family-calm&district=sarria`
- `/es/p/l-04`
- `/es/contact`

## Recording Path

Target length: 45-70 seconds.

1. Home hero / advisory threshold.
2. Buyer Intent selection.
3. Barcelona Lens interaction: select intent, select district, show matched top recommendation.
4. Click View all matched options into contextual Search.
5. Search Field / Index: show Field cards, switch to Index briefly, save one property.
6. Open property detail and show chamber deck.
7. Switch Overview -> Gallery -> Logic.
8. Open Inspect Gallery, navigate one image, close gallery.
9. Open Dossier and show selected property.
10. Prepare viewing path request.
11. Show Inquiry handoff and copy-ready brief panel.

## Known Limitations

- No backend submission.
- Static demo inventory.
- Legal/contact pages are portfolio placeholders.
- Clipboard behavior may depend on browser permissions.
- Some media loads lazily or only after the relevant Lens/Gallery state is opened.

## Best Proof Moments

- Barcelona Lens Field.
- Field / Index Search.
- Property Chamber Deck.
- Inspect Gallery.
- Private Dossier -> Inquiry handoff.

## Pre-Record Checks

- Browser zoom at 100%.
- No DevTools or browser clutter visible.
- Hero image loaded before recording.
- Lens section interacted with before capture.
- At least two properties saved before Dossier capture.
- Inquiry opened from Dossier for the final handoff shot.
