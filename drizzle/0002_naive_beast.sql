CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`permissions` text NOT NULL,
	`expires_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_key_unique` ON `api_keys` (`key`);--> statement-breakpoint
CREATE TABLE `kitchen_presence` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'not_participating' NOT NULL,
	`last_seen_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `cooking_projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP INDEX "api_keys_key_unique";--> statement-breakpoint
DROP INDEX "sessions_token_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "user_points_user_id_unique";--> statement-breakpoint
ALTER TABLE `cooking_sections` ALTER COLUMN "order_index" TO "order_index" integer;--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_points_user_id_unique` ON `user_points` (`user_id`);--> statement-breakpoint
ALTER TABLE `cooking_sections` ALTER COLUMN "content" TO "content" text;--> statement-breakpoint
ALTER TABLE `cooking_sections` ALTER COLUMN "allow_image_submission" TO "allow_image_submission" integer;--> statement-breakpoint
ALTER TABLE `cooking_sections` ALTER COLUMN "created_at" TO "created_at" integer;--> statement-breakpoint
ALTER TABLE `cooking_sections` ALTER COLUMN "updated_at" TO "updated_at" integer;--> statement-breakpoint
ALTER TABLE `cooking_sections` ADD `title` text;--> statement-breakpoint
ALTER TABLE `cooking_sections` ADD `description` text;--> statement-breakpoint
ALTER TABLE `cooking_sections` ADD `order` integer;--> statement-breakpoint
ALTER TABLE `cooking_sections` ADD `is_image_submission_allowed` integer;--> statement-breakpoint
ALTER TABLE `cooking_sections` ADD `assigned_to` text;--> statement-breakpoint
ALTER TABLE `cooking_sections` ADD `is_generating` integer;--> statement-breakpoint
ALTER TABLE `accounts` ADD `password` text;--> statement-breakpoint
ALTER TABLE `cooking_images` ADD `comment` text;--> statement-breakpoint
ALTER TABLE `tools_apps` ADD `view_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `tools_apps` ADD `play_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `tools_apps` ADD `remix_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `tools_apps` ADD `remix_from` text REFERENCES tools_apps(id);