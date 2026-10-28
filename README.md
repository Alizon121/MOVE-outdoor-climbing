# MOVE

Outdoor climbing app (iOS + Android) for the U.S., Canada, and Mexico. See [PLAN.md](PLAN.md).

## Stack
Expo (React Native, TypeScript) · Expo Router · SQLite + Drizzle · Firebase (Auth, Firestore,
Storage, Functions) · MapLibre.

## Getting started
```bash
npm install
# connect Firebase first: docs/firebase-setup.md
npx expo run:ios        # or run:android (dev client required)
```

## Scripts
| Command | Purpose |
|---|---|
| `npm run lint` / `typecheck` / `test` | Checks run in CI |
| `npm run db:generate` | Generate a Drizzle migration after editing `src/db/schema/user.ts` |
| `npm run format` | Prettier |

## Layout
- `src/app` routes (Expo Router) · `src/db` schema + client · `src/sync` outbox sync (milestone 4)
- `src/maps` MapLibre + offline regions (milestone 5) · `src/features` feature modules
- `src/i18n` en/es/fr · `src/lib` shared helpers
- `firebase/` rules and indexes · `functions/` Cloud Functions · `pipeline/` OpenBeta import (milestone 1)
# MOVE-outdoor-climbing
