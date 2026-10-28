import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Guide data: read-only on the client. These tables are produced by the pipeline
// (`pipeline/`) and shipped as per-region SQLite bundles, so this file describes the bundle
// layout for typing queries. It is NOT migrated by the app (see drizzle.config.ts).

export const areas = sqliteTable('areas', {
  id: text('id').primaryKey(),
  parentId: text('parent_id'),
  name: text('name').notNull(),
  lat: real('lat'),
  lng: real('lng'),
  source: text('source').notNull(),
  sourceId: text('source_id'),
});

export const crags = sqliteTable('crags', {
  id: text('id').primaryKey(),
  areaId: text('area_id').notNull(),
  name: text('name').notNull(),
  lat: real('lat'),
  lng: real('lng'),
  accessNotes: text('access_notes'),
});

export const routes = sqliteTable('routes', {
  id: text('id').primaryKey(),
  cragId: text('crag_id').notNull(),
  name: text('name').notNull(),
  gradeRaw: text('grade_raw'),
  gradeNormalized: real('grade_normalized'),
  type: text('type', { enum: ['sport', 'trad', 'boulder', 'alpine', 'other'] }).notNull(),
  lengthM: integer('length_m'),
  description: text('description'),
  lat: real('lat'),
  lng: real('lng'),
  source: text('source').notNull(),
});
