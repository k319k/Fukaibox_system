import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./auth";

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
    isGenerating: integer("is_generating", { mode: "boolean" }),
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
    comment: text("comment"), // 投稿者コメント
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
    status: text("status").$type<"not_participating" | "participating" | "completed">().default("not_participating").notNull(),
    lastSeenAt: integer("last_seen_at", { mode: "timestamp" }).notNull(),
});
