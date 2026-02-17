CREATE TABLE `agent_states` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`agent_id` varchar(100) NOT NULL,
	`mood` varchar(50) NOT NULL DEFAULT 'neutral',
	`last_reflection` text NOT NULL,
	`relationships` text NOT NULL,
	CONSTRAINT `agent_states_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`sender` varchar(100) NOT NULL,
	`sender_name` varchar(255) NOT NULL,
	`text` text NOT NULL,
	`color` varchar(100) NOT NULL,
	`timestamp` bigint NOT NULL,
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
