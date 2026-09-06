# Sumtrail

An original math facts fluency adventure for kids. Light lanterns with Pip the fox through add, subtract, multiply, and divide — with stars, a number-sense journal, and PIN-protected parent reports.

Sumtrail is a sibling of [Keytrail](https://github.com/jlevins2011/typing-game) (typing) and [Camp Compass](https://github.com/jlevins2011/state-capitals) (US geography). It uses the same forest-camp branding: **Pip the lantern fox**, fox-coat kid profiles, and grown-up reports. Maggie the beagle from the family’s other homeschool games makes a cameo when a trail gets bumpy.

The fox, writing, UI, and fact tips were made for this project. There is no Minecraft, Mario, or other licensed IP.

## Play

Live (after Pages is enabled): [https://jlevins2011.github.io/sumtrail/](https://jlevins2011.github.io/sumtrail/)

Pushes to `main` build the game and publish that URL. GitHub Pages must serve the **`gh-pages`** branch (folder `/`), not the source on `main`.

### GitHub Pages setup

1. Repo **Settings → Pages**.
2. Source: **Deploy from a branch**.
3. Branch: **`gh-pages`**, folder **`/`**.
4. Save. The first successful push to `main` (or **Actions → Deploy GitHub Pages → Run workflow**) publishes the site.

The workflow in `.github/workflows/pages.yml` matches Keytrail: `npm ci`, `npm test`, `npm run build` with `GITHUB_PAGES=true` (base path `/sumtrail/`), then `peaceiris/actions-gh-pages` publishes `./dist`.

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

```bash
npm test
npm run build
```

Progress lives in this browser (`localStorage`). There is no account and no network requirement after the page loads. The app ships a small PWA shell (`manifest.json` + offline cache) so a second visit can still open the last loaded trail.

## How kids learn

At profile setup (or a one-time “Where should we start?” screen), pick a grade so the trail does not always begin in Ember Grove:

1. **K–1 → Ember Grove** — add and subtract within 10.
2. **Grade 2 → Pine Bridge** — add and subtract within 20.
3. **Grade 3 → Multiplying Meadow** — × tables 0–12, starting with 2, 5, and 10, then expanding.
4. **Grade 4 → Division Hollow** — related ÷ facts.
5. **Grade 5+ → Night Sum Summit** — mixed fluency, with an 85% proficiency gate.

Every camp at or below the chosen start stays open for review. Later camps still unlock in order after a campfire clear. Change the starting grade anytime in Settings. Parent reports show the chosen grade and camp.

Each round is timed-but-kind: a lantern slowly dims, but Pip just waits. Correct answers light a lantern and drop a one-line number-sense tip in the journal. Misses show the right answer plus the tip, then move on — kids are not trapped. Stars reward smoothness and accuracy.

## Demo vs full (future hub)

Add `?demo=1` to the URL to play **Ember Grove only** (handy for a future Foxtrail Family hub teaser):

`https://jlevins2011.github.io/sumtrail/?demo=1`

The hub can later unlock later camps and share question banks (math fact lists). Sumtrail keeps stub types in `src/lib/hub.ts` and does **not** need the hub to play.

## Parents

Set a 4-digit PIN on first visit. Reports show the chosen starting grade/camp, facts practiced, accuracy by operation, streak, time-on-task, trail stars, and a printable session history. Data stays on the device.

## Cross-game credits (stub)

When a camp is first cleared, Sumtrail writes an earn event to the shared namespace:

- Key: `foxtrail.credits.v1`
- Shape: `{ version: 1, events: [{ id, amount, source: "sumtrail", campId, childId, at }] }`
- Amounts: Ember Grove 15 · Pine Bridge 20 · Multiplying Meadow 25 · Division Hollow 25 · Night Sum Summit 40

**Lumen Isles** will later spend these credits. This repo only emits earns. Keytrail, Camp Compass, Lumen, and the family hub are not modified here.

## License

All rights reserved unless you choose another license for commercialization.
