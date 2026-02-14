import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./auth";
import { cookingProjects } from "./kitchen";

// =============================================
// YouTube Manager
// =============================================

// YouTube OAuth Tokens (儀長専用)
export const youtubeTokens = sqliteTable("youtube_tokens", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// 予約投稿管理
export const youtubeScheduledVideos = sqliteTable("youtube_scheduled_videos", {
    id: text("id").primaryKey(),
    videoId: text("video_id"), // YouTube側のID（アップロード後に付与）
    title: text("title").notNull(),
    description: text("description"),
    scheduledDate: integer("scheduled_date", { mode: "timestamp" }).notNull(),
    status: text("status").$type<"pending" | "uploaded" | "published" | "failed">().notNull().default("pending"),
    filePath: text("file_path"), // R2へのパス
    thumbnailPath: text("thumbnail_path"),
    cookingProjectId: text("cooking_project_id").references(() => cookingProjects.id),
    createdBy: text("created_by")
        .notNull()
        .references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
