import { defineConfig } from 'drizzle-kit';

// Only user-data tables are migrated by the app. Guide tables ship inside region bundles.
export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: './src/db/schema/user.ts',
  out: './drizzle',
});
