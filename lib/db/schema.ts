import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// =============================================
// better-auth 用テーブル
// =============================================

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
    image: text("image"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
});

export const accounts = sqliteTable("accounts", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    idToken: text("id_token"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verifications = sqliteTable("verifications", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// =============================================
// 封解Box 独自テーブル
// =============================================

// ロールタイプ: gicho(儀長), meiyo_giin(名誉儀員), giin(儀員), guest(ゲスト), anonymous(未ログイン)
export type RoleType = "gicho" | "meiyo_giin" | "giin" | "guest" | "anonymous";

export const userRoles = sqliteTable("user_roles", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<RoleType>().notNull().default("guest"),
    discordId: text("discord_id"),
    discordUsername: text("discord_username"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const userPoints = sqliteTable("user_points", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" })
        .unique(),
    points: real("points").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const pointHistory = sqliteTable("point_history", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    amount: real("amount").notNull(),
    reason: text("reason").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// =============================================
// 台所（料理システム）関連
// =============================================

export type CookingStatus = "cooking" | "image_upload" | "image_selection" | "download" | "archived";

export const cookingProjects = sqliteTable("cooking_projects", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").$type<CookingStatus>().notNull().default("cooking"),
    createdBy: text("created_by")
        .notNull()
        .default("anonymous")
        .references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const cookingSections = sqliteTable("cooking_sections", {
    id: text("id").primaryKey(),
    projectId: text("project_id")
        .notNull()
        .references(() => cookingProjects.id, { onDelete: "cascade" }),
    // Old columns that exist in production
    title: text("title"),
    description: text("description"),
    order: integer("order"),
    isImageSubmissionAllowed: integer("is_image_submission_allowed", { mode: "boolean" }),
    assignedTo: text("assigned_to"),
    // New columns added by migration
    orderIndex: integer("order_index"),
    content: text("content"),
    imageInstruction: text("image_instruction"),
    referenceImageUrl: text("reference_image_url"),
    allowImageSubmission: integer("allow_image_submission", { mode: "boolean" }),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const cookingImages = sqliteTable("cooking_images", {
    id: text("id").primaryKey(),
    sectionId: text("section_id")
        .references(() => cookingSections.id, { onDelete: "set null" }), // セクション紐付けは任意（未採用時はnull）
    projectId: text("project_id")
        .notNull()
        .references(() => cookingProjects.id, { onDelete: "cascade" }), // プロジェクトには必ず紐づく
    uploadedBy: text("uploaded_by")
        .notNull()
        .references(() => users.id),
    imageUrl: text("image_url").notNull(),
    isSelected: integer("is_selected", { mode: "boolean" }).default(false),
    isFinalSelected: integer("is_final_selected", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const cookingProposals = sqliteTable("cooking_proposals", {
    id: text("id").primaryKey(),
    sectionId: text("section_id")
        .notNull()
        .references(() => cookingSections.id, { onDelete: "cascade" }),
    proposedBy: text("proposed_by")
        .notNull()
        .references(() => users.id),
    proposedContent: text("proposed_content").notNull(),
    status: text("status").$type<"pending" | "approved" | "rejected">().notNull().default("pending"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const kitchenPresence = sqliteTable("kitchen_presence", {
    id: text("id").primaryKey(),
    projectId: text("project_id")
        .notNull()
        .references(() => cookingProjects.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    lastSeenAt: integer("last_seen_at", { mode: "timestamp" }).notNull(),
});

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
    createdBy: text("created_by")
        .notNull()
        .references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

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
