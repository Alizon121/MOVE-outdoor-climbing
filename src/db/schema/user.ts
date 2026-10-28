import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// User data: local-first mirror of Firestore `users/{uid}/...`.
// `updatedAt` is epoch milliseconds; `deleted` is a soft-delete tombstone used by sync.

export const ascents = sqliteTable(
  'ascents',
  {
    id: text('id').primaryKey(),
    routeId: text('route_id').notNull(),
    date: text('date').notNull(), // ISO date, yyyy-mm-dd
    style: text('style', {
      enum: ['onsight', 'flash', 'redpoint', 'pinkpoint', 'repeat', 'attempt'],
    }).notNull(),
    gradeOpinion: text('grade_opinion'),
    rating: integer('rating'), // 1-5
    notes: text('notes'),
    updatedAt: integer('updated_at').notNull(),
    deleted: integer('deleted', { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [index('ascents_route_idx').on(t.routeId), index('ascents_date_idx').on(t.date)],
);

export const projects = sqliteTable(
  'projects',
  {
    id: text('id').primaryKey(),
    routeId: text('route_id').notNull(),
    status: text('status', { enum: ['active', 'sent', 'dropped'] })
      .notNull()
      .default('active'),
    updatedAt: integer('updated_at').notNull(),
    deleted: integer('deleted', { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [index('projects_route_idx').on(t.routeId)],
);

export const lists = sqliteTable('lists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deleted: integer('deleted', { mode: 'boolean' }).notNull().default(false),
});

export const listItems = sqliteTable(
  'list_items',
  {
    listId: text('list_id').notNull(),
    routeId: text('route_id').notNull(),
    position: integer('position').notNull().default(0),
  },
  (t) => [index('list_items_list_idx').on(t.listId)],
);

// Pending writes to push to Firestore, in order.
export const outbox = sqliteTable('outbox', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull(), // e.g. users/{uid}/ascents/{id}
  op: text('op', { enum: ['set', 'delete'] }).notNull(),
  payload: text('payload'), // JSON for `set`
  createdAt: integer('created_at').notNull(),
});

// Key/value store for sync cursors, e.g. `last_synced_at:ascents`.
export const syncState = sqliteTable('sync_state', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
