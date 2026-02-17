CREATE TABLE `custom_agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`agent_id` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`color` varchar(100) NOT NULL,
	`avatar_seed` varchar(255) NOT NULL,
	`system_prompt` text NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `custom_agents_id` PRIMARY KEY(`id`)
);
