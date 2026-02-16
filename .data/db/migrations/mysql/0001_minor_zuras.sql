CREATE TABLE `conversations` (
  `id` int AUTO_INCREMENT NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255),
  `created_at` timestamp,
  `updated_at` timestamp,
  CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
  `id` int AUTO_INCREMENT NOT NULL,
  `conversation_id` int NOT NULL,
  `sender` varchar(32) NOT NULL,
  `role` varchar(32) NOT NULL,
  `content` text NOT NULL,
  `metadata` json,
  `created_at` timestamp,
  CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);