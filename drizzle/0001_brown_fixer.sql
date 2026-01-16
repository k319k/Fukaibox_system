PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cooking_images` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text,
	`project_id` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`image_url` text NOT NULL,
	`is_selected` integer DEFAULT false,
	`is_final_selected` integer DEFAULT false,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `cooking_sections`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`project_id`) REFERENCES `cooking_projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_cooking_images`("id", "section_id", "project_id", "uploaded_by", "image_url", "is_selected", "is_final_selected", "created_at") SELECT "id", "section_id", "project_id", "uploaded_by", "image_url", "is_selected", "is_final_selected", "created_at" FROM `cooking_images`;--> statement-breakpoint
DROP TABLE `cooking_images`;--> statement-breakpoint
ALTER TABLE `__new_cooking_images` RENAME TO `cooking_images`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_cooking_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'cooking' NOT NULL,
	`created_by` text DEFAULT 'anonymous' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_cooking_projects`("id", "title", "description", "status", "created_by", "created_at", "updated_at") SELECT "id", "title", "description", "status", "created_by", "created_at", "updated_at" FROM `cooking_projects`;--> statement-breakpoint
DROP TABLE `cooking_projects`;--> statement-breakpoint
ALTER TABLE `__new_cooking_projects` RENAME TO `cooking_projects`;