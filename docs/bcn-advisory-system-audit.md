# Barcelona Private Advisory - System Audit / Portfolio Readiness

Audit date: 2026-05-15  
Project root: `spain-costas-advisory`  
Status covered: BCN-01 through BCN-08F

Update 2026-05-18:

- Current operational status is tracked in `docs/2026-05-16-bcn-advisory-worklog.md`.
- BCN-12R-08 Barcelona Lens Field Final Production Pass is implemented and stabilized.
- BCN-LENS-02 and BCN-LENS-03 are complete: Lens now behaves as scalable decision intelligence, with Search as the full inventory surface and Dossier as selected output.
- BCN-HOME-01 is complete and accepted: the final Home CTA is now an advisory handoff, not a placeholder block.
- BCN-HOME-02B Home Final Micro Polish is complete: Home is **Ready** as the flagship page.
- Private Search, Dossier and Start private search CTA behavior has been restored after a client-side trigger regression.
- Header journey strip has been removed from render to reduce navigation noise.
- Fullscreen Lens now renders above the page shell/header through a document-body portal and includes a visible top-right close action.
- Latest technical verification: `npx tsc --noEmit --pretty false` passed and `npm run build` passed with 52 pages generated.
- Remaining work: `/search` and `/es/search` review, followed by page-by-page QA and portfolio capture.

## 2026-05-18 BCN-HOME-02 Home QA Result

Audit scope:

```txt
/
/es/
Hero
Buyer Intent
Barcelona Lens Field
Matched recommendations rail
Curated Property Field
Private Shortlist Dossier preview
Advisory Method
Final CTA
Footer
Header / RightSideNav
```

Status after BCN-HOME-02:

```txt
Home = Almost ready
```

Status after BCN-HOME-02B:

```txt
Home = Ready
```

Top issues:

- ES Home still has a few uppercase micro-labels without accents, for example `RUTA DE ADQUISICION` and `INTENCION -> LENTE`.
- `ShortlistWidget` still contains small ES copy issues such as `Dossier vacio` and `Comparacion de trade-offs`.
- Advisory Method is useful but still slightly table-like compared with the stronger Lens, Dossier and final handoff sections.
- Mobile structure is responsive in code, but a final 390px screenshot pass is still needed before capture.
- Footer is transparent and industry-grade, but the transition immediately after the final CTA may benefit from a small rhythm/spacing check.

Top strengths:

- Hero, Buyer Intent, Lens, Property Field, Dossier and final CTA now read as one coherent acquisition journey.
- Lens no longer behaves like cramped inventory; it surfaces top matches and routes full ranked inventory to Search.
- Final CTA now closes the page as `Intent -> Lens -> Signal -> Dossier -> Action`.
- Dossier and Inquiry handoff remain connected through existing `data-open-shortlist` and `data-open-inquiry` triggers.
- EN/ES structure is aligned, and core Spanish accents are present in Header, Footer, Lens, Search and final CTA.

BCN-HOME-02B resolution:

- ES Home micro-label accents were corrected.
- ShortlistWidget ES copy was polished.
- Advisory Method now uses a softer memo/readout rhythm instead of a table-like row stack.
- Footer transition after the final CTA is calmer.
- Mobile 390px sanity was checked with a headless screenshot and small wrapping guards were added.

## 1. Current Positioning

Barcelona Private Advisory is now positioned as a **Private Property Intelligence System** for high-intent Barcelona property buyers.

Core formula:

```txt
buyer intent -> district lens -> property signal -> curated shortlist -> advisory action
```

The product is no longer framed as a listing portal. It is a premium advisory interface that turns broad browsing into a structured acquisition path: clarify buyer intent, make district logic visible, explain why each property belongs, build a shortlist dossier and prepare a viewing-path request.

The strongest final product idea is not "more inventory." It is **less noise, more decision clarity**.

## 2. Final Route Map

| Route | Role | Current status | Key components | EN/ES parity | Known issue |
| --- | --- | --- | --- | --- | --- |
| `/` | Modern English advisory home. Establishes positioning, hero, Lens, method and final advisory handoff. | Ready | `BcnAdvisoryHome.astro`, `BarcelonaLensSystem`, `Header`, `ShortlistWidget`, `AdvisoryInquiryPanel` | EN source route | Closed after BCN-HOME-02B; revisit only for bugs or mobile-specific regressions. |
| `/es/` | Spanish advisory home using the same shared home shell. | Ready | `BcnAdvisoryHome.astro` with `lang="es"`, `BarcelonaLensSystem` | At parity with `/` | Closed after BCN-HOME-02B; ES micro-label accents corrected. |
| `/search` | Private Search Surface: buyer brief controls and image-led advisory-ranked candidate cards. | Ready | `SearchExperience.tsx`, `ShortlistToggle`, `AdvisoryInquiryPanel` event trigger | EN source route | Good balance after BCN-08B.1; deeper trade-off detail intentionally moved to detail/dossier. |
| `/es/search` | Spanish Private Search Surface. | Ready | `SearchExperience.tsx` with `lang="es"` | At parity with `/search` | Search context and main labels now use accented Spanish; full page review is the next route-specific task. |
| `/about` | Advisory Method / product proof page. | Ready | Static Astro page, `bcnMedia`, `bcnLensMedia` | EN source route | Page is structurally strong; typography density could be polished later. |
| `/es/about` | Spanish Advisory Method page. | Ready | Separate Astro page mirroring EN structure | At parity | Same minor typography/content density note. |
| `/contact` | Advisory Handoff page for local copy-ready viewing request flow. | Ready | Static Astro page, `AdvisoryInquiryPanel` trigger, media registry | EN source route | No backend by design. |
| `/es/contact` | Spanish Advisory Handoff page. | Ready | Separate Astro page mirroring EN structure | At parity | No backend by design. |
| `/p/[id]` | English property detail as private acquisition file. | Ready | `PropertyShowcase.tsx`, `Lightbox.tsx`, `AdvisoryInquiryPanel`, `useShortlist` | EN source route | Gallery still includes legacy `/demo/listings/...` static fallback frames. Not a visible UI blocker. |
| `/es/p/[id]` | Spanish property acquisition file. | Ready | `PropertyShowcase.tsx` with `lang="es"`, localized advisory helper | At parity | Same static demo-gallery artifact; advisory field values are localized via `advisoryEs`. |

Additional routes exist for district pages:

- `/district/[slug]`
- `/es/district/[slug]`

They are not the main upgraded product path, but they still build and can remain as supporting content or be reviewed in a later district-content polish pass.

## 3. Implemented System Modules

### Buyer Intent Surface

Implemented primarily in `src/components/islands/BarcelonaLensSystem.tsx` and `src/data/barcelonaLens.ts`.

It exposes buyer-intent states such as family calm, sea light, investment logic, design renovation, privacy and walkable daily life. The intent changes the active district recommendation context and the featured property recommendation logic.

It also appears in `/search` as brief controls through `SearchExperience.tsx`, where intent becomes a practical filter/ranking input.

### Barcelona Lens Field System

Implemented in:

- `src/components/islands/BarcelonaLensSystem.tsx`
- `src/data/barcelonaLens.ts`
- `src/lib/getBarcelonaLensCopy.ts`
- `src/lib/resolvePropertyRecommendations.ts`
- `src/data/bcnLensMedia.ts`

The Lens includes:

- active intent state;
- active district state;
- district nodes;
- district intelligence panel;
- intent/district localization layer;
- Lens media layer;
- deterministic property matching;
- advisory path and request-viewing CTA.

The system connects intent and district to property recommendations without changing stable IDs or matching keys.

### Product Object Surface

Implemented through `src/data/listings.ts`, `src/lib/resolvePropertyRecommendations.ts`, `BarcelonaLensSystem.tsx` and `SearchExperience.tsx`.

Listings are now recommendation objects, not plain inventory rows. Each listing carries:

- `districtId`
- `districtLabel`
- `intentIds`
- `bestFor`
- `signal`
- `tradeOff`
- `advisorReason`
- `viewingReadiness`
- `shortlistPriority`
- `acquisitionNote`
- `riskNote`
- `nextAction`
- optional `advisoryEs`

This creates the core product logic: why this property, for whom, why now, what risk, what action.

### Property Detail Chamber

Implemented in `src/components/islands/PropertyShowcase.tsx`.

The detail view now behaves as a **private acquisition file**:

- editorial image plane;
- title and meta hierarchy;
- advisor memo as primary content;
- advisory signals block;
- acquisition logic;
- gallery trigger;
- request viewing path;
- save to dossier;
- EN/ES advisory value support.

The page no longer reads as a generic property-detail layout.

### Cinematic Inspect Gallery Chamber

Implemented in `src/components/islands/Lightbox.tsx` and triggered from `PropertyShowcase.tsx`.

The lightbox was upgraded into a private inspection chamber:

- `role="dialog"` and `aria-modal`;
- large active image plane;
- advisor panel;
- best-for/signal/trade-off/readiness context;
- request viewing and save actions;
- Escape close;
- ArrowLeft / ArrowRight navigation;
- focus return;
- body scroll lock;
- reduced-motion support via `useReducedMotion`;
- mobile stacking.

This makes gallery inspection part of the advisory decision process instead of a generic photo modal.

### Private Shortlist Dossier

Implemented in:

- `src/components/islands/ShortlistWidget.tsx`
- `src/components/islands/ShortlistToggle.tsx`
- `src/hooks/useShortlist.ts`
- `src/lib/shortlistStore.ts`

The storage key remains:

```txt
sc_shortlist_v1
```

The storage shape remains `id[]`, which is good for stability.

The dossier now includes:

- selected count;
- highest readiness;
- top priority;
- district spread;
- next action;
- enriched saved-property rows;
- comparison block;
- copy dossier summary;
- copy dossier link;
- query hydration via `?shortlist=...`;
- open-on-query flow via current UI events.

This is one of the strongest business features in the project.

### Advisory Inquiry Flow

Implemented in:

- `src/components/islands/AdvisoryInquiryPanel.tsx`
- CTA triggers in header, home, search, Lens, property detail, gallery, dossier and contact.

The inquiry panel accepts context from:

- hero/header;
- Lens/acquisition board;
- search card;
- property detail;
- gallery chamber;
- dossier;
- contact handoff page.

It provides:

- context summary;
- buyer notes;
- timing selector;
- contact fields;
- copy-ready brief;
- email/WhatsApp draft buttons only if real targets are configured;
- EN/ES labels;
- Escape close;
- focus management;
- local-only privacy messaging.

It is intentionally not a backend form.

### Living Atmosphere / Visual Climate

Implemented across global styles and major components.

The visual climate uses:

- porcelain;
- limestone;
- graphite;
- sea-glass accents;
- thin lines;
- editorial image planes;
- restrained motion;
- calm spacing.

It avoids the dark-tech trap and avoids generic real-estate portal language. The product reads as light luxury advisory rather than catalog marketplace.

### Media Registry / Lens Media Registry

Implemented in:

- `src/data/bcnMedia.ts`
- `src/data/bcnLensMedia.ts`
- `public/media/bcn-advisory/`
- `public/media/bcn-advisory/media-manifest.json`
- `public/media/bcn-advisory/lens/lens-media-manifest.json`
- `scripts/prepare-bcn-media.mjs`
- `scripts/prepare-bcn-lens-assets.mjs`

The project uses prepared WebP assets and keeps source backups in `_source` folders.

The registry pattern is a strong reusable production pattern: components import data objects rather than hardcoding long media paths.

### EN/ES Localization Layer

Implemented in:

- `src/data/listings.ts` via `advisoryEs`;
- `src/lib/getListingAdvisoryCopy.ts`;
- `src/data/barcelonaLens.ts` via `intentEs` and `lensEs`;
- `src/lib/getBarcelonaLensCopy.ts`;
- `BcnAdvisoryHome.astro`, route-specific pages and interactive islands via `lang`.

The stable IDs remain un-translated:

- listing IDs;
- district IDs;
- intent IDs;
- route params;
- storage keys;
- media paths.

That is the correct architecture: translate user-facing values, preserve machine identifiers.

## 4. Business Outcome

The product now proves a commercially coherent high-ticket real-estate interface:

- It reduces listing noise.
- It makes buyer intent explicit.
- It moves location from a filter into district-first advisory logic.
- It frames each property as an advisory object.
- It turns shortlist into a business feature, not a saved-items drawer.
- It converts interest into a copy-ready viewing request.
- It supports EN/ES premium buyer flows.
- It raises perceived value for boutique agencies, buyer advisors, relocation consultants, investment consultants and developers.

The key business proof is that the interface sells **selection logic**, not just photography.

## 5. Reusable Modules

| Module / Pattern | Reusable? | Reuse target | Notes |
| --- | --- | --- | --- |
| Barcelona Lens Field System | Reusable core candidate | Real estate, destination advisory, retail location strategy, relocation tools | Needs data abstraction, but interaction pattern is strong. |
| Product Object Surface | Reusable core candidate | Any high-ticket recommendation product | The `bestFor/signal/tradeOff/risk/readiness` schema is broadly useful. |
| Cinematic Inspect Gallery Chamber | Reusable core candidate | Real estate, hospitality, luxury product, architecture portfolios | Needs content adapter for advisor panel. |
| Private Shortlist Dossier | Reusable core candidate | Buyer advisory, B2B procurement, travel planning, interior sourcing | Strongest reusable business module. |
| Advisory Inquiry Flow | Reusable core candidate | Any advisory or consultative sales product | Local copy-ready mode is useful before backend integration. |
| Media registry pattern | Reusable core candidate | All media-heavy Studio projects | Registry + manifest + source backup is production-friendly. |
| EN/ES advisory localization helper | Vertical-specific preset | Multilingual advisory products | The additive `advisoryEs` pattern is safe and reusable. |
| Search Surface candidate cards | Vertical-specific preset | Curated inventory and recommendation surfaces | Useful where search should not feel like a marketplace. |
| Advisory Method page pattern | Reusable content pattern | Portfolio/product proof pages | Good structure for explaining systems, not just features. |
| Advisory Handoff contact pattern | Reusable content pattern | Local-only or pre-backend product demos | Honest, privacy-aware contact alternative. |

## 6. Local-Only Project Parts

These should remain specific to Barcelona Private Advisory:

- Barcelona district names and district logic.
- Buyer-intent wording tailored to Barcelona residential acquisition.
- Generated Barcelona property media and Lens media.
- The current 9-listing static dataset.
- Route naming such as `/p/[id]` and `/es/p/[id]`.
- Spanish/English content layer.
- The current static/local inquiry assumptions.
- The static `/demo/listings/...` gallery asset set still referenced in listing gallery arrays.
- Current market copy around Barcelona, terrace light, Eixample, Gracia, Sarria, Diagonal Mar and Pedralbes.

## 7. Quality Gates

| Gate | Result | Note |
| --- | --- | --- |
| Purpose | Pass | The product has a clear advisory positioning and no longer reads as a generic listing portal. |
| Click-first UX | Pass | Core actions are clickable: intent, district, save, dossier, gallery, inquiry. |
| Behavior logic | Pass | Intent/district matching, shortlist storage and inquiry context are deterministic and understandable. |
| Atmosphere | Pass | Porcelain/limestone/graphite climate is coherent and premium. |
| Motion | Pass | Motion is restrained, mostly dialog/gallery transitions, with reduced-motion consideration. |
| Performance | Partial | Build passes and WebP assets are used, but no Lighthouse/performance capture has been run yet. |
| Mobile | Partial | Components are designed responsively, but final manual mobile screenshot QA is still needed. |
| Accessibility | Partial | Dialog roles, buttons and focus states exist in key flows; full screen-reader and keyboard audit is still pending. |
| Privacy | Pass | Inquiry/contact flow is local-only and does not claim automatic sending. |
| Content proof | Pass | Advisory content exists across listings, Lens, dossier, detail, inquiry and EN/ES. |
| Business proof | Pass | The product demonstrates a convincing consultative sales path. |
| Portfolio proof | Partial | Product is ready to package, but screenshots, recording, case copy and production URL are still needed. |

## 8. Known Limitations / Future Version

Known limitations:

- No backend submission.
- No real CRM integration.
- No real email sending.
- No real calendar booking.
- No live inventory CMS.
- No real WhatsApp target unless configured.
- Static generated property data.
- Static generated property media.
- Legacy `/demo/listings/...` gallery assets are still present as local static imagery.
- No analytics or lead tracking.
- No real legal/due-diligence engine.
- No live availability, pricing, fee or document validation.
- No automated SEO/content scaling pass beyond existing static routes.

Future version options:

- Connect listings to CMS or property feed.
- Add real inquiry submission.
- Add CRM/email/calendar/WhatsApp handoff.
- Add analytics for Lens, shortlist and inquiry conversion.
- Add performance/Lighthouse optimization pass.
- Add investor-specific variant.
- Add developer-sales variant.
- Add separate Villa Advisory product.
- Replace remaining static demo-gallery asset namespace with the final media registry.

## 9. Portfolio Case Readiness

Readiness: **Ready**

Reasoning:

The product is strong enough to become a portfolio case. It has a complete advisory journey:

```txt
Home -> Lens -> Property recommendation -> Detail chamber -> Gallery inspection -> Dossier -> Inquiry brief
```

It also has bilingual EN/ES structure, media registries, curated property logic, a contact handoff page and a method page that explains the product idea.

The Home route is ready. The broader portfolio package still needs capture and proof:

- final screenshots;
- short screen recording;
- case copy;
- production URL;
- mobile screenshots;
- interaction GIF/video of Lens -> Dossier -> Inquiry;
- performance sanity check;
- final manual QA;
- optional visual polish for dense About typography;
- optional cleanup of `/demo/listings/...` gallery asset naming.

## 10. Suggested Portfolio Case Narrative

Title options:

- Barcelona Private Advisory
- Private Property Intelligence System
- Barcelona Property Advisory Interface

Subtitle options:

- A district-first advisory interface for premium Barcelona property buyers.
- Turning buyer intent into district intelligence, curated shortlist and viewing path.
- A private acquisition flow for high-ticket real-estate decisions.

Portfolio summary:

Barcelona Private Advisory is a premium front-end advisory system for high-intent Barcelona property buyers. Instead of presenting inventory as a catalog, the interface starts with buyer intent, translates it through a district Lens, frames properties as advisor-selected objects, builds a private shortlist dossier and prepares a copy-ready viewing request. The project demonstrates how a boutique real-estate firm or buyer advisor could turn browsing into a calmer, higher-trust acquisition journey.

Suggested case sections:

### Problem

High-ticket real-estate buyers are often given too many similar listings and too little decision logic. District fit, lifestyle constraints, trade-offs and viewing priority are usually hidden behind catalog grids.

### Approach

Design the experience as an advisory system rather than a portal: start from intent, make district logic visible, explain property fit, then move the buyer toward a shortlist and viewing request.

### System

The system includes Buyer Intent Surface, Barcelona Lens Field, Product Object Surface, Property Detail Chamber, Cinematic Inspect Gallery, Private Shortlist Dossier and Advisory Inquiry Flow.

### Key Interactions

- Select buyer intent.
- Explore district Lens.
- Review featured recommendation.
- Save property to dossier.
- Inspect gallery.
- Compare shortlist.
- Copy inquiry brief.

### Outcome

The result is a premium advisory interface that sells clarity and selection quality rather than listing volume.

### Stack / Production Facts

- Astro
- React islands
- Tailwind CSS v4
- Motion
- Static routes
- LocalStorage shortlist
- WebP media registry
- EN/ES additive localization layer
- Local-only inquiry handoff

### Reusable Patterns

- Advisory object schema
- Lens field system
- Dossier drawer
- Inquiry panel
- Media registry
- Additive localization helper
- Image-led candidate cards

## 11. Final Score

Total: **89 / 100**

| Category | Max | Score | Note |
| --- | ---: | ---: | --- |
| Strategy / positioning | 15 | 14 | Very clear advisory positioning; strong difference from portals. |
| Behavior system | 15 | 14 | Lens, recommendation, dossier and inquiry form a coherent path. |
| UX / click-first | 15 | 13 | Strong interactions; final manual mobile QA still needed. |
| Visual / atmosphere | 12 | 11 | Premium and coherent; About page typography could still be refined. |
| Motion / transitions | 10 | 8 | Restrained and useful; not deeply choreographed everywhere. |
| Performance / media | 10 | 8 | WebP registry is strong; needs Lighthouse/performance capture. |
| Accessibility / privacy | 10 | 8 | Good dialog/focus basics and local-only privacy; full a11y audit pending. |
| Reusable value | 8 | 8 | Several modules are strong Brenych Studio candidates. |
| Business / portfolio proof | 5 | 5 | Clear commercial narrative and case potential. |

## 12. Next Recommended Task

Recommended next task:

```txt
BCN-10 - Portfolio Case Packaging / Screenshot + Case Copy
```

Top remaining tasks:

1. Capture desktop, tablet and mobile screenshots for `/`, `/es/`, `/search`, `/p/l-04`, dossier and inquiry.
2. Record a short interaction flow: Lens -> property recommendation -> dossier -> inquiry brief.
3. Write the public portfolio case copy from this audit.
4. Run a performance sanity check/Lighthouse pass after deployment or preview.
5. Do final manual QA on mobile and keyboard flows before publishing.

Build check:

```txt
npm run build
```

Result: pass. `npm run build` completed successfully after this document was created; Astro generated 40 pages.
