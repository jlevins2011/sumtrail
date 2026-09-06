# Shared family integration boundary

Sumtrail 2.0 prepares learning evidence for the future family website. It does not implement that website, shared authentication, cloud synchronization, or a spendable cross-game balance.

`src/lib/familyServices.ts` emits one versioned receipt per completed session. Event IDs derive from stable session IDs. Each receipt includes the curriculum revision, local student ID, optional explicitly mapped shared student ID, lesson, active practice time, first-answer accuracy and operation tallies, corrections, stars, and pass status. A trusted application bootstrap may install a `FamilyIdentityProvider`. Never match students by name, accept identity through a query string, or treat the provider as authentication.

Parents can export the selected child's retained learning records from Parent reports. Export is a user-initiated download, not a transmission. Local storage retains the most recent 200 sessions per child. Workshop exploration and guided corrections do not mint independent successes.

The website must authenticate the family and scoped child session, validate evidence server-side, deduplicate event IDs, apply a versioned parent reward policy, and authorize every credit/playtime award. Use an authoritative ledger with idempotent award/spend IDs. Browser-local receipts explicitly mark themselves unverified. They are not proof of work, credit grants, or anti-cheat protection.

Legacy `foxtrail.credits.v1` data stays intact. Sumtrail no longer calls the old credit writer. Campfire rewards are now reusable in-game lantern styles derived from existing camp clears, including old saves. No balances are reset or transferred. A future migration must back up old data, review explicit student mappings, and preserve worlds and student IDs.

Curriculum and fact generation remain in `src/data/curriculum.ts` and `src/lib/facts.ts`; scored rounds in `src/lib/engine.ts`; visual models in `src/lib/encounters.ts`; learner records in `src/lib/storage.ts`. Shared assignment and lesson-library services can replace those read boundaries in a separate integration release without coupling them to the visual models.
