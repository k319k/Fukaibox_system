import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./auth";
import { relations } from "drizzle-orm";

// =============================================
// 封解Box Tools
// =============================================

export const toolsApps = sqliteTable("tools_apps", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category"),
    type: text("type").$type<"embed" | "link" | "react" | "html">().notNull(),
    embedUrl: text("embed_url"),
    isPublic: integer("is_public", { mode: "boolean" }).default(false),

    // Analytics
    viewCount: integer("view_count").default(0),
    playCount: integer("play_count").default(0),
    remixCount: integer("remix_count").default(0),

    // Remix Tracking
    remixFrom: text("remix_from"), // Removed self reference here to avoid circular ref issue in DDL if generic

    createdBy: text("created_by")
        .notNull()
        .references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const toolsAppsRelations = relations(toolsApps, ({ one, many }) => ({
    creator: one(users, {
        fields: [toolsApps.createdBy],
        references: [users.id],
    }),
    files: many(toolsFiles),
    remixParent: one(toolsApps, {
        fields: [toolsApps.remixFrom],
        references: [toolsApps.id],
        relationName: "remix_relation"
    }),
}));

export const toolsFiles = sqliteTable("tools_files", {
    id: text("id").primaryKey(),
    appId: text("app_id")
        .notNull()
        .references(() => toolsApps.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const toolsFilesRelations = relations(toolsFiles, ({ one }) => ({
    app: one(toolsApps, {
        fields: [toolsFiles.appId],
        references: [toolsApps.id],
    }),
}));

export const toolsRatings = sqliteTable("tools_ratings", {
    id: text("id").primaryKey(),
    appId: text("app_id")
        .notNull()
        .references(() => toolsApps.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => users.id),
    rating: integer("rating").notNull(), // 1 = 高評価, -1 = 低評価
    comment: text("comment"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

