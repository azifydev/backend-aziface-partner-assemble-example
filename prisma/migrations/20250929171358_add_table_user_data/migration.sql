-- CreateTable
CREATE TABLE `user_data` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `user_id` CHAR(36) NOT NULL,
    `key` VARCHAR(255) NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` TIMESTAMP(0) NULL,

    INDEX `fk_user_data_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_data` ADD CONSTRAINT `fk_user_data_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
