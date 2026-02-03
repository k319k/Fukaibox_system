import { integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const apiKeys = pgTable('api_keys', {
    id: uuid('id').defaultRandom().primaryKey(),
    key: text('key').notNull().unique(),
    ownerId: text('owner_id').notNull(),
    name: text('name').notNull(),
    permissions: text('permissions').notNull(), // JSON string "read:points,write:points" etc
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userPoints = pgTable('user_points', {
    userId: varchar('user_id', { length: 255 }).primaryKey(), // Simple string ID from main app
    points: integer('points').default(0).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pointHistory = pgTable('point_history', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: varchar('user_id', { length: 255 }).notNull(),
    amount: integer('amount').notNull(),
    reason: text('reason').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
