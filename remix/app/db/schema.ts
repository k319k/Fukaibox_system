// Database schema for FukaiBox
// Copied from api/src/schema.ts with no modifications
import { sql, relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ========== Users ==========
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull().unique(),
    displayName: text("display_name"),
    passwordHash: text("password_hash"),
    discordId: text("discord_id").unique(),
    discordUsername: text("discord_username"),
    avatarUrl: text("avatar_url"),
    role: text("role").default("GIIN"), // GUEST, GIIN, GICHO
    isGicho: integer("is_gicho", { mode: "boolean" }).default(false),
    isBlocked: integer("is_blocked", { mode: "boolean" }).default(false),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    blockReason: text("block_reason"),
    points: integer("points").default(0),
    canManageApiKeys: integer("can_manage_api_keys", { mode: "boolean" }).default(false),
    lastSeenAt: text("last_seen_at"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at"),
});

// ========== Sheets ==========
export const sheets = sqliteTable("sheets", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description"),
    creatorId: integer("creator_id").notNull().references(() => users.id),
    isGiinOnly: integer("is_giin_only", { mode: "boolean" }).default(false),
    currentPhase: text("current_phase").default("draft"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at"),
});

// ========== Script Sections ==========
export const scriptSections = sqliteTable("script_sections", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sheetId: integer("sheet_id").notNull().references(() => sheets.id),
    orderIndex: integer("order_index").notNull(),
    content: text("content").notNull(),
    imageInstruction: text("image_instruction"),
    referenceImages: text("reference_images"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at"),
});

// ========== Images ==========
export const images = sqliteTable("images", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sheetId: integer("sheet_id").notNull().references(() => sheets.id),
    sectionId: integer("section_id"),
    uploaderId: integer("uploader_id").notNull().references(() => users.id),
    filePath: text("file_path").notNull(),
    originalFilePath: text("original_file_path"),
    isSelected: integer("is_selected", { mode: "boolean" }).default(false),
    uploadedAt: text("uploaded_at").default(sql`CURRENT_TIMESTAMP`),
});

// ========== Point History ==========
export const pointHistory = sqliteTable("point_history", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    pointsChange: integer("points_change").notNull(),
    reason: text("reason").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ========== Reward Settings ==========
export const rewardSettings = sqliteTable("reward_settings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    settingKey: text("setting_key").notNull().unique(),
    settingValue: integer("setting_value").notNull(),
    updatedAt: text("updated_at"),
});

// ========== API Keys ==========
export const apiKeys = sqliteTable("api_keys", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    keyName: text("key_name").notNull(),
    keyHash: text("key_hash").notNull().unique(),
    usageCount: integer("usage_count").default(0),
    lastUsedAt: text("last_used_at"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
});

// ========== Tool Projects ==========
export const toolProjects = sqliteTable("tool_projects", {
    id: text("id").primaryKey(),
    ownerId: integer("owner_id").notNull().references(() => users.id),
    name: text("name").notNull(),
    description: text("description"),
    thumbnailUrl: text("thumbnail_url"),
    projectType: text("project_type").default("sandbox"), // sandbox, embed
    htmlContent: text("html_content"),
    status: text("status").default("stopped"), // stopped, running
    storageUsedBytes: integer("storage_used_bytes").default(0),
    embedSource: text("embed_source"), // gemini_canvas, gpt_canvas, claude_artifacts
    embedUrl: text("embed_url"),
    viewCount: integer("view_count").default(0),
    isPublic: integer("is_public", { mode: "boolean" }).default(true),
    isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at"),
});

// ========== Tool Votes ==========
export const toolVotes = sqliteTable("tool_votes", {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull().references(() => toolProjects.id),
    userId: integer("user_id").notNull().references(() => users.id),
    isUpvote: integer("is_upvote", { mode: "boolean" }).notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ========== Tool Comments ==========
export const toolComments = sqliteTable("tool_comments", {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull().references(() => toolProjects.id),
    userId: integer("user_id").notNull().references(() => users.id),
    content: text("content").notNull(),
    isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at"),
});

// ========== Drizzle Relations ==========
export const usersRelations = relations(users, ({ many }) => ({
    sheets: many(sheets),
    images: many(images),
    pointHistory: many(pointHistory),
    apiKeys: many(apiKeys),
    toolProjects: many(toolProjects),
    toolVotes: many(toolVotes),
    toolComments: many(toolComments),
}));

export const sheetsRelations = relations(sheets, ({ one, many }) => ({
    creator: one(users, { fields: [sheets.creatorId], references: [users.id] }),
    sections: many(scriptSections),
    images: many(images),
}));

export const scriptSectionsRelations = relations(scriptSections, ({ one }) => ({
    sheet: one(sheets, { fields: [scriptSections.sheetId], references: [sheets.id] }),
}));

export const imagesRelations = relations(images, ({ one }) => ({
    sheet: one(sheets, { fields: [images.sheetId], references: [sheets.id] }),
    uploader: one(users, { fields: [images.uploaderId], references: [users.id] }),
}));

export const pointHistoryRelations = relations(pointHistory, ({ one }) => ({
    user: one(users, { fields: [pointHistory.userId], references: [users.id] }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
    user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}));

export const toolProjectsRelations = relations(toolProjects, ({ one, many }) => ({
    owner: one(users, { fields: [toolProjects.ownerId], references: [users.id] }),
    votes: many(toolVotes),
    comments: many(toolComments),
}));

export const toolVotesRelations = relations(toolVotes, ({ one }) => ({
    project: one(toolProjects, { fields: [toolVotes.projectId], references: [toolProjects.id] }),
    user: one(users, { fields: [toolVotes.userId], references: [users.id] }),
}));

export const toolCommentsRelations = relations(toolComments, ({ one }) => ({
    project: one(toolProjects, { fields: [toolComments.projectId], references: [toolProjects.id] }),
    user: one(users, { fields: [toolComments.userId], references: [users.id] }),
}));
