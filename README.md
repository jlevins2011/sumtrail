# Sumtrail 2.0 — the lantern keepers’ trail

An original math facts adventure with Pip the fox: hands-on workshops, woodland trails, guided corrections, saved progress, campfire keepsakes, and parent reports.

Play: https://jlevins2011.github.io/sumtrail/

## Learn and explore

- **Ember Grove:** build stone groups for addition and send stones downstream for subtraction within 10.
- **Pine Bridge:** extend addition and subtraction to 20.
- **Multiplying Meadow:** plant equal rows and explore tables 0–12.
- **Division Hollow:** share berries equally among baskets.
- **Night Sum Summit:** explore all four operations and finish an 85% mixed fluency gate.

Workshops are untimed exploration. Their models do not award stars or affect reports. Scored trails use independent first answers; mistakes can be rebuilt in a visual model and retried. Successful corrections are recorded separately and never inflate accuracy. Kids can move on without being trapped in a retry.

Pip travels across the lantern bridge as answers arrive. Correct lanterns stay lit; mistakes remain marked. Campfire clears unlock five lantern styles that can be selected at camp and used on trails. Existing camp clears retain their rewards.

Select starting practice, with grade guidance, when adding a child. Earlier camps remain available for review; later scored trails unlock sequentially. `?demo=1` limits the game to Ember Grove.

## Saving and accessibility

Each child and lesson has an independent saved trail: question deck, partial input, answer history, visual-correction state, and active practice time. Open that trail to resume paused. Normal navigation and page hiding save immediately; unexpected process termination can lose up to one second of timing. The game reports storage failures rather than claiming a successful save.

Pause with the button or Escape; leaving the window pauses automatically. Introductions and time away do not count as practice. Keyboard and touch answers, focus indicators, reduced-motion preferences, high contrast, and sound controls are supported. Offline revisits work after the production game has loaded successfully. Fonts and artwork need no external services. The offline cache only manages Sumtrail files.

## Parents and the future family website

Create a four-digit local parent PIN to view operation accuracy, corrections, starting grade, practice time, weak facts, and session history. Reports can be printed or the selected child's retained learning records downloaded as JSON. Local storage retains up to 200 sessions per child.

The PIN discourages accidental entry; it is not account security. There is no shared sign-in or cloud synchronization yet. The versioned learning-receipt boundary prepares for the family website without claiming that browser data can authorize Lumen Isles spending. Old local credit records are preserved, but new campfires award usable lantern styles instead of writing cross-game credits. See [the integration contract](docs/FAMILY-PLATFORM.md).

## Develop and verify

```
npm ci
npm test
npm run dev
```

`npm run build` runs TypeScript checks and creates the static production build. Set `GITHUB_PAGES=true` for the `/sumtrail/` deployment path. GitHub pushes to `main` run tests, build, and publish `dist` to `gh-pages`; Pages should serve that branch at `/`.

The browser tests use Playwright in an isolated profile. Install Playwright separately (`npm install --no-save playwright`) and provide Chrome or `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. Run the production preview with `GITHUB_PAGES=true` after a Pages build, then run:

```
SUMTRAIL_TEST_URL=http://127.0.0.1:4173/sumtrail/ node tests/browser-smoke.cjs
SUMTRAIL_TEST_URL=http://127.0.0.1:4173/sumtrail/ node tests/expedition-browser.cjs
```

`PLAYWRIGHT_MODULE` may point to an existing Playwright installation. The expedition browser suite requires the production service worker for its offline check. Screenshots are written to the operating-system temporary directory.

Unit tests cover curriculum, mathematical models (including zero and equal division), scoring, grade gates, saves, clocks, keepsakes, receipt identity, sound cancellation, and offline cache isolation. Browser tests cover the complete first trail, mistakes and correction, pause/reload, later operations, all workshops, real campfire rewards, journal practice, parent export, settings, small screens, and offline reload.

## Original assets

Pip, the woodland scenery, visual models, and interface are project-owned original work. No Nintendo or other licensed game characters, art, or music are used. All rights reserved unless you choose another license for commercialization.

## 2.0.1 — clearer starts, useful facts, calmer pacing

The starting-practice picker labels within-10 fluency as Grade 1, within-20 fluency as Grade 2, both multiplication and division facts as Grade 3, and the summit as mixed fact review. Tables through 12 are explicitly extensions; this is not a full Grade 4/5 curriculum. Kindergarten within-5 practice is the opening of Ember Grove, not the scope of its whole camp. Existing profile keys and chosen camps remain intact; they are not interpreted as the child's age.

Fresh explorers get an orientation, a non-padding first round within the selected bank, and a first-win route to a hands-on workshop and the next trail. Ordinary trails now lead with core practice and include at most one identity fact per eight questions. The dedicated zero/one multiplication lesson remains available. Existing saved rounds resume their original deck.

The visual thinking allowance is 12 seconds in Ember Grove, 18 in Pine Bridge, 24 in Multiplying Meadow (30 for extension tables), 30 in Division Hollow (36 for extensions), and 36 in Night Sum. The glow fading never expires an answer or fails a player. Smoothness scoring uses the same longer allowance; accuracy gates are unchanged. These durations are gameplay choices, not Common Core requirements.

Alignment references: [1.OA.C.6](https://www.thecorestandards.org/Math/Content/1/OA/), [2.OA.B.2](https://www.thecorestandards.org/Math/Content/2/OA/), and [3.OA.C.7](https://www.thecorestandards.org/Math/Content/3/OA/).

Verify with a fresh explorer: choose Ember Grove, complete its six positive-addend opening facts, visit the workshop from the first win, then use “Ready for a trail: Friendly tens” to continue. Repeat at `?demo=1`; the workshop and next trails stay in Ember Grove. With another fresh explorer, choose mixed review and check the 36-second thinking-glow explanation before starting. The practice picker, settings, and parent reports all describe the same practice placement. `tests/first-session.cjs` covers the first-win route, demo behavior, second-trail continuation, and two-explorer isolation.
