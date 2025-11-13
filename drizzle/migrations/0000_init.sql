CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`age` int,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
