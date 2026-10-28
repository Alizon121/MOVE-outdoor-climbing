# MOVE: Outdoor Climbing App, Plan

App name: **MOVE**. Launch regions: **United States, Canada, Mexico**.

## 1. Goals
- Cross-platform (iOS + Android) outdoor climbing app named MOVE, launching in the U.S., Canada, and Mexico.
- Cover the core of what climbers expect from a logbook/guide app: find crags and routes, log ascents, track projects, see progress.
- Offer offline maps and offline guide data in the free tier.
- Keep running costs low enough to sustain a free tier.

## 2. Stack
| Layer | Choice | Notes |
|---|---|---|
| App | React Native + TypeScript (Expo, dev builds) | Expo gives OTA updates, EAS Build; dev client required for native Firebase and MapLibre |
| Navigation | Expo Router | File-based routing |
| Local DB | SQLite (`expo-sqlite`) + Drizzle ORM | Typed schema, migrations; source of truth for the UI |
| Maps | MapLibre Native (`@maplibre/maplibre-react-native`) | Free, supports offline packs |
| Tiles | Protomaps PMTiles on Cloudflare R2 | No per-request fees; regional downloads |
| Auth | Firebase Auth (`@react-native-firebase/auth`) | Email, Apple, Google |
| User data | Cloud Firestore (`@react-native-firebase/firestore`) | Per-user documents, security rules |
| Files | Cloud Storage for Firebase | User photos; guide bundles on R2 (or Cloud Storage) |
| Server logic | Cloud Functions (TypeScript) | Moderation, validation, App Check enforcement |
| Sync | Local-first outbox over Firestore (see §6) | |
| CI | GitHub Actions + EAS | Lint, typecheck, tests, builds |

Use the native `@react-native-firebase` SDK, not the JS web SDK (the web SDK has no offline persistence in React Native).

## 3. Data sources (no scraping of commercial apps)
- **OpenBeta**: open (CC0) route/crag data; primary seed for areas, crags, routes, grades.
- **OpenStreetMap**: trails, parking, base map (ODbL; attribution required).
- **User contributions**: new routes, corrections, photos, beta, moderated.
- Do not import data from Kaya, Mountain Project, or other sources whose terms prohibit it.

## 3a. Launch regions: U.S., Canada, Mexico
- **Data**: import OpenBeta data for all three countries in milestone 1 and measure coverage per country (routes per area, grade completeness) before committing. Expect uneven coverage, so plan for gaps to be filled by user contributions and OSM crag/trail data.
- **Region bundles**: split by state/province/country subdivision (e.g. US states, Canadian provinces, Mexican states) so downloads stay small; popular destinations (e.g. Red River Gorge, Squamish, Potrero Chico) can get their own bundles.
- **Grades**: support YDS and Font/V-scale (also French/UIAA display conversion); store `grade_raw` plus a normalized value and let users pick a display system. Store both the original and converted grade so mixed-source data stays traceable.
- **Languages**: English, Spanish, and French (Canada) from the start. Use an i18n library (`i18next`) and keep all strings out of components.
- **Units**: metric/imperial toggle (default by locale); route lengths and map scale follow it.
- **Mexico/Canada specifics**: access and closure notes matter (permits, land-owner restrictions, seasonal raptor closures); keep a structured `access_notes` field and show it prominently on crag screens.
- **Legal/privacy**: collect minimal data; review privacy obligations for Canada (PIPEDA, Quebec Law 25) and Mexico (LFPDPPP) alongside U.S. state laws before public launch.
- **Maps**: Protomaps extracts cover all three countries; build bundles per subdivision and measure sizes early.

## 4. Feature scope
**MVP**
1. Auth (email, Apple, Google); anonymous local-only use allowed.
2. Browse/search areas, crags, routes (by name, grade, type, location).
3. Route detail: grade, type (sport/trad/boulder), description, location.
4. Log ascents: date, style (onsight/flash/redpoint/etc.), grade opinion, rating, notes.
5. Projects / to-do lists.
6. Logbook and basic stats (grade pyramid, volume over time).
7. Offline: download an area (map tiles + route data), full use without signal.
8. Sync of user data across devices.

**v1.1**
- Photos on ascents and routes; topo images.
- Friends/following, activity feed.
- Conditions/weather for a crag.
- Contribute new routes and edits, with moderation queue.

**Later**
- Trip planning, partner finding, gym/indoor support, import from other logbooks via user-provided CSV exports.

## 5. Data model

### 5a. Guide data (not in Firestore)
Areas, crags and routes live in the pipeline output, not in a database the app queries remotely. The pipeline imports OpenBeta, normalizes grades, and emits per-region SQLite bundles plus a manifest. Geo and text search run locally in SQLite (R-tree / FTS5).

SQLite tables (read-only on the client):
- `areas` (id, parent_id, name, lat, lng, source, source_id)
- `crags` (id, area_id, name, lat, lng, access_notes)
- `routes` (id, crag_id, name, grade_raw, grade_normalized, type, length_m, description, lat, lng, source)

Manifest (`manifest.json`, static file): list of regions with `id`, `name`, `bbox`, `bundle_url`, `pmtiles_url`, `data_version`, `size_bytes`.

### 5b. User data (Firestore, mirrored in local SQLite)
All user data sits under `users/{uid}`, so security rules are one rule.
- `users/{uid}` profile: display_name, home_region, grade_system_pref, units
- `users/{uid}/ascents/{id}`: route_id, date, style, grade_opinion, rating, notes, updated_at, deleted
- `users/{uid}/projects/{id}`: route_id, status, updated_at, deleted
- `users/{uid}/lists/{id}`: name, route_ids[], updated_at, deleted
- `users/{uid}/media/{id}` (v1.1): route_id, storage_path
- `edits/{id}` (v1.1): user_id, target, patch, status; written by clients, reviewed by moderators
- `guide_patches/{id}` (v1.1): approved edits that the pipeline folds into the next bundle build

Rules sketch: users read/write only `users/{their uid}/**`; `edits` create-only for signed-in users; `guide_patches` writable only by Cloud Functions/admin. Enable App Check. Writes carry `updated_at` (client time, clamped by a rule against server time) and soft-delete via `deleted: true` to support sync.

Firestore access patterns are per-user and small, so cost stays low. Route data is never stored in Firestore.

## 6. Offline and sync design
- **Guide data**: downloaded per region as a versioned SQLite bundle (`data_version` in the manifest), replaced wholesale on update; no per-row sync.
- **User data**: local-first. The UI reads and writes SQLite only; each write also goes into an outbox table. A background task pushes the outbox to Firestore, then pulls documents with `updated_at` greater than `last_synced_at` (per collection). Conflict rule: last-write-wins by `updated_at` per document (adequate for single-user data); deletes via tombstones.
- **Firestore persistence**: keep it enabled for transient resilience, but SQLite stays the source of truth. Spike in milestone 4 whether disabling it simplifies things.
- **Maps**: user picks a region; app downloads the PMTiles extract and registers it with MapLibre. Show size before download; allow deletion.
- Everything in the MVP must work in airplane mode after a region is downloaded.

## 7. Cost model
- Tiles/bundles: static files on R2 (free egress); cost is storage only.
- Firebase: Spark/Blaze free quotas cover early stage; per-read billing is kept low because guide data never touches Firestore and the app reads from SQLite. Set budget alerts on Blaze from day one.
- Photos: client-side resize/compress; per-user storage quota on free tier.
- Revenue options to cover costs: donations, optional supporter badge, affiliate gear links, sponsorships. Nothing core is paywalled.

## 8. Milestones
| # | Milestone | Outcome |
|---|---|---|
| 0 | Setup | Expo + TS repo, dev client with Firebase and MapLibre, lint/test/CI, Firebase project (dev + prod), env handling |
| 1 | Data pipeline | OpenBeta import, grade normalization, region SQLite bundles + manifest generated |
| 2 | Browse | Area/crag/route screens, search, filters, from local SQLite |
| 3 | Logbook | Log ascents, projects, lists, stats; local-first writes |
| 4 | Auth + sync | Firebase Auth, security rules, outbox push/pull, conflict handling, tests (emulator suite) |
| 5 | Offline maps | MapLibre, PMTiles region download manager |
| 6 | Beta | TestFlight + Play internal testing, Crashlytics, privacy-respecting analytics |
| 7 | v1.1 | Photos, social, contributions + moderation via Cloud Functions |

## 9. Repo layout (proposed)
```
MOVE/
  src/
    app/            Expo Router screens
    db/             Drizzle schema, migrations, queries
    sync/           outbox, pull/push, conflict logic
    maps/           MapLibre setup, offline region manager
    features/       ascents, routes, areas, projects, stats
    lib/            firebase init, grades, units
    i18n/           en / es / fr strings
  firebase/         firestore.rules, storage.rules, indexes (firebase.json at repo root)
  functions/        Cloud Functions (TypeScript)
  pipeline/         OpenBeta import + region bundle builder (scripts)
  docs/
```

## 10. Risks and open questions
- **Data coverage**: Canada and Mexico may be thinner than the U.S. in OpenBeta. Measure in milestone 1; if Mexico is sparse, lean on OSM and user contributions and set expectations in the app.
- **Sync complexity**: custom sync is the riskiest piece; spike it in milestone 4. Use the Firebase emulator suite for tests.
- **Firestore limits**: no joins or server-side geo search. Community-wide analytics (popular routes, leaderboards) would need aggregation via Cloud Functions or a later BigQuery export.
- **Vendor lock-in**: Firestore is not portable. Keeping the guide data and pipeline independent of Firebase limits the exposure.
- **Offline map size**: vector tiles per region may be large; test real region sizes early.
- **Moderation**: user-contributed route data needs review tooling and a clear policy.
- **Licensing**: keep an attributions screen (OSM, OpenBeta); confirm OpenBeta terms before launch.
- **Naming/branding**: the name is MOVE. It is a common word, so run a trademark search (U.S., Canada, Mexico) and check App Store / Play Store name availability before investing in branding; the store listing may need a subtitle such as "MOVE: Outdoor Climbing".
