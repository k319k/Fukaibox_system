import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// =============================================
// 界域百科事典
// =============================================

export const dictionaryEntries = sqliteTable("dictionary_entries", {
    id: text("id").primaryKey(),
    word: text("word").notNull(),
    reading: text("reading"),
    definition: text("definition").notNull(),
    genre: text("genre"),
    year: integer("year"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const dictionaryRelations = sqliteTable("dictionary_relations", {
    id: text("id").primaryKey(),
    entryId: text("entry_id")
        .notNull()
        .references(() => dictionaryEntries.id, { onDelete: "cascade" }),
    relatedEntryId: text("related_entry_id")
        .notNull()
        .references(() => dictionaryEntries.id, { onDelete: "cascade" }),
});
