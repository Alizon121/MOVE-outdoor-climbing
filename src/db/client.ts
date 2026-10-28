import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema/user';

// SQLite is the source of truth for the UI; Firestore is synced from/to it (see src/sync).
const sqlite = openDatabaseSync('move-user.db', { enableChangeListener: true });

export const db = drizzle(sqlite, { schema });
