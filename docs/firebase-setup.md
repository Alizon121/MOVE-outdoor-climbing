# Connecting Firebase

The scaffold is ready for your Firebase project. Native config files are git-ignored and picked up
automatically by `app.config.ts` when present. **Prebuild/dev builds fail until both files exist.**

1. In the Firebase console, add an **iOS app** and an **Android app** to your project. Use the
   identifiers from `app.config.ts` (currently `com.move.climbing`), or change them first, since they
   are hard to change after the first store release.
2. Download `GoogleService-Info.plist` (iOS) and `google-services.json` (Android) into the repo root.
3. Enable products: **Authentication** (Email/Password, Apple, Google), **Firestore** (production
   mode), **Storage**.
4. Link the CLI and deploy rules:
   ```bash
   npx firebase-tools login
   npx firebase-tools use --add          # pick your project
   npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage
   ```
5. Build a dev client (Expo Go cannot load native Firebase or MapLibre):
   ```bash
   npx expo run:ios      # or run:android
   ```
6. Local backend for tests: `npx firebase-tools emulators:start`.

Sign in with Apple and Google need extra setup (Apple capability / SHA-1 and the iOS URL scheme),
done when the auth milestone starts.
